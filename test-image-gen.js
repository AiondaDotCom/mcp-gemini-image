import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI('AIzaSyDHn_epOKn5FVYK17NXn5nbyC7P37Icmww');

async function testImageGeneration() {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp'
    });

    const generationConfig = {
      responseModalities: ['TEXT', 'IMAGE']
    };

    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [{ text: 'Ein schönes Haus am Meer mit blauem Himmel und Wellen, die gegen die Küste schlagen. Das Haus hat eine moderne Architektur mit großen Fenstern und steht auf einer Klippe mit Blick auf das Meer.' }]
      }],
      generationConfig
    });

    console.log('Generation successful!');
    console.log('Response:', result.response);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testImageGeneration();