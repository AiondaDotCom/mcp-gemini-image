import { GeminiConfig, ConfigStatus, SupportedModel } from './types.js';
export declare class ConfigManager {
    private config;
    constructor();
    setConfig(config: Partial<GeminiConfig>): void;
    getConfig(): GeminiConfig;
    isConfigured(): boolean;
    getConfigStatus(): ConfigStatus;
    getSupportedModels(): SupportedModel[];
    validateConfig(): void;
}
//# sourceMappingURL=config-manager.d.ts.map