console.error('=== MCP GEMINI IMAGE SERVER DEBUG START ===');
import { GeminiImageServer } from './server.js';
console.error('=== IMPORTS LOADED ===');
async function main() {
    console.error('=== MAIN FUNCTION STARTED ===');
    try {
        console.error('=== CREATING SERVER INSTANCE ===');
        const server = new GeminiImageServer();
        console.error('=== SERVER INSTANCE CREATED ===');
        process.on('SIGINT', () => {
            console.error('=== RECEIVED SIGINT ===');
            process.exit(0);
        });
        process.on('SIGTERM', () => {
            console.error('=== RECEIVED SIGTERM ===');
            process.exit(0);
        });
        console.error('=== STARTING SERVER RUN ===');
        await server.run();
        console.error('=== SERVER RUNNING ===');
    }
    catch (error) {
        console.error('=== SERVER ERROR ===', error);
        process.exit(1);
    }
}
console.error('=== CALLING MAIN ===');
main().catch((error) => {
    console.error('=== FATAL ERROR ===', error);
    process.exit(1);
});
console.error('=== MAIN CALLED ===');
//# sourceMappingURL=index.js.map