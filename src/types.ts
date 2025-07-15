export interface GeminiConfig {
  apiKey: string;
  projectId?: string;
}

export interface ImageGenerationRequest {
  prompt: string;
  model?: 'gemini-2.0-flash-exp';
  aspect_ratio?: 'square' | 'portrait' | 'landscape';
  num_images?: number;
  person_generation?: 'dont_allow' | 'allow_adult' | 'allow_all';
  filename?: string;
}

export interface ImageGenerationResponse {
  images: string[];
  filePaths: string[];
  metadata: {
    model: string;
    prompt: string;
    aspect_ratio: string;
    num_images: number;
    timestamp: string;
  };
}

export interface ConfigStatus {
  configured: boolean;
  apiKeySet: boolean;
  projectIdSet: boolean;
  availableModels: string[];
}

export interface SupportedModel {
  id: string;
  name: string;
  description: string;
  maxImages: number;
  features: string[];
}