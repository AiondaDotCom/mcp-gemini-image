import { promises as fs } from 'fs';
import { join, dirname } from 'path';
// Get config directory - use stable location for DXT extensions
const getConfigDir = () => {
    // Use a stable location in the user's home directory for DXT extensions
    const homeDir = process.env.HOME || process.env.USERPROFILE || '.';
    const configDir = join(homeDir, '.config', 'mcp-gemini-image');
    console.error(`[ConfigManager] Using stable config directory: ${configDir}`);
    console.error(`[ConfigManager] Current working directory: ${process.cwd()}`);
    return configDir;
};
export class ConfigManager {
    config = {
        apiKey: '',
        projectId: undefined
    };
    configFilePath;
    constructor() {
        this.configFilePath = join(getConfigDir(), 'server-config.json');
        this.loadConfig();
    }
    async setConfig(config) {
        if (config.apiKey) {
            this.config.apiKey = config.apiKey;
        }
        if (config.projectId) {
            this.config.projectId = config.projectId;
        }
        await this.saveConfig();
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
    async loadConfig() {
        try {
            console.error(`[ConfigManager] Loading config from: ${this.configFilePath}`);
            const configData = await fs.readFile(this.configFilePath, 'utf-8');
            const savedConfig = JSON.parse(configData);
            if (savedConfig.apiKey) {
                this.config.apiKey = savedConfig.apiKey;
                console.error(`[ConfigManager] Loaded API key: ${this.config.apiKey.substring(0, 10)}...`);
            }
            if (savedConfig.projectId) {
                this.config.projectId = savedConfig.projectId;
                console.error(`[ConfigManager] Loaded project ID: ${this.config.projectId}`);
            }
        }
        catch (error) {
            // Config file doesn't exist or is invalid - use defaults
            console.error(`[ConfigManager] No config file found or invalid config: ${error}, using defaults`);
        }
    }
    async saveConfig() {
        try {
            console.error(`[ConfigManager] Saving config to: ${this.configFilePath}`);
            // Ensure config directory exists
            await fs.mkdir(dirname(this.configFilePath), { recursive: true });
            const configData = JSON.stringify(this.config, null, 2);
            await fs.writeFile(this.configFilePath, configData, 'utf-8');
            console.error(`[ConfigManager] Config saved successfully`);
        }
        catch (error) {
            console.error(`[ConfigManager] Failed to save config file: ${error}`);
        }
    }
}
//# sourceMappingURL=config-manager.js.map