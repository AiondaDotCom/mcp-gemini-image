import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI('AIzaSyDHn_epOKn5FVYK17NXn5nbyC7P37Icmww');

async function listModels() {
  try {
    const models = await genAI.listModels();
    console.log('Available models:');
    models.forEach(model => {
      console.log(`- ${model.name} (${model.supportedGenerationMethods?.join(', ')})`);
    });
  } catch (error) {
    console.error('Error listing models:', error);
  }
}

listModels();