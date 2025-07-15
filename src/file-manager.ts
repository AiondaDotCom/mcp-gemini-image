import { promises as fs } from 'fs';
import { join } from 'path';
import { homedir } from 'os';

export class FileManager {
  private readonly baseDir: string;

  constructor() {
    this.baseDir = join(homedir(), 'Desktop');
  }

  public async ensureDirectoryExists(): Promise<void> {
    try {
      await fs.mkdir(this.baseDir, { recursive: true });
    } catch (error) {
      console.error('Failed to create directory:', error);
      throw new Error(`Failed to create directory: ${this.baseDir}`);
    }
  }

  public async saveImage(
    imageData: string,
    filename?: string,
    metadata?: Record<string, any>
  ): Promise<string> {
    await this.ensureDirectoryExists();

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const finalFilename = filename || `gemini-image-${timestamp}.png`;
    const filePath = join(this.baseDir, finalFilename);

    try {
      const buffer = Buffer.from(imageData, 'base64');
      await fs.writeFile(filePath, buffer);

      return filePath;
    } catch (error) {
      console.error('Failed to save image:', error);
      throw new Error(`Failed to save image: ${error}`);
    }
  }

  public async saveImages(
    images: string[],
    baseFilename?: string,
    metadata?: Record<string, any>
  ): Promise<string[]> {
    const filePaths: string[] = [];
    
    for (let i = 0; i < images.length; i++) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = baseFilename 
        ? `${baseFilename}-${i + 1}-${timestamp}.png`
        : `gemini-image-${i + 1}-${timestamp}.png`;
      
      const filePath = await this.saveImage(images[i], filename);
      filePaths.push(filePath);
    }

    return filePaths;
  }

  public getImageDirectory(): string {
    return this.baseDir;
  }
}