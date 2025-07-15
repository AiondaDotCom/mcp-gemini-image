#!/usr/bin/env node
import { GeminiImageServer } from './server.js';
async function main() {
    const server = new GeminiImageServer();
    process.on('SIGINT', () => {
        process.exit(0);
    });
    process.on('SIGTERM', () => {
        process.exit(0);
    });
    try {
        await server.run();
    }
    catch (error) {
        console.error('Server error:', error);
        process.exit(1);
    }
}
main().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
});
//# sourceMappingURL=index.js.map