import { promises as fs } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
export class FileManager {
    baseDir;
    constructor() {
        this.baseDir = join(homedir(), 'Desktop', 'gemini-images');
    }
    async ensureDirectoryExists() {
        try {
            await fs.mkdir(this.baseDir, { recursive: true });
        }
        catch (error) {
            console.error('Failed to create directory:', error);
            throw new Error(`Failed to create directory: ${this.baseDir}`);
        }
    }
    async saveImage(imageData, filename, metadata) {
        await this.ensureDirectoryExists();
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const finalFilename = filename || `gemini-image-${timestamp}.png`;
        const filePath = join(this.baseDir, finalFilename);
        try {
            const buffer = Buffer.from(imageData, 'base64');
            await fs.writeFile(filePath, buffer);
            if (metadata) {
                const metadataPath = join(this.baseDir, `${finalFilename}.json`);
                await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
            }
            return filePath;
        }
        catch (error) {
            console.error('Failed to save image:', error);
            throw new Error(`Failed to save image: ${error}`);
        }
    }
    async saveImages(images, baseFilename, metadata) {
        const filePaths = [];
        for (let i = 0; i < images.length; i++) {
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
            const filename = baseFilename
                ? `${baseFilename}-${i + 1}-${timestamp}.png`
                : `gemini-image-${i + 1}-${timestamp}.png`;
            const filePath = await this.saveImage(images[i], filename, {
                ...metadata,
                imageIndex: i + 1,
                totalImages: images.length
            });
            filePaths.push(filePath);
        }
        return filePaths;
    }
    getImageDirectory() {
        return this.baseDir;
    }
}
//# sourceMappingURL=file-manager.js.map