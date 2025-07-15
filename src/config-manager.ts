import { GeminiConfig, ConfigStatus, SupportedModel } from './types.js';

export class ConfigManager {
  private config: GeminiConfig = {
    apiKey: '',
    projectId: undefined
  };

  constructor() {
    // No longer load from environment variables by default
    // Configuration must be set via the configure-server tool
  }

  public setConfig(config: Partial<GeminiConfig>): void {
    if (config.apiKey) {
      this.config.apiKey = config.apiKey;
    }
    if (config.projectId) {
      this.config.projectId = config.projectId;
    }
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
        id: 'imagen-4.0-generate-preview-06-06',
        name: 'Imagen 4 Standard',
        description: 'Generate very detailed images with good lighting and improved text rendering',
        maxImages: 4,
        features: ['high-quality', 'detailed', 'good-lighting', 'text-rendering']
      },
      {
        id: 'imagen-4.0-ultra-generate-preview-06-06',
        name: 'Imagen 4 Ultra',
        description: 'Premium version with enhanced quality and detail',
        maxImages: 1,
        features: ['ultra-high-quality', 'enhanced-detail', 'premium']
      }
    ];
  }

  public validateConfig(): void {
    if (!this.config.apiKey) {
      throw new Error('Google API key is required. Please configure it using the configure-server tool.');
    }
  }
}