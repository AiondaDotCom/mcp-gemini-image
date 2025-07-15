export declare class GeminiImageServer {
    private server;
    private configManager;
    private imageGenerator;
    private fileManager;
    constructor();
    private setupHandlers;
    private getTools;
    private handleGenerateImage;
    private handleConfigureServer;
    private handleGetConfigStatus;
    private handleListSupportedModels;
    run(): Promise<void>;
}
//# sourceMappingURL=server.d.ts.map