export declare class FileManager {
    private readonly baseDir;
    constructor();
    ensureDirectoryExists(): Promise<void>;
    saveImage(imageData: string, filename?: string, metadata?: Record<string, any>): Promise<string>;
    saveImages(images: string[], baseFilename?: string, metadata?: Record<string, any>): Promise<string[]>;
    getImageDirectory(): string;
}
//# sourceMappingURL=file-manager.d.ts.map