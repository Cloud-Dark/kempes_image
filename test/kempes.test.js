const { getImageFiles, determineBestFormat, formatBytes, ensureDirectoryExists } = require('../index');
const fs = require('fs');
const path = require('path');

// Mock the dependencies
jest.mock('glob', () => ({
  sync: jest.fn()
}));

jest.mock('sharp', () => {
  return jest.fn().mockImplementation(() => ({
    metadata: jest.fn(),
    jpeg: jest.fn().mockReturnThis(),
    png: jest.fn().mockReturnThis(),
    webp: jest.fn().mockReturnThis(),
    toFile: jest.fn()
  }));
});

// Mock fs
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  mkdirSync: jest.fn()
}));

const sharp = require('sharp');
const glob = require('glob');
const fsMock = require('fs');

describe('Kempes Image Compressor', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('ensureDirectoryExists', () => {
    it('should create directory if it does not exist', () => {
      fsMock.existsSync.mockReturnValue(false);
      
      ensureDirectoryExists('/path/to/directory');
      
      expect(fsMock.existsSync).toHaveBeenCalledWith('/path/to/directory');
      expect(fsMock.mkdirSync).toHaveBeenCalledWith('/path/to/directory', { recursive: true });
    });

    it('should not create directory if it already exists', () => {
      fsMock.existsSync.mockReturnValue(true);
      
      ensureDirectoryExists('/path/to/directory');
      
      expect(fsMock.existsSync).toHaveBeenCalledWith('/path/to/directory');
      expect(fsMock.mkdirSync).not.toHaveBeenCalled();
    });
  });

  describe('getImageFiles', () => {
    it('should return image files from a directory', () => {
      const mockFiles = [
        '/path/to/image.jpg',
        '/path/to/image.png',
        '/path/to/image.webp'
      ];
      
      glob.sync.mockImplementation((pattern) => {
        if (pattern.includes('jpg')) return [mockFiles[0]];
        if (pattern.includes('png')) return [mockFiles[1]];
        if (pattern.includes('webp')) return [mockFiles[2]];
        return [];
      });
      
      const result = getImageFiles('/path/to');
      
      expect(result).toEqual(mockFiles);
      expect(glob.sync).toHaveBeenCalledTimes(7); // 7 image extensions
    });
  });

  describe('formatBytes', () => {
    it('should format bytes correctly', () => {
      expect(formatBytes(0)).toBe('0 Bytes');
      expect(formatBytes(1024)).toBe('1 KB');
      expect(formatBytes(1048576)).toBe('1 MB');
      expect(formatBytes(1073741824)).toBe('1 GB');
    });
  });

  describe('determineBestFormat', () => {
    it('should preserve original format when type is null', async () => {
      const result = await determineBestFormat('/path/to/image.jpg', null);
      expect(result).toBe('jpeg');
    });

    it('should return specified format when no transparency', async () => {
      sharp.mockImplementation(() => ({
        metadata: jest.fn().mockResolvedValue({ channels: 3 })
      }));

      const result = await determineBestFormat('/path/to/image.png', 'jpg');
      expect(result).toBe('jpg');
    });

    it('should use PNG for images with transparency when JPG is requested', async () => {
      sharp.mockImplementation(() => ({
        metadata: jest.fn().mockResolvedValue({ channels: 4 })
      }));

      const result = await determineBestFormat('/path/to/image.png', 'jpg');
      expect(result).toBe('png');
    });
  });
});