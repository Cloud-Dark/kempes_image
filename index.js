#!/usr/bin/env node

const { Command } = require('commander');
const sharp = require('sharp');
const glob = require('glob');
const path = require('path');
const fs = require('fs');
const colors = require('colors');

const program = new Command();

// Konfigurasi program
program
  .name('kempes')
  .description('CLI tool untuk kompresi gambar dengan berbagai format. Jika tidak dispesifikasikan format output, maka format asli gambar akan dipertahankan.')
  .version('1.0.0');

// Command utama
program
  .option('-t, --type [format]', 'format output (png, jpg, jpeg, webp, webm) - jika tidak diset maka format asli dipertahankan')
  .option('-o, --output <folder>', 'folder output (default: compress di tempat)')
  .option('-s, --source <folder>', 'folder sumber (default: current directory)', '.')
  .option('-q, --quality <number>', 'kualitas kompresi 1-100', '70')
  .action(async (options) => {
    // Handle special case where -t is passed without a value
    if (process.argv.includes('-t') && !process.argv[process.argv.indexOf('-t') + 1] || 
        process.argv[process.argv.indexOf('-t') + 1]?.startsWith('-')) {
      options.type = null; // Explicitly set to null to indicate preserve original
    }
    
    // Debug untuk melihat options yang diterima
    console.log('📋 Parameter yang diterima:'.cyan);
    console.log(`   Type: ${options.type === null ? 'preserve original' : options.type || 'preserve original'}`);
    console.log(`   Quality: ${options.quality}`);
    console.log(`   Source: ${options.source}`);
    console.log(`   Output: ${options.output || 'compress di tempat'}`);
    console.log('');

    try {
      await compressImages(options);
    } catch (error) {
      console.error('Error:'.red, error.message);
      process.exit(1);
    }
  });

// Fungsi untuk mendapatkan semua file gambar
function getImageFiles(sourceDir) {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'webp', 'bmp', 'tiff', 'gif'];
  const patterns = imageExtensions.map(ext => `${sourceDir}/**/*.${ext}`);
  
  let files = [];
  patterns.forEach(pattern => {
    const matches = glob.sync(pattern, { nocase: true });
    files = files.concat(matches);
  });
  
  return [...new Set(files)]; // Remove duplicates
}

