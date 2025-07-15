import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import { ConfigManager } from './config-manager.js';
import { ImageGenerator } from './image-generator.js';
import { FileManager } from './file-manager.js';
export class GeminiImageServer {
    server;
    configManager;
    imageGenerator;
    fileManager;
    constructor() {
        this.configManager = new ConfigManager();
        this.fileManager = new FileManager();
        this.imageGenerator = new ImageGenerator(this.configManager, this.fileManager);
        this.server = new Server({
            name: 'mcp-gemini-image',
            version: '1.0.0',
        }, {
            capabilities: {
                tools: {},
            },
        });
        this.setupHandlers();
    }
    setupHandlers() {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => {
            return {
                tools: this.getTools(),
            };
        });
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            try {
                switch (name) {
                    case 'generate-image':
                        return await this.handleGenerateImage(args);
                    case 'configure-server':
                        return await this.handleConfigureServer(args);
                    case 'get-config-status':
                        return await this.handleGetConfigStatus();
                    case 'list-supported-models':
                        return await this.handleListSupportedModels();
                    default:
                        throw new Error(`Unknown tool: ${name}`);
                }
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Error: ${errorMessage}`,
                        },
                    ],
                };
            }
        });
    }
    getTools() {
        return [
            {
                name: 'generate-image',
                description: 'Generate images using Google Gemini 2.0 Flash experimental model',
                inputSchema: {
                    type: 'object',
                    properties: {
                        prompt: {
                            type: 'string',
                            description: 'Text description of the desired image',
                        },
                        model: {
                            type: 'string',
                            enum: ['gemini-2.0-flash-exp'],
                            description: 'Model to use for image generation',
                            default: 'gemini-2.0-flash-exp',
                        },
                        aspect_ratio: {
                            type: 'string',
                            enum: ['square', 'portrait', 'landscape'],
                            description: 'Aspect ratio of the generated image',
                            default: 'square',
                        },
                        num_images: {
                            type: 'number',
                            minimum: 1,
                            maximum: 4,
                            description: 'Number of images to generate (1-4 for standard, 1 for ultra)',
                            default: 1,
                        },
                        person_generation: {
                            type: 'string',
                            enum: ['dont_allow', 'allow_adult', 'allow_all'],
                            description: 'Person generation settings',
                            default: 'allow_adult',
                        },
                        filename: {
                            type: 'string',
                            description: 'Optional custom filename for the saved image',
                        },
                    },
                    required: ['prompt'],
                },
            },
            {
                name: 'configure-server',
                description: 'Configure Google API credentials for the server',
                inputSchema: {
                    type: 'object',
                    properties: {
                        api_key: {
                            type: 'string',
                            description: 'Google API key for authentication',
                        },
                        project_id: {
                            type: 'string',
                            description: 'Google Cloud project ID (optional)',
                        },
                    },
                    required: ['api_key'],
                },
            },
            {
                name: 'get-config-status',
                description: 'Get the current configuration status of the server',
                inputSchema: {
                    type: 'object',
                    properties: {},
                },
            },
            {
                name: 'list-supported-models',
                description: 'List all supported Google Gemini image generation models',
                inputSchema: {
                    type: 'object',
                    properties: {},
                },
            },
        ];
    }
    async handleGenerateImage(args) {
        if (!this.configManager.isConfigured()) {
            return {
                content: [
                    {
                        type: 'text',
                        text: 'Server is not configured. Please use the "configure-server" tool to set your Google API key before generating images.\n\n' +
                            'Example usage:\n' +
                            '{\n' +
                            '  "api_key": "your-google-api-key-here",\n' +
                            '  "project_id": "your-project-id" // optional\n' +
                            '}',
                    },
                ],
            };
        }
        const request = {
            prompt: args.prompt,
            model: args.model,
            aspect_ratio: args.aspect_ratio,
            num_images: args.num_images,
            person_generation: args.person_generation,
            filename: args.filename,
        };
        const result = await this.imageGenerator.generateImage(request);
        // Format metadata for output
        const metadataText = `Generation Metadata:\n` +
            `• Model: ${result.metadata.model}\n` +
            `• Prompt: ${result.metadata.prompt}\n` +
            `• Aspect Ratio: ${result.metadata.aspect_ratio}\n` +
            `• Number of Images: ${result.metadata.num_images}\n` +
            `• Timestamp: ${result.metadata.timestamp}\n` +
            `• Images Generated: ${result.images.length}`;
        return {
            content: [
                {
                    type: 'text',
                    text: `Successfully generated ${result.images.length} image(s) using ${result.metadata.model}\n\n` +
                        `Prompt: ${result.metadata.prompt}\n` +
                        `Aspect Ratio: ${result.metadata.aspect_ratio}\n` +
                        `Files saved to:\n${result.filePaths.join('\n')}\n\n` +
                        `Images saved to: ${this.fileManager.getImageDirectory()}\n\n` +
                        metadataText,
                },
            ],
        };
    }
    async handleConfigureServer(args) {
        this.configManager.setConfig({
            apiKey: args.api_key,
            projectId: args.project_id,
        });
        this.imageGenerator.updateConfig();
        return {
            content: [
                {
                    type: 'text',
                    text: 'Server configuration updated successfully.\n\n' +
                        'API key has been set and the Google Generative AI client has been initialized.\n' +
                        'You can now use the image generation tools.',
                },
            ],
        };
    }
    async handleGetConfigStatus() {
        const status = this.configManager.getConfigStatus();
        return {
            content: [
                {
                    type: 'text',
                    text: `Configuration Status:\n\n` +
                        `✅ Server Configured: ${status.configured}\n` +
                        `🔑 API Key Set: ${status.apiKeySet}\n` +
                        `📋 Project ID Set: ${status.projectIdSet}\n\n` +
                        `Available Models:\n${status.availableModels.map(m => `• ${m}`).join('\n')}\n\n` +
                        `Image save directory: ${this.fileManager.getImageDirectory()}`,
                },
            ],
        };
    }
    async handleListSupportedModels() {
        if (!this.configManager.isConfigured()) {
            return {
                content: [
                    {
                        type: 'text',
                        text: 'Server is not configured. Please use the "configure-server" tool to set your Google API key before listing models.\n\n' +
                            'Example usage:\n' +
                            '{\n' +
                            '  "api_key": "your-google-api-key-here",\n' +
                            '  "project_id": "your-project-id" // optional\n' +
                            '}',
                    },
                ],
            };
        }
        const models = this.configManager.getSupportedModels();
        const modelList = models.map(model => `• ${model.name} (${model.id})\n` +
            `  Description: ${model.description}\n` +
            `  Max Images: ${model.maxImages}\n` +
            `  Features: ${model.features.join(', ')}`).join('\n\n');
        return {
            content: [
                {
                    type: 'text',
                    text: `Supported Google Gemini Image Generation Models:\n\n${modelList}`,
                },
            ],
        };
    }
    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
    }
}
//# sourceMappingURL=server.js.map