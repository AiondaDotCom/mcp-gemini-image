import { FileManager } from '../src/file-manager';
import { promises as fs } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

jest.mock('fs', () => ({
  promises: {
    mkdir: jest.fn(),
    writeFile: jest.fn(),
  },
}));

jest.mock('path', () => ({
  join: jest.fn((...args) => args.join('/')),
}));

jest.mock('os', () => ({
  homedir: jest.fn(),
}));

describe('FileManager', () => {
  let fileManager: FileManager;
  const mockFs = fs as jest.Mocked<typeof fs>;
  const mockJoin = join as jest.MockedFunction<typeof join>;
  const mockHomedir = homedir as jest.MockedFunction<typeof homedir>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockHomedir.mockReturnValue('/home/user');
    mockJoin.mockImplementation((...args) => args.join('/'));
    fileManager = new FileManager();
  });

  describe('constructor', () => {
    it('should initialize with correct base directory', () => {
      expect(mockHomedir).toHaveBeenCalled();
      expect(mockJoin).toHaveBeenCalledWith('/home/user', 'Desktop');
    });
  });

  describe('ensureDirectoryExists', () => {
    it('should create directory successfully', async () => {
      mockFs.mkdir.mockResolvedValue(undefined);
      
      await fileManager.ensureDirectoryExists();
      
      expect(mockFs.mkdir).toHaveBeenCalledWith('/home/user/Desktop', { recursive: true });
    });

    it('should throw error when directory creation fails', async () => {
      const error = new Error('Permission denied');
      mockFs.mkdir.mockRejectedValue(error);
      
      await expect(fileManager.ensureDirectoryExists()).rejects.toThrow(
        'Failed to create directory: /home/user/Desktop'
      );
    });
  });

  describe('saveImage', () => {
    const mockImageData = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAI9jU/oZgAAAABJRU5ErkJggg==';

    beforeEach(() => {
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.writeFile.mockResolvedValue(undefined);
      
      jest.spyOn(Date.prototype, 'toISOString').mockReturnValue('2023-01-01T00:00:00.000Z');
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should save image with generated filename', async () => {
      const filePath = await fileManager.saveImage(mockImageData);
      
      expect(mockFs.mkdir).toHaveBeenCalledWith('/home/user/Desktop', { recursive: true });
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        '/home/user/Desktop/gemini-image-2023-01-01T00-00-00-000Z.png',
        Buffer.from(mockImageData, 'base64')
      );
      expect(filePath).toBe('/home/user/Desktop/gemini-image-2023-01-01T00-00-00-000Z.png');
    });

    it('should save image with custom filename', async () => {
      const customFilename = 'custom-image.png';
      const filePath = await fileManager.saveImage(mockImageData, customFilename);
      
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        '/home/user/Desktop/custom-image.png',
        Buffer.from(mockImageData, 'base64')
      );
      expect(filePath).toBe('/home/user/Desktop/custom-image.png');
    });

    it('should save image with metadata', async () => {
      const metadata = { prompt: 'test prompt', model: 'test-model' };
      const filePath = await fileManager.saveImage(mockImageData, undefined, metadata);
      
      expect(mockFs.writeFile).toHaveBeenCalledTimes(2);
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        '/home/user/Desktop/gemini-image-2023-01-01T00-00-00-000Z.png',
        Buffer.from(mockImageData, 'base64')
      );
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        '/home/user/Desktop/gemini-image-2023-01-01T00-00-00-000Z.png.json',
        JSON.stringify(metadata, null, 2)
      );
      expect(filePath).toBe('/home/user/Desktop/gemini-image-2023-01-01T00-00-00-000Z.png');
    });

    it('should throw error when image saving fails', async () => {
      const error = new Error('Write failed');
      mockFs.writeFile.mockRejectedValue(error);
      
      await expect(fileManager.saveImage(mockImageData)).rejects.toThrow(
        'Failed to save image: Error: Write failed'
      );
    });

    it('should throw error when directory creation fails', async () => {
      const error = new Error('Permission denied');
      mockFs.mkdir.mockRejectedValue(error);
      
      await expect(fileManager.saveImage(mockImageData)).rejects.toThrow(
        'Failed to create directory: /home/user/Desktop'
      );
    });
  });

  describe('saveImages', () => {
    const mockImageData1 = 'image1data';
    const mockImageData2 = 'image2data';
    const mockImages = [mockImageData1, mockImageData2];

    beforeEach(() => {
      mockFs.mkdir.mockResolvedValue(undefined);
      mockFs.writeFile.mockResolvedValue(undefined);
      
      let callCount = 0;
      jest.spyOn(Date.prototype, 'toISOString').mockImplementation(() => {
        callCount++;
        return `2023-01-01T00:00:0${callCount}.000Z`;
      });
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should save multiple images with generated filenames', async () => {
      const filePaths = await fileManager.saveImages(mockImages);
      
      expect(filePaths).toHaveLength(2);
      expect(filePaths[0]).toContain('gemini-image-1-');
      expect(filePaths[1]).toContain('gemini-image-2-');
      
      expect(mockFs.writeFile).toHaveBeenCalledTimes(4); // 2 images + 2 metadata files
    });

    it('should save multiple images with custom base filename', async () => {
      const baseFilename = 'custom-base';
      const filePaths = await fileManager.saveImages(mockImages, baseFilename);
      
      expect(filePaths).toHaveLength(2);
      expect(filePaths[0]).toContain('custom-base-1-');
      expect(filePaths[1]).toContain('custom-base-2-');
    });

    it('should save multiple images with metadata', async () => {
      const metadata = { prompt: 'test prompt', model: 'test-model' };
      const filePaths = await fileManager.saveImages(mockImages, undefined, metadata);
      
      expect(filePaths).toHaveLength(2);
      
      // Check that metadata was saved with correct index information
      const writeFileCalls = mockFs.writeFile.mock.calls;
      const metadataCalls = writeFileCalls.filter(call => String(call[0]).includes('.json'));
      
      expect(metadataCalls).toHaveLength(2);
      expect(metadataCalls[0][1]).toContain('"imageIndex": 1');
      expect(metadataCalls[0][1]).toContain('"totalImages": 2');
      expect(metadataCalls[1][1]).toContain('"imageIndex": 2');
      expect(metadataCalls[1][1]).toContain('"totalImages": 2');
    });

    it('should handle empty image array', async () => {
      const filePaths = await fileManager.saveImages([]);
      
      expect(filePaths).toHaveLength(0);
      expect(mockFs.writeFile).not.toHaveBeenCalled();
    });
  });

  describe('getImageDirectory', () => {
    it('should return correct image directory', () => {
      const directory = fileManager.getImageDirectory();
      
      expect(directory).toBe('/home/user/Desktop');
    });
  });
});