// Fungsi untuk memastikan folder exists
function ensureDirectoryExists(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Fungsi untuk cek apakah gambar memiliki transparansi
async function hasTransparency(filePath) {
  try {
    const metadata = await sharp(filePath).metadata();
    return metadata.channels === 4 || metadata.hasAlpha === true;
  } catch (error) {
    return false;
  }
}

// Fungsi untuk menentukan format terbaik berdasarkan input
async function determineBestFormat(filePath, targetFormat) {
  // Jika target format adalah null/undefined, gunakan format asli
  if (targetFormat === null || targetFormat === undefined) {
    const originalExt = path.extname(filePath).toLowerCase().substring(1);
    return originalExt === 'jpg' ? 'jpeg' : originalExt; // Sharp menggunakan 'jpeg' bukan 'jpg'
  }
  
  const hasAlpha = await hasTransparency(filePath);
  
  // Jika target format tidak support transparansi tapi gambar ada alpha channel
  if (hasAlpha && ['jpg', 'jpeg'].includes(targetFormat.toLowerCase())) {
    console.log(`⚠️  ${path.basename(filePath)} memiliki transparansi, menggunakan PNG untuk mempertahankan alpha channel`.yellow);
    return 'png';
  }
  
  return targetFormat.toLowerCase();
}

// Fungsi utama untuk kompresi gambar
async function compressImages(options) {
  const { type, output, source, quality } = options;
  
  // Validasi format jika type dispesifikasikan
  if (type) {
    const supportedFormats = ['png', 'jpg', 'jpeg', 'webp', 'webm'];
    if (!supportedFormats.includes(type.toLowerCase())) {
      throw new Error(`Format ${type} tidak didukung. Format yang didukung: ${supportedFormats.join(', ')}`);
    }
  }

  // Validasi kualitas
  const qualityNum = parseInt(quality);
  if (isNaN(qualityNum) || qualityNum < 1 || qualityNum > 100) {
    throw new Error('Kualitas harus berupa angka antara 1-100');
  }

  // Dapatkan semua file gambar
  console.log(`🔍 Mencari file gambar di: ${source}`.cyan);
  const imageFiles = getImageFiles(source);
  
  if (imageFiles.length === 0) {
    console.log('⚠️  Tidak ada file gambar ditemukan'.yellow);
    return;
  }

  console.log(`📁 Ditemukan ${imageFiles.length} file gambar`.green);

  // Tentukan folder output
  let outputDir;
  if (output) {
    outputDir = path.resolve(output);
    ensureDirectoryExists(outputDir);
    console.log(`📂 Output akan disimpan di: ${outputDir}`.cyan);
  } else {
    console.log('📂 File akan dikompres di tempat'.cyan);
  }

  let processedCount = 0;
  let errorCount = 0;

  // Proses setiap file
  for (const filePath of imageFiles) {
    try {
      const fileName = path.basename(filePath, path.extname(filePath));
      const fileDir = path.dirname(filePath);
      
      // Tentukan format terbaik (cek transparansi)
      // Jika type tidak dispesifikasikan, gunakan format asli
      let finalFormat;
      if (type !== null && type !== undefined) {
        finalFormat = await determineBestFormat(filePath, type);
      } else {
        // Gunakan format asli file
        const originalExt = path.extname(filePath).toLowerCase().substring(1);
        // Pastikan format asli adalah format yang didukung
        if (['jpg', 'jpeg', 'png', 'webp'].includes(originalExt)) {
          // Untuk konsistensi, gunakan format asli dengan nama ekstensi asli
          finalFormat = originalExt;
        } else {
          // Untuk format lain, default ke jpeg
          finalFormat = 'jpg';
        }
      }
      
      // Tentukan path output
      let outputPath;
      let duplicatePath = null;
      if (output) {
        // Jika ada folder output yang ditentukan
        const relativePath = path.relative(source, fileDir);
        const targetDir = path.join(outputDir, relativePath);
        ensureDirectoryExists(targetDir);
        // Gunakan finalFormat untuk nama file jika mengonversi format, gunakan ekstensi asli jika mempertahankan format
        const fileExt = (type !== null && type !== undefined) ? finalFormat : path.extname(filePath).toLowerCase().substring(1);
        outputPath = path.join(targetDir, `${fileName}.${fileExt}`);
      } else {
        // Jika kompres di tempat, buat duplikat file dengan prefix "new_"
        const fileExt = (type !== null && type !== undefined) ? finalFormat : path.extname(filePath).toLowerCase().substring(1);
        duplicatePath = path.join(fileDir, `new_${fileName}.${fileExt}`);
        outputPath = duplicatePath;
      }

      // Skip jika file sudah sama (hanya jika tidak mengonversi format)
      if (type === null || type === undefined) {
        // Saat mempertahankan format, kita tetap akan memproses file untuk kompresi
        // Tidak perlu skip karena tujuan adalah kompresi, bukan konversi format
      } else {
        // Saat mengonversi format, skip jika file sudah dalam format target
        if (filePath === outputPath) {
          console.log(`⏭️  Skip: ${path.basename(filePath)} (sudah format ${finalFormat})`.gray);
          continue;
        }
      }

      // Proses kompresi
      console.log(`🔄 Memproses: ${path.basename(filePath)} → ${finalFormat.toUpperCase()}`.blue);
      
      // Simpan ukuran file asli sebelum diproses
      const originalStats = fs.statSync(filePath);
      
      let sharpInstance = sharp(filePath);
      
      // Terapkan format dan kualitas
      switch (finalFormat) {
        case 'jpg':
        case 'jpeg':
          sharpInstance = sharpInstance.jpeg({ quality: qualityNum });
          break;
        case 'png':
          // PNG menggunakan compressionLevel alih-alih quality
          const compressionLevel = Math.round((100 - qualityNum) / 10);
          sharpInstance = sharpInstance.png({ 
            compressionLevel: Math.max(0, Math.min(9, compressionLevel)),
            quality: qualityNum
          });
          break;
        case 'webp':
          sharpInstance = sharpInstance.webp({ quality: qualityNum });
          break;
        case 'webm':
          // WebM biasanya untuk video, tapi kita coba dengan WebP
          sharpInstance = sharpInstance.webp({ quality: qualityNum });
          break;
      }

      await sharpInstance.toFile(outputPath);
      
      // Jika menggunakan file duplikat, ganti file asli dengan file yang dikompres
      let finalOutputPath = outputPath;
      if (duplicatePath) {
        // Hapus file asli
        fs.unlinkSync(filePath);
        // Rename file duplikat menjadi nama file asli dengan ekstensi asli
        const originalExt = path.extname(filePath).toLowerCase().substring(1);
        const newFilePath = path.join(fileDir, `${fileName}.${originalExt}`);
        fs.renameSync(duplicatePath, newFilePath);
        finalOutputPath = newFilePath;
      }
      
      // Tampilkan info file
      const compressedStats = fs.statSync(finalOutputPath);
      const reduction = ((originalStats.size - compressedStats.size) / originalStats.size * 100).toFixed(1);
      
      console.log(`✅ Berhasil: ${path.basename(finalOutputPath)} (${formatBytes(originalStats.size)} → ${formatBytes(compressedStats.size)}, -${reduction}%)`.green);
      
      processedCount++;
    } catch (error) {
      console.error(`❌ Error memproses ${path.basename(filePath)}: ${error.message}`.red);
      errorCount++;
    }
  }

  // Summary
  console.log('\n📊 RINGKASAN:'.bold);
  console.log(`✅ Berhasil diproses: ${processedCount} file`.green);
  if (errorCount > 0) {
    console.log(`❌ Error: ${errorCount} file`.red);
  }
  console.log(`🎯 Format: ${type !== null && type !== undefined ? type.toUpperCase() : 'Preserve Original'}`.cyan);
  console.log(`🔧 Kualitas: ${quality}%`.cyan);
}

// Helper function untuk format ukuran file
function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Parse command line arguments
program.parse();

// Jika tidak ada arguments, tampilkan help
if (process.argv.length <= 2) {
  program.help();
}