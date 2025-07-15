# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an MCP (Model Context Protocol) server that provides Google Gemini image generation capabilities using the Imagen 4 model. The server acts as a bridge between MCP clients and Google's Generative AI API, enabling high-quality image generation with configurable parameters.

## Core Architecture

The codebase follows a modular design with clear separation of concerns:

- **Server Layer** (`server.ts`): Main MCP server implementation using `@modelcontextprotocol/sdk`
- **Configuration Management** (`config-manager.ts`): Handles Google API credentials and model configuration
- **Image Generation** (`image-generator.ts`): Integrates with `@google/generative-ai` for Imagen 4 API calls
- **File Management** (`file-manager.ts`): Handles image saving and file operations
- **Entry Point** (`index.ts`): Application bootstrap with signal handling

The server exposes 4 MCP tools:
1. `generate-image` - Main image generation with Imagen 4 (requires configuration)
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
- TypeScript with strict mode enabled

### API Configuration
The server requires Google API credentials to function. Configuration is handled through:
- MCP tool: `configure-server` with `api_key` parameter (required)
- Optional: `project_id` parameter for Google Cloud project ID
- Credentials must be configured before using image generation tools
- Tools `generate-image` and `list-supported-models` check for credentials and prompt for configuration if missing

### Image Storage
Generated images are automatically saved to `~/Desktop/gemini-images/` with:
- PNG format with timestamps
- Accompanying JSON metadata files
- Organized by generation parameters

### Model Support
- `imagen-4.0-generate-preview-06-06` (standard, 1-4 images)
- `imagen-4.0-ultra-generate-preview-06-06` (ultra quality, 1 image)

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