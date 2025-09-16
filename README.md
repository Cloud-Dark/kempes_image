# Kempes - Image Compressor CLI

[![GitHub](https://img.shields.io/github/license/Cloud-Dark/kempes_image)](https://github.com/Cloud-Dark/kempes_image)
[![npm](https://img.shields.io/npm/v/kempes)](https://www.npmjs.com/package/kempes)

Aplikasi CLI untuk kompresi gambar dengan berbagai format dan opsi kustomisasi.

Repository: https://github.com/Cloud-Dark/kempes_image

## 📦 Instalasi

### 1. Instalasi Global

```bash
# Clone atau download project ini
# Masuk ke folder project
cd kempes

# Install dependencies
npm install

# Install secara global
npm install -g .

# Atau bisa juga dengan npm link
npm link
```

### 2. Verifikasi Instalasi

```bash
kempes --version
kempes --help
```

## 🚀 Cara Penggunaan

### Help Command
```bash
kempes
# atau
kempes --help
```

### Basic Usage

#### Kompres semua gambar ke format tertentu
```bash
# Kompres ke JPG (default quality 70%)
kempes -t=jpg

# Kompres ke PNG
kempes -t=png

# Kompres ke WebP
kempes -t=webp
```

#### Kompres semua gambar dengan kualitas tertentu (pertahankan format asli)
```bash
# Kompres semua gambar dengan kualitas 80% tanpa mengubah format
kempes -t -q=80

# Atau cukup
kempes -t -q 80
```

#### Dengan Quality Control
```bash
# Kompres ke JPG dengan kualitas 80%
kempes -t=jpg -q=80

# Kompres ke WebP dengan kualitas 50%
kempes -t=webp -q=50
```

#### Dengan Output Folder
```bash
# Kompres dan simpan di folder 'compressed'
kempes -t=jpg -o=compressed

# Kompres dengan kualitas dan folder output
kempes -t=webp -q=85 -o=output
```

#### Pertahankan format asli dengan kualitas tertentu
```bash
# Kompres semua gambar dengan kualitas 80% tanpa mengubah format
kempes -t -q=80

# Kompres semua gambar dengan kualitas 80% tanpa mengubah format, simpan di folder 'compressed'
kempes -t -q=80 -o=compressed
```

#### Dengan Source Folder Spesifik
```bash
# Kompres gambar dari folder 'images'
kempes -s=images -t=jpg

# Kompres dari folder tertentu ke folder output
kempes -s=photos -t=webp -o=compressed -q=75
```

### Contoh Lengkap
```bash
# Kompres semua gambar di folder 'source', 
# konvert ke WebP kualitas 80%, 
# simpan di folder 'output'
kempes -s=source -t=webp -q=80 -o=output
```

## 📋 Parameter

| Parameter | Alias | Deskripsi | Default |
|-----------|-------|-----------|---------|
| `--type` | `-t` | Format output (jpg, png, webp, webm) - jika tidak diset maka format asli dipertahankan | jpg |
| `--output` | `-o` | Folder output | compress di tempat |
| `--source` | `-s` | Folder sumber | current directory (.) |
| `--quality` | `-q` | Kualitas kompresi (1-100) | 70 |

## 🎯 Format yang Didukung

### Input
- JPG/JPEG
- PNG  
- WebP
- BMP
- TIFF
- GIF

### Output
- JPG/JPEG
- PNG
- WebP
- WebM (sebagai WebP)

## 💡 Tips Penggunaan

1. **Backup Original**: Selalu backup gambar original sebelum kompresi
2. **Quality Setting**: 
   - 90-100: Kualitas sangat tinggi, file besar
   - 70-89: Kualitas tinggi, seimbang
   - 50-69: Kualitas sedang, file lebih kecil
   - 30-49: Kualitas rendah, file sangat kecil
3. **Format WebP**: Memberikan kompresi terbaik untuk web
4. **Batch Processing**: Tool ini otomatis memproses semua gambar dalam folder

## 🛠️ Development

### Requirements
- Node.js >= 14
- npm atau yarn

### Dependencies
- `sharp`: Image processing
- `commander`: CLI framework
- `glob`: File pattern matching  
- `colors`: Console colors

### Build dari Source
```bash
git clone https://github.com/Cloud-Dark/kempes_image.git
cd kempes_image
npm install
npm link
```

## 🧪 Unit Tests

This project includes unit tests to verify functionality. To run the tests:

```bash
npm test
```

The tests are located in the `test/` directory and use Jest as the testing framework.

### Test Coverage

Current tests cover:
- Image file detection functionality
- File size formatting
- Transparent image handling
- Directory creation
- Format determination logic

## 📄 Lisensi

MIT License

## 🐛 Bug Reports & Feature Requests

Silakan buat issue di repository ini untuk bug reports atau feature requests.

## 🤝 Contributing

Pull requests are welcome! Please read the contributing guidelines first.