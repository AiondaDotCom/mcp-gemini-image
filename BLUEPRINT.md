# MCP Google Gemini Image Generation Server - Blueprint

## Overview
This project will create a Model Context Protocol (MCP) server for Google Gemini image generation, specifically supporting the Imagen 4 model. It will be based on the structure of the OpenAI image MCP server but adapted for Google's Gemini API.

## Project Structure
```
src/
├── index.ts            # Main entry point
├── server.ts           # MCP server implementation
├── config-manager.ts   # Configuration management for Google API
├── image-generator.ts  # Google Gemini API integration
├── file-manager.ts     # Desktop file operations
└── types.ts            # TypeScript definitions
```

## Key Features

### 1. Core Image Generation
- **Primary Model**: Imagen 4 (`imagen-4.0-generate-preview-06-06`)
- **Ultra Model**: Imagen 4 Ultra (`imagen-4.0-ultra-generate-preview-06-06`)
- Support for text-to-image generation with detailed prompts
- Automatic desktop file saving (~/Desktop)

### 2. MCP Tools Implementation

#### `generate-image`
- **Purpose**: Create images using Google Gemini Imagen 4
- **Parameters**:
  - `prompt` (required): Text description of desired image
  - `model` (optional): Choose between standard and ultra Imagen 4
  - `aspect_ratio` (optional): Image dimensions
  - `num_images` (optional): Number of images to generate (1-4 for standard, 1 for ultra)
  - `person_generation` (optional): Settings for person generation
  - `filename` (optional): Custom filename for saved image

#### `configure-server`
- **Purpose**: Set up Google API credentials
- **Parameters**:
  - `api_key` (required): Google API key
  - `project_id` (optional): Google Cloud project ID

#### `get-config-status`
- **Purpose**: Check server configuration status
- **Returns**: API key status and available models

#### `list-supported-models`
- **Purpose**: Display available Imagen models
- **Returns**: List of supported models with descriptions

### 3. Configuration Management
- Secure API key storage
- Support for Google Cloud authentication
- Environment variable support
- Configuration validation

### 4. Image Processing
- Generate images via Google Gemini API
- Handle SynthID watermarking
- Support multiple image formats
- Automatic file naming and organization

### 5. Error Handling
- API rate limiting handling
- Authentication error management
- Invalid prompt handling
- Network error recovery

## Technical Requirements

### Dependencies
- **@modelcontextprotocol/sdk**: MCP protocol implementation
- **@google/generative-ai**: Google Gemini API client
- **typescript**: Type safety
- **node-fetch**: HTTP requests (if needed)
- **fs/promises**: File system operations

### Authentication
- Google API key authentication
- Optional Google Cloud service account support
- Environment variable configuration

### API Integration
- **Base URL**: Google Gemini API endpoints
- **Authentication**: Bearer token with API key
- **Request Format**: JSON with prompt and parameters
- **Response Format**: Base64 encoded images

## Implementation Details

### Google Gemini API Integration
```typescript
// Example API call structure
const response = await fetch('https://generativelanguage.googleapis.com/v1/models/imagen-4.0-generate-preview-06-06:generateImage', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    prompt: {
      text: userPrompt
    },
    generationConfig: {
      aspectRatio: aspectRatio,
      numImages: numImages
    }
  })
});
```

### File Management
- Save images to `~/Desktop/gemini-images/`
- Generate unique filenames with timestamp
- Support for custom filenames
- Image metadata preservation

### Error Handling Strategy
- Graceful degradation for API errors
- User-friendly error messages
- Retry logic for transient failures
- Comprehensive logging

## Differences from OpenAI Version

### API Differences
- Different authentication method (Google API key vs OpenAI API key)
- Different request/response format
- Different model names and capabilities
- SynthID watermarking support

### Feature Differences
- Focus on Imagen 4 model specifically
- Different parameter options (aspect_ratio instead of size)
- Different image generation limits
- Enhanced text rendering capabilities

### Enhanced Features
- Better text rendering in images
- More detailed image generation
- Improved lighting capabilities
- Multi-language prompt support

## Development Phases

### Phase 1: Core Setup
- Project structure creation
- TypeScript configuration
- Basic MCP server setup
- Configuration management

### Phase 2: API Integration
- Google Gemini API client implementation
- Authentication handling
- Basic image generation

### Phase 3: MCP Tools
- Implement all MCP tools
- Error handling
- File management

### Phase 4: Testing & Polish
- Unit tests
- Integration tests
- Documentation
- Performance optimization

## Testing Strategy
- Unit tests for all modules
- Integration tests with Google API
- Error scenario testing
- Performance benchmarks

## Security Considerations
- Secure API key handling
- No logging of sensitive data
- Input validation for prompts
- Rate limiting compliance

## Future Enhancements
- Image editing capabilities
- Batch processing
- Custom style presets
- Advanced prompt engineering tools
- Integration with other Google services

## File Structure Overview
```
mcp-gemini-image/
├── src/
│   ├── index.ts
│   ├── server.ts
│   ├── config-manager.ts
│   ├── image-generator.ts
│   ├── file-manager.ts
│   └── types.ts
├── package.json
├── tsconfig.json
├── README.md
└── BLUEPRINT.md
```

This blueprint provides a comprehensive plan for implementing a Google Gemini image generation MCP server that mirrors the functionality of the OpenAI version while leveraging Google's superior image generation capabilities.