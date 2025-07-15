export interface GeminiConfig {
  apiKey: string;
  projectId?: string;
}

export interface ImageGenerationRequest {
  prompt: string;
  model?: 'imagen-4.0-generate-preview-06-06' | 'imagen-4.0-ultra-generate-preview-06-06';
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