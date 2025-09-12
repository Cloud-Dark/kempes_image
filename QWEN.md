# Kempes - Image Compressor CLI

## Project Overview

Kempes is a Node.js-based command-line interface (CLI) tool designed for efficient image compression. It supports various input formats (JPG, PNG, WebP, BMP, TIFF, GIF) and can output images in JPG, PNG, or WebP formats. The tool allows users to control compression quality, specify source and output directories, and handles images with transparency appropriately (e.g., converting images with alpha channels to PNG when JPG is requested).

Key technologies used:
- **Node.js**: Runtime environment.
- **Sharp**: High-performance image processing library.
- **Commander.js**: CLI framework for parsing arguments.
- **Glob**: File pattern matching.
- **Colors**: Console color formatting.

## Building and Running

### Prerequisites
- Node.js version 14 or higher.
- npm (Node Package Manager).

### Installation
1. Clone or download the project.
2. Navigate to the project directory.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Install the CLI globally or link it:
   ```bash
   # Option 1: Install globally
   npm install -g .

   # Option 2: Create a symlink
   npm link
   ```

### Usage
After installation, the tool can be run using the `kempes` command.

#### Basic Commands
- Display help: `kempes` or `kempes --help`
- Check version: `kempes --version`

#### Common Operations
- Compress images to JPG (default quality 70%): `kempes -t=jpg`
- Compress images to PNG: `kempes -t=png`
- Compress images to WebP: `kempes -t=webp`
- Compress images while preserving original formats: `kempes -t -q=80`
- Compress with custom quality (e.g., 80%): `kempes -t=jpg -q=80`
- Specify output folder: `kempes -t=jpg -o=compressed`
- Compress images from a specific source folder: `kempes -s=images -t=jpg`
- Full example: `kempes -s=source -t=webp -q=80 -o=output`

#### Parameters
| Parameter | Alias | Description                       | Default                    |
|-----------|-------|-----------------------------------|----------------------------|
| `--type`  | `-t`  | Output format (jpg, png, webp) - jika tidak diset maka format asli dipertahankan | jpg |
| `--output`| `-o`  | Output folder                     | Compress in place          |
| `--source`| `-s`  | Source folder                     | Current directory (`.`)    |
| `--quality`| `-q` | Compression quality (1-100)       | 70                         |

### Development
1. Clone the repository.
2. Install dependencies: `npm install`.
3. Link the package for development: `npm link`.

### Testing
Currently, there are no automated tests configured. The `npm test` script will output an error message indicating no test is specified.

## Development Conventions
- The main entry point is `index.js`.
- Dependencies are managed via `package.json`.
- Image processing is handled by the `sharp` library.
- CLI argument parsing and help generation are managed by `commander`.
- File system operations use Node.js built-in modules (`fs`, `path`).
- Console output uses colors for better readability, implemented with the `colors` library.
- File pattern matching for finding images uses the `glob` library.