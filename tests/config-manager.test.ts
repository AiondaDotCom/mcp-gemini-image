import { ConfigManager } from '../src/config-manager';
import { GeminiConfig } from '../src/types';

describe('ConfigManager', () => {
  let configManager: ConfigManager;

  beforeEach(() => {
    delete process.env.GOOGLE_API_KEY;
    delete process.env.GOOGLE_PROJECT_ID;
    configManager = new ConfigManager();
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
    it('should set API key when provided', () => {
      const newConfig: Partial<GeminiConfig> = {
        apiKey: 'new-api-key'
      };
      
      configManager.setConfig(newConfig);
      const config = configManager.getConfig();
      
      expect(config.apiKey).toBe('new-api-key');
    });

    it('should set project ID when provided', () => {
      const newConfig: Partial<GeminiConfig> = {
        projectId: 'new-project-id'
      };
      
      configManager.setConfig(newConfig);
      const config = configManager.getConfig();
      
      expect(config.projectId).toBe('new-project-id');
    });

    it('should set both API key and project ID when provided', () => {
      const newConfig: Partial<GeminiConfig> = {
        apiKey: 'new-api-key',
        projectId: 'new-project-id'
      };
      
      configManager.setConfig(newConfig);
      const config = configManager.getConfig();
      
      expect(config.apiKey).toBe('new-api-key');
      expect(config.projectId).toBe('new-project-id');
    });

    it('should not change existing values when undefined is passed', () => {
      configManager.setConfig({ apiKey: 'initial-key' });
      configManager.setConfig({ projectId: 'initial-project' });
      
      configManager.setConfig({});
      const config = configManager.getConfig();
      
      expect(config.apiKey).toBe('initial-key');
      expect(config.projectId).toBe('initial-project');
    });
  });

  describe('getConfig', () => {
    it('should return a copy of the config', () => {
      configManager.setConfig({ apiKey: 'test-key' });
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

    it('should return false when API key is empty string', () => {
      configManager.setConfig({ apiKey: '' });
      expect(configManager.isConfigured()).toBe(false);
    });

    it('should return true when API key is set', () => {
      configManager.setConfig({ apiKey: 'test-key' });
      expect(configManager.isConfigured()).toBe(true);
    });
  });

  describe('getConfigStatus', () => {
    it('should return correct status when not configured', () => {
      const status = configManager.getConfigStatus();
      
      expect(status.configured).toBe(false);
      expect(status.apiKeySet).toBe(false);
      expect(status.projectIdSet).toBe(false);
      expect(status.availableModels).toHaveLength(2);
    });

    it('should return correct status when only API key is set', () => {
      configManager.setConfig({ apiKey: 'test-key' });
      const status = configManager.getConfigStatus();
      
      expect(status.configured).toBe(true);
      expect(status.apiKeySet).toBe(true);
      expect(status.projectIdSet).toBe(false);
      expect(status.availableModels).toHaveLength(2);
    });

    it('should return correct status when both API key and project ID are set', () => {
      configManager.setConfig({ apiKey: 'test-key', projectId: 'test-project' });
      const status = configManager.getConfigStatus();
      
      expect(status.configured).toBe(true);
      expect(status.apiKeySet).toBe(true);
      expect(status.projectIdSet).toBe(true);
      expect(status.availableModels).toHaveLength(2);
    });
  });

  describe('getSupportedModels', () => {
    it('should return supported models', () => {
      const models = configManager.getSupportedModels();
      
      expect(models).toHaveLength(2);
      expect(models[0]).toEqual({
        id: 'imagen-4.0-generate-preview-06-06',
        name: 'Imagen 4 Standard',
        description: 'Generate very detailed images with good lighting and improved text rendering',
        maxImages: 4,
        features: ['high-quality', 'detailed', 'good-lighting', 'text-rendering']
      });
      expect(models[1]).toEqual({
        id: 'imagen-4.0-ultra-generate-preview-06-06',
        name: 'Imagen 4 Ultra',
        description: 'Premium version with enhanced quality and detail',
        maxImages: 1,
        features: ['ultra-high-quality', 'enhanced-detail', 'premium']
      });
    });
  });

  describe('validateConfig', () => {
    it('should throw error when API key is not set', () => {
      expect(() => {
        configManager.validateConfig();
      }).toThrow('Google API key is required. Please configure it using the configure-server tool.');
    });

    it('should throw error when API key is empty string', () => {
      configManager.setConfig({ apiKey: '' });
      expect(() => {
        configManager.validateConfig();
      }).toThrow('Google API key is required. Please configure it using the configure-server tool.');
    });

    it('should not throw error when API key is set', () => {
      configManager.setConfig({ apiKey: 'test-key' });
      expect(() => {
        configManager.validateConfig();
      }).not.toThrow();
    });
  });
});