export class ConfigManager {
    config = {
        apiKey: '',
        projectId: undefined
    };
    constructor() {
        this.loadFromEnvironment();
    }
    loadFromEnvironment() {
        this.config.apiKey = process.env.GOOGLE_API_KEY || '';
        this.config.projectId = process.env.GOOGLE_PROJECT_ID || undefined;
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
    validateConfig() {
        if (!this.config.apiKey) {
            throw new Error('Google API key is required. Please configure it using the configure-server tool.');
        }
    }
}
//# sourceMappingURL=config-manager.js.map