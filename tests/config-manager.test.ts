import { ConfigManager } from '../src/config-manager';
import { GeminiConfig } from '../src/types';
import { promises as fs } from 'fs';
import { join } from 'path';

// Mock fs operations
jest.mock('fs', () => ({
  promises: {
    readFile: jest.fn(),
    writeFile: jest.fn(),
    mkdir: jest.fn(),
  }
}));

describe('ConfigManager', () => {
  let configManager: ConfigManager;
  const mockFs = fs as jest.Mocked<typeof fs>;

  beforeEach(async () => {
    delete process.env.GOOGLE_API_KEY;
    delete process.env.GOOGLE_PROJECT_ID;
    jest.clearAllMocks();
    
    // Mock readFile to simulate no config file exists
    mockFs.readFile.mockRejectedValue(new Error('File not found'));
    
    configManager = new ConfigManager();
    // Wait for async constructor to complete
    await new Promise(resolve => setTimeout(resolve, 0));
  });

  afterEach(() => {
    delete process.env.GOOGLE_API_KEY;
    delete process.env.GOOGLE_PROJECT_ID;
  });

  describe('constructor', () => {
    it('should initialize with empty config when no environment variables are set', () => {
      const config = configManager.getConfig();
      expect(config.apiKey).toBe('');
      expect(config.projectId).toBeUndefined();
    });

    it('should not load configuration from environment variables', () => {
      process.env.GOOGLE_API_KEY = 'test-api-key';
      process.env.GOOGLE_PROJECT_ID = 'test-project-id';
      
      const newConfigManager = new ConfigManager();
      const config = newConfigManager.getConfig();
      
      expect(config.apiKey).toBe('');
      expect(config.projectId).toBeUndefined();
    });
  });

  describe('setConfig', () => {
    it('should set API key when provided', async () => {
      const newConfig: Partial<GeminiConfig> = {
        apiKey: 'new-api-key'
      };
      
      await configManager.setConfig(newConfig);
      const config = configManager.getConfig();
      
      expect(config.apiKey).toBe('new-api-key');
      expect(mockFs.writeFile).toHaveBeenCalled();
    });

    it('should set project ID when provided', async () => {
      const newConfig: Partial<GeminiConfig> = {
        projectId: 'new-project-id'
      };
      
      await configManager.setConfig(newConfig);
      const config = configManager.getConfig();
      
      expect(config.projectId).toBe('new-project-id');
      expect(mockFs.writeFile).toHaveBeenCalled();
    });

    it('should set both API key and project ID when provided', async () => {
      const newConfig: Partial<GeminiConfig> = {
        apiKey: 'new-api-key',
        projectId: 'new-project-id'
      };
      
      await configManager.setConfig(newConfig);
      const config = configManager.getConfig();
      
      expect(config.apiKey).toBe('new-api-key');
      expect(config.projectId).toBe('new-project-id');
      expect(mockFs.writeFile).toHaveBeenCalled();
    });

    it('should not change existing values when undefined is passed', async () => {
      await configManager.setConfig({ apiKey: 'initial-key' });
      await configManager.setConfig({ projectId: 'initial-project' });
      
      await configManager.setConfig({});
      const config = configManager.getConfig();
      
      expect(config.apiKey).toBe('initial-key');
      expect(config.projectId).toBe('initial-project');
      expect(mockFs.writeFile).toHaveBeenCalledTimes(3);
    });

    it('should save config to file', async () => {
      await configManager.setConfig({ apiKey: 'test-key' });
      
      expect(mockFs.writeFile).toHaveBeenCalledWith(
        expect.stringContaining('.mcp-gemini-image.json'),
        JSON.stringify({ apiKey: 'test-key', projectId: undefined }, null, 2),
        'utf-8'
      );
    });
  });

  describe('getConfig', () => {
    it('should return a copy of the config', async () => {
      await configManager.setConfig({ apiKey: 'test-key' });
      const config1 = configManager.getConfig();
      const config2 = configManager.getConfig();
      
      expect(config1).not.toBe(config2);
      expect(config1).toEqual(config2);
    });
  });

  describe('isConfigured', () => {
    it('should return false when no API key is set', () => {
      expect(configManager.isConfigured()).toBe(false);
    });

    it('should return false when API key is empty string', async () => {
      await configManager.setConfig({ apiKey: '' });
      expect(configManager.isConfigured()).toBe(false);
    });

    it('should return true when API key is set', async () => {
      await configManager.setConfig({ apiKey: 'test-key' });
      expect(configManager.isConfigured()).toBe(true);
    });
  });

  describe('getConfigStatus', () => {
    it('should return correct status when not configured', () => {
      const status = configManager.getConfigStatus();
      
      expect(status.configured).toBe(false);
      expect(status.apiKeySet).toBe(false);
      expect(status.projectIdSet).toBe(false);
      expect(status.availableModels).toHaveLength(1);
    });

    it('should return correct status when only API key is set', async () => {
      await configManager.setConfig({ apiKey: 'test-key' });
      const status = configManager.getConfigStatus();
      
      expect(status.configured).toBe(true);
      expect(status.apiKeySet).toBe(true);
      expect(status.projectIdSet).toBe(false);
      expect(status.availableModels).toHaveLength(1);
    });

    it('should return correct status when both API key and project ID are set', async () => {
      await configManager.setConfig({ apiKey: 'test-key', projectId: 'test-project' });
      const status = configManager.getConfigStatus();
      
      expect(status.configured).toBe(true);
      expect(status.apiKeySet).toBe(true);
      expect(status.projectIdSet).toBe(true);
      expect(status.availableModels).toHaveLength(1);
    });
  });

  describe('getSupportedModels', () => {
    it('should return supported models', () => {
      const models = configManager.getSupportedModels();
      
      expect(models).toHaveLength(1);
      expect(models[0]).toEqual({
        id: 'gemini-2.0-flash-exp',
        name: 'Gemini 2.0 Flash Experimental',
        description: 'Generate high-quality images using Gemini 2.0 Flash experimental model with conversational image generation',
        maxImages: 4,
        features: ['high-quality', 'conversational', 'multimodal', 'text-image', 'experimental']
      });
    });
  });

  describe('validateConfig', () => {
    it('should throw error when API key is not set', () => {
      expect(() => {
        configManager.validateConfig();
      }).toThrow('Google API key is required. Please configure it using the configure-server tool.');
    });

    it('should throw error when API key is empty string', async () => {
      await configManager.setConfig({ apiKey: '' });
      expect(() => {
        configManager.validateConfig();
      }).toThrow('Google API key is required. Please configure it using the configure-server tool.');
    });

    it('should not throw error when API key is set', async () => {
      await configManager.setConfig({ apiKey: 'test-key' });
      expect(() => {
        configManager.validateConfig();
      }).not.toThrow();
    });
  });

  describe('loadConfig', () => {
    it('should load config from file if it exists', async () => {
      const mockConfigData = {
        apiKey: 'saved-api-key',
        projectId: 'saved-project-id'
      };
      
      mockFs.readFile.mockResolvedValueOnce(JSON.stringify(mockConfigData));
      
      const newConfigManager = new ConfigManager();
      await new Promise(resolve => setTimeout(resolve, 10)); // Wait for async loadConfig
      
      const config = newConfigManager.getConfig();
      expect(config.apiKey).toBe('saved-api-key');
      expect(config.projectId).toBe('saved-project-id');
    });

    it('should handle missing config file gracefully', async () => {
      mockFs.readFile.mockRejectedValueOnce(new Error('File not found'));
      
      const newConfigManager = new ConfigManager();
      await new Promise(resolve => setTimeout(resolve, 10)); // Wait for async loadConfig
      
      const config = newConfigManager.getConfig();
      expect(config.apiKey).toBe('');
      expect(config.projectId).toBeUndefined();
    });
  });
});