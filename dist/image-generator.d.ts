import { ImageGenerationRequest, ImageGenerationResponse } from './types.js';
import { ConfigManager } from './config-manager.js';
import { FileManager } from './file-manager.js';
export declare class ImageGenerator {
    private configManager;
    private fileManager;
    private genAI;
    constructor(configManager: ConfigManager, fileManager: FileManager);
    private initializeClient;
    generateImage(request: ImageGenerationRequest): Promise<ImageGenerationResponse>;
    private validateNumImages;
    private mapAspectRatio;
    private extractImagesFromResponse;
    updateConfig(): void;
}
//# sourceMappingURL=image-generator.d.ts.map