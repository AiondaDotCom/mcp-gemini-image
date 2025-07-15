import { ImageGenerator } from '../src/image-generator';
import { ConfigManager } from '../src/config-manager';
import { FileManager } from '../src/file-manager';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ImageGenerationRequest } from '../src/types';

jest.mock('@google/generative-ai');
jest.mock('../src/config-manager');
jest.mock('../src/file-manager');

describe('ImageGenerator', () => {
  let imageGenerator: ImageGenerator;
  let mockConfigManager: jest.Mocked<ConfigManager>;
  let mockFileManager: jest.Mocked<FileManager>;
  let mockGoogleGenerativeAI: jest.Mocked<GoogleGenerativeAI>;
  let mockGenerativeModel: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockConfigManager = {
      getConfig: jest.fn(),
      validateConfig: jest.fn(),
    } as any;
    
    mockFileManager = {
      saveImages: jest.fn(),
    } as any;
    
    mockGenerativeModel = {
      generateContent: jest.fn(),
    };
    
    mockGoogleGenerativeAI = {
      getGenerativeModel: jest.fn().mockReturnValue(mockGenerativeModel),
    } as any;
    
    (GoogleGenerativeAI as jest.MockedClass<typeof GoogleGenerativeAI>).mockImplementation(() => mockGoogleGenerativeAI);
    
    mockConfigManager.getConfig.mockReturnValue({
      apiKey: 'test-api-key',
      projectId: 'test-project'
    });
    
    imageGenerator = new ImageGenerator(mockConfigManager, mockFileManager);
  });

  describe('constructor', () => {
    it('should initialize with config manager and file manager', () => {
      expect(mockConfigManager.getConfig).toHaveBeenCalled();
      expect(GoogleGenerativeAI).toHaveBeenCalledWith('test-api-key');
    });

    it('should not initialize client when no API key is provided', () => {
      jest.clearAllMocks();
      mockConfigManager.getConfig.mockReturnValue({
        apiKey: '',
        projectId: undefined
      });
      
      new ImageGenerator(mockConfigManager, mockFileManager);
      
      expect(GoogleGenerativeAI).not.toHaveBeenCalled();
    });
  });

  describe('generateImage', () => {
    const mockRequest: ImageGenerationRequest = {
      prompt: 'Test prompt',
      model: 'gemini-2.0-flash-exp',
      aspect_ratio: 'square',
      num_images: 1,
      person_generation: 'allow_adult',
      filename: 'test-image'
    };

    beforeEach(() => {
      mockFileManager.saveImages.mockResolvedValue(['/path/to/image1.png']);
      
      mockGenerativeModel.generateContent.mockResolvedValue({
        response: {
          candidates: [{
            content: {
              parts: [{
                inlineData: {
                  data: 'base64-image-data'
                }
              }]
            }
          }]
        }
      });
    });

    it('should generate image successfully', async () => {
      const result = await imageGenerator.generateImage(mockRequest);
      
      expect(mockConfigManager.validateConfig).toHaveBeenCalled();
      expect(mockGoogleGenerativeAI.getGenerativeModel).toHaveBeenCalledWith({
        model: 'gemini-2.0-flash-exp'
      });
      expect(mockGenerativeModel.generateContent).toHaveBeenCalledWith({
        contents: [{
          role: 'user',
          parts: [{ text: 'Test prompt' }]
        }],
        generationConfig: {
          responseModalities: ['TEXT', 'IMAGE']
        }
      });
      expect(mockFileManager.saveImages).toHaveBeenCalledWith(
        ['base64-image-data'],
        'test-image',
        {
          model: 'gemini-2.0-flash-exp',
          prompt: 'Test prompt',
          aspect_ratio: 'square',
          num_images: 1,
          timestamp: expect.any(String)
        }
      );
      
      expect(result).toEqual({
        images: ['base64-image-data'],
        filePaths: ['/path/to/image1.png'],
        metadata: {
          model: 'gemini-2.0-flash-exp',
          prompt: 'Test prompt',
          aspect_ratio: 'square',
          num_images: 1,
          timestamp: expect.any(String)
        }
      });
    });

    it('should use default model when not specified', async () => {
      const requestWithoutModel = { ...mockRequest };
      delete requestWithoutModel.model;
      
      await imageGenerator.generateImage(requestWithoutModel);
      
      expect(mockGoogleGenerativeAI.getGenerativeModel).toHaveBeenCalledWith({
        model: 'gemini-2.0-flash-exp'
      });
    });

    it('should handle multiple images', async () => {
      const multiImageRequest = {
        ...mockRequest,
        num_images: 2
      };
      
      mockGenerativeModel.generateContent.mockResolvedValue({
        response: {
          candidates: [{
            content: {
              parts: [
                { inlineData: { data: 'image1-data' } },
                { inlineData: { data: 'image2-data' } }
              ]
            }
          }]
        }
      });
      
      mockFileManager.saveImages.mockResolvedValue(['/path/to/image1.png', '/path/to/image2.png']);
      
      const result = await imageGenerator.generateImage(multiImageRequest);
      
      expect(mockGenerativeModel.generateContent).toHaveBeenCalledWith({
        contents: [{
          role: 'user',
          parts: [{ text: 'Test prompt' }]
        }],
        generationConfig: {
          responseModalities: ['TEXT', 'IMAGE']
        }
      });
      
      expect(result.images).toEqual(['image1-data', 'image2-data']);
    });

    it('should generate image with simplified config', async () => {
      const portraitRequest = { ...mockRequest, aspect_ratio: 'portrait' as const };
      await imageGenerator.generateImage(portraitRequest);
      
      expect(mockGenerativeModel.generateContent).toHaveBeenCalledWith(
        expect.objectContaining({
          generationConfig: {
            responseModalities: ['TEXT', 'IMAGE']
          }
        })
      );
    });

    it('should validate number of images for gemini model', async () => {
      const geminiRequest = {
        ...mockRequest,
        model: 'gemini-2.0-flash-exp' as const,
        num_images: 5
      };
      
      await expect(imageGenerator.generateImage(geminiRequest)).rejects.toThrow(
        'Number of images must be between 1 and 4 for model gemini-2.0-flash-exp'
      );
    });

    it('should validate number of images for standard model', async () => {
      const invalidRequest = {
        ...mockRequest,
        num_images: 5
      };
      
      await expect(imageGenerator.generateImage(invalidRequest)).rejects.toThrow(
        'Number of images must be between 1 and 4 for model gemini-2.0-flash-exp'
      );
    });

    it('should throw error when config validation fails', async () => {
      mockConfigManager.validateConfig.mockImplementation(() => {
        throw new Error('API key is required');
      });
      
      await expect(imageGenerator.generateImage(mockRequest)).rejects.toThrow('API key is required');
    });

    it('should throw error when no images are generated', async () => {
      mockGenerativeModel.generateContent.mockResolvedValue({
        response: {
          candidates: []
        }
      });
      
      await expect(imageGenerator.generateImage(mockRequest)).rejects.toThrow(
        'No images generated from the API response'
      );
    });

    it('should throw error when API call fails', async () => {
      mockGenerativeModel.generateContent.mockRejectedValue(new Error('API Error'));
      
      await expect(imageGenerator.generateImage(mockRequest)).rejects.toThrow(
        'Image generation failed: API Error'
      );
    });

    it('should initialize client if not already initialized', async () => {
      mockConfigManager.getConfig.mockReturnValue({
        apiKey: '',
        projectId: undefined
      });
      
      const newImageGenerator = new ImageGenerator(mockConfigManager, mockFileManager);
      
      mockConfigManager.getConfig.mockReturnValue({
        apiKey: 'new-api-key',
        projectId: undefined
      });
      
      await newImageGenerator.generateImage(mockRequest);
      
      expect(GoogleGenerativeAI).toHaveBeenCalledWith('new-api-key');
    });

    it('should throw error when client cannot be initialized', async () => {
      mockConfigManager.getConfig.mockReturnValue({
        apiKey: '',
        projectId: undefined
      });
      
      const newImageGenerator = new ImageGenerator(mockConfigManager, mockFileManager);
      
      await expect(newImageGenerator.generateImage(mockRequest)).rejects.toThrow(
        'Google Generative AI client not initialized'
      );
    });
  });

  describe('mapAspectRatio', () => {
    it('should map aspect ratios correctly', () => {
      const generator = imageGenerator as any;
      
      expect(generator.mapAspectRatio('square')).toBe('1:1');
      expect(generator.mapAspectRatio('portrait')).toBe('3:4');
      expect(generator.mapAspectRatio('landscape')).toBe('4:3');
      expect(generator.mapAspectRatio('invalid')).toBe('1:1');
    });
  });

  describe('validateNumImages', () => {
    it('should validate number of images for different models', () => {
      const generator = imageGenerator as any;
      
      expect(generator.validateNumImages(1, 'gemini-2.0-flash-exp')).toBe(1);
      expect(generator.validateNumImages(4, 'gemini-2.0-flash-exp')).toBe(4);
      
      expect(() => generator.validateNumImages(5, 'gemini-2.0-flash-exp')).toThrow();
      expect(() => generator.validateNumImages(0, 'gemini-2.0-flash-exp')).toThrow();
    });
  });

  describe('updateConfig', () => {
    it('should reinitialize the client', () => {
      mockConfigManager.getConfig.mockReturnValue({
        apiKey: 'updated-api-key',
        projectId: 'updated-project'
      });
      
      imageGenerator.updateConfig();
      
      expect(GoogleGenerativeAI).toHaveBeenCalledWith('updated-api-key');
    });
  });

  describe('extractImagesFromResponse', () => {
    it('should extract images from complex response structure', () => {
      const generator = imageGenerator as any;
      
      const response = {
        candidates: [
          {
            content: {
              parts: [
                { text: 'Some text' },
                { inlineData: { data: 'image1-data' } },
                { inlineData: { data: 'image2-data' } }
              ]
            }
          },
          {
            content: {
              parts: [
                { inlineData: { data: 'image3-data' } }
              ]
            }
          }
        ]
      };
      
      const images = generator.extractImagesFromResponse(response);
      
      expect(images).toEqual(['image1-data', 'image2-data', 'image3-data']);
    });

    it('should handle response with no images', () => {
      const generator = imageGenerator as any;
      
      const response = {
        candidates: [{
          content: {
            parts: [{ text: 'Only text' }]
          }
        }]
      };
      
      const images = generator.extractImagesFromResponse(response);
      
      expect(images).toEqual([]);
    });

    it('should handle malformed response', () => {
      const generator = imageGenerator as any;
      
      const response = { invalid: 'response' };
      const images = generator.extractImagesFromResponse(response);
      
      expect(images).toEqual([]);
    });
  });
});