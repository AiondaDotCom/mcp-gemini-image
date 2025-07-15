import { GoogleGenerativeAI } from '@google/generative-ai';
export class ImageGenerator {
    configManager;
    fileManager;
    genAI = null;
    constructor(configManager, fileManager) {
        this.configManager = configManager;
        this.fileManager = fileManager;
        this.initializeClient();
    }
    initializeClient() {
        const config = this.configManager.getConfig();
        if (config.apiKey) {
            this.genAI = new GoogleGenerativeAI(config.apiKey);
        }
    }
    async generateImage(request) {
        this.configManager.validateConfig();
        if (!this.genAI) {
            this.initializeClient();
        }
        if (!this.genAI) {
            throw new Error('Google Generative AI client not initialized');
        }
        const model = request.model || 'gemini-2.0-flash-exp';
        const numImages = this.validateNumImages(request.num_images || 1, model);
        try {
            const generativeModel = this.genAI.getGenerativeModel({
                model: model
            });
            const generationConfig = {
                responseModalities: ['TEXT', 'IMAGE']
            };
            const result = await generativeModel.generateContent({
                contents: [{
                        role: 'user',
                        parts: [{ text: request.prompt }]
                    }],
                generationConfig
            });
            const response = await result.response;
            const images = this.extractImagesFromResponse(response);
            if (images.length === 0) {
                throw new Error('No images generated from the API response');
            }
            const metadata = {
                model,
                prompt: request.prompt,
                aspect_ratio: request.aspect_ratio || 'square',
                num_images: numImages,
                timestamp: new Date().toISOString()
            };
            const filePaths = await this.fileManager.saveImages(images, request.filename, metadata);
            return {
                images,
                filePaths,
                metadata
            };
        }
        catch (error) {
            console.error('Image generation failed:', error);
            throw new Error(`Image generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    validateNumImages(numImages, model) {
        const maxImages = model.includes('ultra') ? 1 : 4;
        if (numImages < 1 || numImages > maxImages) {
            throw new Error(`Number of images must be between 1 and ${maxImages} for model ${model}`);
        }
        return numImages;
    }
    mapAspectRatio(aspectRatio) {
        switch (aspectRatio) {
            case 'square':
                return '1:1';
            case 'portrait':
                return '3:4';
            case 'landscape':
                return '4:3';
            default:
                return '1:1';
        }
    }
    extractImagesFromResponse(response) {
        const images = [];
        try {
            const candidates = response.candidates || [];
            for (const candidate of candidates) {
                if (candidate.content && candidate.content.parts) {
                    for (const part of candidate.content.parts) {
                        if (part.inlineData && part.inlineData.data) {
                            images.push(part.inlineData.data);
                        }
                    }
                }
            }
        }
        catch (error) {
            console.error('Error extracting images from response:', error);
        }
        return images;
    }
    updateConfig() {
        this.initializeClient();
    }
}
//# sourceMappingURL=image-generator.js.map