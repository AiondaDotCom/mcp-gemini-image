export class ConfigManager {
    config = {
        apiKey: '',
        projectId: undefined
    };
    constructor() {
        // No longer load from environment variables by default
        // Configuration must be set via the configure-server tool
    }
    setConfig(config) {
        if (config.apiKey) {
            this.config.apiKey = config.apiKey;
        }
        if (config.projectId) {
            this.config.projectId = config.projectId;
        }
    }
    getConfig() {
        return { ...this.config };
    }
    isConfigured() {
        return this.config.apiKey.length > 0;
    }
    getConfigStatus() {
        return {
            configured: this.isConfigured(),
            apiKeySet: this.config.apiKey.length > 0,
            projectIdSet: !!this.config.projectId && this.config.projectId.length > 0,
            availableModels: this.getSupportedModels().map(m => m.id)
        };
    }
    getSupportedModels() {
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
    validateConfig() {
        if (!this.config.apiKey) {
            throw new Error('Google API key is required. Please configure it using the configure-server tool.');
        }
    }
}
//# sourceMappingURL=config-manager.js.map