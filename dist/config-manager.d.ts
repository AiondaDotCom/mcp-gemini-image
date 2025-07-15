import { GeminiConfig, ConfigStatus, SupportedModel } from './types.js';
export declare class ConfigManager {
    private config;
    private configFilePath;
    constructor();
    setConfig(config: Partial<GeminiConfig>): Promise<void>;
    getConfig(): GeminiConfig;
    isConfigured(): boolean;
    getConfigStatus(): ConfigStatus;
    getSupportedModels(): SupportedModel[];
    validateConfig(): void;
    private loadConfig;
    private saveConfig;
}
//# sourceMappingURL=config-manager.d.ts.map