import { ConfigManager } from '../src/config-manager';
import { ImageGenerator } from '../src/image-generator';
import { FileManager } from '../src/file-manager';

jest.mock('../src/config-manager');
jest.mock('../src/image-generator');
jest.mock('../src/file-manager');

// Mock MCP SDK modules completely
jest.mock('@modelcontextprotocol/sdk/server/index.js', () => ({
  Server: jest.fn().mockImplementation(() => ({
    setRequestHandler: jest.fn(),
    connect: jest.fn(),
  })),
}));

jest.mock('@modelcontextprotocol/sdk/server/stdio.js', () => ({
  StdioServerTransport: jest.fn().mockImplementation(() => ({})),
}));

jest.mock('@modelcontextprotocol/sdk/types.js', () => ({
  CallToolRequestSchema: 'CallToolRequestSchema',
  ListToolsRequestSchema: 'ListToolsRequestSchema',
}));

// Import after mocking
import { GeminiImageServer } from '../src/server';
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

describe('GeminiImageServer', () => {
  let server: GeminiImageServer;
  let mockConfigManager: jest.Mocked<ConfigManager>;
  let mockImageGenerator: jest.Mocked<ImageGenerator>;
  let mockFileManager: jest.Mocked<FileManager>;
  let mockServer: any;
  let mockTransport: any;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockConfigManager = {
      setConfig: jest.fn(),
      getConfigStatus: jest.fn(),
      getSupportedModels: jest.fn(),
      isConfigured: jest.fn(),
    } as any;
    
    mockImageGenerator = {
      generateImage: jest.fn(),
      updateConfig: jest.fn(),
    } as any;
    
    mockFileManager = {
      getImageDirectory: jest.fn(),
    } as any;
    
    mockServer = {
      setRequestHandler: jest.fn(),
      connect: jest.fn(),
    };
    
    mockTransport = {};
    
    (ConfigManager as jest.MockedClass<typeof ConfigManager>).mockImplementation(() => mockConfigManager);
    (ImageGenerator as jest.MockedClass<typeof ImageGenerator>).mockImplementation(() => mockImageGenerator);
    (FileManager as jest.MockedClass<typeof FileManager>).mockImplementation(() => mockFileManager);
    (Server as jest.MockedClass<typeof Server>).mockImplementation(() => mockServer);
    (StdioServerTransport as jest.MockedClass<typeof StdioServerTransport>).mockImplementation(() => mockTransport);
    
    server = new GeminiImageServer();
  });

  describe('constructor', () => {
    it('should initialize all managers and server', () => {
      expect(ConfigManager).toHaveBeenCalled();
      expect(FileManager).toHaveBeenCalled();
      expect(ImageGenerator).toHaveBeenCalledWith(mockConfigManager, mockFileManager);
      expect(Server).toHaveBeenCalledWith(
        { name: 'mcp-gemini-image', version: '1.0.0' },
        { capabilities: { tools: {} } }
      );
      expect(mockServer.setRequestHandler).toHaveBeenCalledTimes(2);
    });
  });

  describe('tools', () => {
    it('should provide correct tool definitions', async () => {
      const toolsCall = mockServer.setRequestHandler.mock.calls[0];
      
      expect(toolsCall).toBeDefined();
      
      const toolsHandler = toolsCall![1];
      const result = await toolsHandler({ method: 'tools/list', params: {} } as any, {} as any);
      
      expect(result).toEqual({
        tools: expect.arrayContaining([
          expect.objectContaining({ name: 'generate-image' }),
          expect.objectContaining({ name: 'configure-server' }),
          expect.objectContaining({ name: 'get-config-status' }),
          expect.objectContaining({ name: 'list-supported-models' })
        ])
      });
    });
  });

  describe('tool handlers', () => {
    let toolHandler: any;

    beforeEach(() => {
      const toolCall = mockServer.setRequestHandler.mock.calls[1];
      toolHandler = toolCall![1];
    });

    describe('generate-image', () => {
      it('should handle successful image generation', async () => {
        mockConfigManager.isConfigured.mockReturnValue(true);
        
        const mockResult = {
          images: ['image-data'],
          filePaths: ['/path/to/image.png'],
          metadata: {
            model: 'imagen-4.0-generate-preview-06-06',
            prompt: 'test prompt',
            aspect_ratio: 'square',
            num_images: 1,
            timestamp: '2023-01-01T00:00:00.000Z'
          }
        };
        
        mockImageGenerator.generateImage.mockResolvedValue(mockResult);
        mockFileManager.getImageDirectory.mockReturnValue('/home/user/Desktop/gemini-images');
        
        const result = await toolHandler({
          method: 'tools/call',
          params: {
            name: 'generate-image',
            arguments: {
              prompt: 'test prompt',
              model: 'imagen-4.0-generate-preview-06-06',
              aspect_ratio: 'square',
              num_images: 1
            }
          }
        }, {} as any);
        
        expect(mockImageGenerator.generateImage).toHaveBeenCalledWith({
          prompt: 'test prompt',
          model: 'imagen-4.0-generate-preview-06-06',
          aspect_ratio: 'square',
          num_images: 1,
          person_generation: undefined,
          filename: undefined
        });
        
        expect(result).toEqual({
          content: [{
            type: 'text',
            text: expect.stringContaining('Successfully generated 1 image(s)')
          }]
        });
      });

      it('should return configuration prompt when not configured', async () => {
        mockConfigManager.isConfigured.mockReturnValue(false);
        
        const result = await toolHandler({
          method: 'tools/call',
          params: {
            name: 'generate-image',
            arguments: { prompt: 'test prompt' }
          }
        }, {} as any);
        
        expect(result).toEqual({
          content: [{
            type: 'text',
            text: expect.stringContaining('Server is not configured. Please use the "configure-server" tool')
          }]
        });
        
        expect(mockImageGenerator.generateImage).not.toHaveBeenCalled();
      });

      it('should handle image generation error', async () => {
        mockConfigManager.isConfigured.mockReturnValue(true);
        mockImageGenerator.generateImage.mockRejectedValue(new Error('Generation failed'));
        
        const result = await toolHandler({
          method: 'tools/call',
          params: {
            name: 'generate-image',
            arguments: { prompt: 'test prompt' }
          }
        }, {} as any);
        
        expect(result).toEqual({
          content: [{
            type: 'text',
            text: 'Error: Generation failed'
          }]
        });
      });
    });

    describe('configure-server', () => {
      it('should handle server configuration', async () => {
        const result = await toolHandler({
          method: 'tools/call',
          params: {
            name: 'configure-server',
            arguments: {
              api_key: 'test-api-key',
              project_id: 'test-project'
            }
          }
        }, {} as any);
        
        expect(mockConfigManager.setConfig).toHaveBeenCalledWith({
          apiKey: 'test-api-key',
          projectId: 'test-project'
        });
        expect(mockImageGenerator.updateConfig).toHaveBeenCalled();
        
        expect(result).toEqual({
          content: [{
            type: 'text',
            text: expect.stringContaining('Server configuration updated successfully')
          }]
        });
      });

      it('should handle configuration error', async () => {
        mockConfigManager.setConfig.mockImplementation(() => {
          throw new Error('Config error');
        });
        
        const result = await toolHandler({
          method: 'tools/call',
          params: {
            name: 'configure-server',
            arguments: { api_key: 'test-key' }
          }
        }, {} as any);
        
        expect(result).toEqual({
          content: [{
            type: 'text',
            text: 'Error: Config error'
          }]
        });
      });
    });

    describe('get-config-status', () => {
      it('should return configuration status', async () => {
        const mockStatus = {
          configured: true,
          apiKeySet: true,
          projectIdSet: false,
          availableModels: ['model1', 'model2']
        };
        
        mockConfigManager.getConfigStatus.mockReturnValue(mockStatus);
        mockFileManager.getImageDirectory.mockReturnValue('/home/user/Desktop/gemini-images');
        
        const result = await toolHandler({
          method: 'tools/call',
          params: {
            name: 'get-config-status',
            arguments: {}
          }
        }, {} as any);
        
        expect(result).toEqual({
          content: [{
            type: 'text',
            text: expect.stringContaining('Configuration Status:')
          }]
        });
      });

      it('should handle status error', async () => {
        mockConfigManager.getConfigStatus.mockImplementation(() => {
          throw new Error('Status error');
        });
        
        const result = await toolHandler({
          method: 'tools/call',
          params: {
            name: 'get-config-status',
            arguments: {}
          }
        }, {} as any);
        
        expect(result).toEqual({
          content: [{
            type: 'text',
            text: 'Error: Status error'
          }]
        });
      });
    });

    describe('list-supported-models', () => {
      it('should return supported models', async () => {
        mockConfigManager.isConfigured.mockReturnValue(true);
        
        const mockModels = [
          {
            id: 'model1',
            name: 'Model 1',
            description: 'Description 1',
            maxImages: 4,
            features: ['feature1', 'feature2']
          },
          {
            id: 'model2',
            name: 'Model 2',
            description: 'Description 2',
            maxImages: 1,
            features: ['feature3']
          }
        ];
        
        mockConfigManager.getSupportedModels.mockReturnValue(mockModels);
        
        const result = await toolHandler({
          method: 'tools/call',
          params: {
            name: 'list-supported-models',
            arguments: {}
          }
        }, {} as any);
        
        expect(result).toEqual({
          content: [{
            type: 'text',
            text: expect.stringContaining('Supported Google Gemini Image Generation Models:')
          }]
        });
      });

      it('should return configuration prompt when not configured', async () => {
        mockConfigManager.isConfigured.mockReturnValue(false);
        
        const result = await toolHandler({
          method: 'tools/call',
          params: {
            name: 'list-supported-models',
            arguments: {}
          }
        }, {} as any);
        
        expect(result).toEqual({
          content: [{
            type: 'text',
            text: expect.stringContaining('Server is not configured. Please use the "configure-server" tool')
          }]
        });
        
        expect(mockConfigManager.getSupportedModels).not.toHaveBeenCalled();
      });

      it('should handle models error', async () => {
        mockConfigManager.isConfigured.mockReturnValue(true);
        mockConfigManager.getSupportedModels.mockImplementation(() => {
          throw new Error('Models error');
        });
        
        const result = await toolHandler({
          method: 'tools/call',
          params: {
            name: 'list-supported-models',
            arguments: {}
          }
        }, {} as any);
        
        expect(result).toEqual({
          content: [{
            type: 'text',
            text: 'Error: Models error'
          }]
        });
      });
    });

    describe('unknown tool', () => {
      it('should handle unknown tool', async () => {
        const result = await toolHandler({
          method: 'tools/call',
          params: {
            name: 'unknown-tool',
            arguments: {}
          }
        }, {} as any);
        
        expect(result).toEqual({
          content: [{
            type: 'text',
            text: 'Error: Unknown tool: unknown-tool'
          }]
        });
      });
    });
  });

  describe('run', () => {
    it('should create transport and connect server', async () => {
      mockServer.connect.mockResolvedValue(undefined);
      
      await server.run();
      
      expect(mockServer.connect).toHaveBeenCalled();
    });

    it('should handle connection error', async () => {
      mockServer.connect.mockRejectedValue(new Error('Connection failed'));
      
      await expect(server.run()).rejects.toThrow('Connection failed');
    });
  });
});