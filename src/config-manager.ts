import { GeminiConfig, ConfigStatus, SupportedModel } from './types.js';
import { promises as fs } from 'fs';
import { join, dirname } from 'path';

// Get config directory - use __dirname equivalent for ESM or fallback
const getConfigDir = () => {
  // Use process.cwd() based approach for better compatibility
  // This works in both test and production environments
  return join(process.cwd(), 'dist', 'config');
};

export class ConfigManager {
  private config: GeminiConfig = {
    apiKey: '',
    projectId: undefined
  };

  private configFilePath: string;

  constructor() {
    this.configFilePath = join(getConfigDir(), 'server-config.json');
    this.loadConfig();
  }

  public async setConfig(config: Partial<GeminiConfig>): Promise<void> {
    if (config.apiKey) {
      this.config.apiKey = config.apiKey;
    }
    if (config.projectId) {
      this.config.projectId = config.projectId;
    }
    await this.saveConfig();
  }

  public getConfig(): GeminiConfig {
    return { ...this.config };
  }

  public isConfigured(): boolean {
    return this.config.apiKey.length > 0;
  }

  public getConfigStatus(): ConfigStatus {
    return {
      configured: this.isConfigured(),
      apiKeySet: this.config.apiKey.length > 0,
      projectIdSet: !!this.config.projectId && this.config.projectId.length > 0,
      availableModels: this.getSupportedModels().map(m => m.id)
    };
  }

  public getSupportedModels(): SupportedModel[] {
    return [
      {
        id: 'gemini-2.0-flash-exp',
        name: 'Gemini 2.0 Flash Experimental',
        description: 'Generate high-quality images using Gemini 2.0 Flash experimental model with conversational image generation',
        maxImages: 4,
        features: ['high-quality', 'conversational', 'multimodal', 'text-image', 'experimental']
      }
    ];
  }

  public validateConfig(): void {
    if (!this.config.apiKey) {
      throw new Error('Google API key is required. Please configure it using the configure-server tool.');
    }
  }

  private async loadConfig(): Promise<void> {
    try {
      // Loading config from file
      const configData = await fs.readFile(this.configFilePath, 'utf-8');
      const savedConfig = JSON.parse(configData);
      
      if (savedConfig.apiKey) {
        this.config.apiKey = savedConfig.apiKey;
        // API key loaded successfully
      }
      if (savedConfig.projectId) {
        this.config.projectId = savedConfig.projectId;
        // Project ID loaded successfully
      }
    } catch (error) {
      // Config file doesn't exist or is invalid - use defaults
      // Config file doesn't exist or is invalid - using defaults
    }
  }

  private async saveConfig(): Promise<void> {
    try {
      // Saving config to file
      // Ensure config directory exists
      await fs.mkdir(dirname(this.configFilePath), { recursive: true });
      
      const configData = JSON.stringify(this.config, null, 2);
      await fs.writeFile(this.configFilePath, configData, 'utf-8');
      // Config saved successfully
    } catch (error) {
      // Failed to save config file
    }
  }
}