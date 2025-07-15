# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an MCP (Model Context Protocol) server that provides Google Gemini image generation capabilities using the Gemini 2.0 Flash experimental model. The server acts as a bridge between MCP clients and Google's Generative AI API, enabling high-quality image generation with conversational capabilities.

## Core Architecture

The codebase follows a modular design with clear separation of concerns:

- **Server Layer** (`server.ts`): Main MCP server implementation using `@modelcontextprotocol/sdk`
- **Configuration Management** (`config-manager.ts`): Handles Google API credentials and model configuration
- **Image Generation** (`image-generator.ts`): Integrates with `@google/generative-ai` for Gemini 2.0 Flash API calls
- **File Management** (`file-manager.ts`): Handles image saving and file operations
- **Entry Point** (`index.ts`): Application bootstrap with signal handling

The server exposes 4 MCP tools:
1. `generate-image` - Main image generation with Gemini 2.0 Flash (requires configuration)
2. `configure-server` - Set API credentials (must be used first)
3. `get-config-status` - Check configuration status
4. `list-supported-models` - List available models (requires configuration)

## Common Commands

### Build and Development
```bash
npm run build          # Build TypeScript to dist/
npm run dev           # Watch mode for development
npm run clean         # Clean build directory
```

### Testing
```bash
npm test              # Run all tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage
npm run test:ci       # CI test run with coverage
```

### Running the Server
```bash
npm start             # Start the MCP server (requires build first)
```

## Development Notes

### Environment Setup
- Requires Node.js 18.0.0+
- Uses ES modules (type: "module" in package.json)
- TypeScript with strict mode enabled and ESNext module compilation

### API Configuration
The server requires Google API credentials to function. Configuration is handled through:
- MCP tool: `configure-server` with `api_key` parameter (required)
- Optional: `project_id` parameter for Google Cloud project ID
- Credentials must be configured before using image generation tools
- Tools `generate-image` and `list-supported-models` check for credentials and prompt for configuration if missing
- **Configuration Storage**: Credentials are automatically saved to `~/.mcp-gemini-image.json` in the user's home directory and persist between server restarts
- **Cross-Platform**: Configuration storage works on macOS, Linux, and Windows using appropriate environment variables

### Image Storage
Generated images are automatically saved to `~/Desktop/` with:
- PNG format with timestamps
- Accompanying JSON metadata files
- Direct desktop storage for easy access

### Model Support
- `gemini-2.0-flash-exp` (experimental, 1-4 images, conversational image generation)

**Important Note**: Gemini 2.0 Flash image generation requires:
- VPN connection to supported regions (US, UK) if not available locally
- Google AI Studio API key with appropriate permissions
- The model may not be available in all countries/regions

### DXT Package Deployment
- Uses DXT template variable `${__dirname}` for portable path resolution
- Compatible with Claude Desktop DXT package system
- ES modules work correctly with DXT when using template variables

### DXT Package & Claude Desktop Compatibility

**RESOLVED**: ES Modules work correctly with DXT template variables!

**Previous Issue (SOLVED)**: The problem was not ES modules but hardcoded absolute paths in manifest.json

**Solution**: Use DXT template variables for portable deployment:
```json
// manifest.json
{
  "server": {
    "type": "node",
    "entry_point": "dist/index.js",
    "mcp_config": {
      "command": "node",
      "args": ["${__dirname}/dist/index.js"]  // Template variable resolves automatically
    }
  }
}
```

**Key Benefits**:
- ES modules work perfectly with DXT template variables
- `${__dirname}` resolves to package installation directory
- Modern import/export syntax is maintained
- No need to convert to CommonJS

**Debugging Tips**:
- Always add `console.error()` statements at the very beginning of index.ts
- Check `/Users/[user]/Library/Logs/Claude/mcp-server-[name].log` for output
- Claude Desktop stores DXT packages in: `/Users/[user]/Library/Application Support/Claude/Claude Extensions/`

### Testing Framework
- Uses Jest with ts-jest for TypeScript support
- ESM configuration for modern module handling
- Coverage threshold set to 70% for all metrics
- Tests located in `tests/` directory matching `*.test.ts` pattern

### Key Dependencies
- `@modelcontextprotocol/sdk` - MCP server framework
- `@google/generative-ai` - Google Generative AI client
- Jest/ts-jest for testing
- TypeScript 5.0+ for type safety