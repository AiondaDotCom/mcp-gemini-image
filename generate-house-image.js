import { GoogleGenerativeAI } from '@google/generative-ai';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { mkdirSync } from 'fs';

const genAI = new GoogleGenerativeAI('AIzaSyDHn_epOKn5FVYK17NXn5nbyC7P37Icmww');

async function generateHouseImage() {
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

    const response = result.response;
    console.log('Generation successful!');
    
    // Extract and save images
    const candidates = response.candidates || [];
    const images = [];
    
    for (const candidate of candidates) {
      if (candidate.content && candidate.content.parts) {
        for (const part of candidate.content.parts) {
          if (part.inlineData && part.inlineData.data) {
            images.push(part.inlineData.data);
          }
        }
      }
    }
    
    if (images.length > 0) {
      // Create directory
      const baseDir = join(homedir(), 'Desktop');
      mkdirSync(baseDir, { recursive: true });
      
      // Save images
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const savedFiles = [];
      
      images.forEach((imageData, index) => {
        const filename = `haus-am-meer-${timestamp}-${index + 1}.png`;
        const filepath = join(baseDir, filename);
        
        // Convert base64 to buffer and save
        const buffer = Buffer.from(imageData, 'base64');
        writeFileSync(filepath, buffer);
        savedFiles.push(filepath);
        
        console.log(`Bild gespeichert: ${filepath}`);
      });
      
      console.log(`${images.length} Bild(er) erfolgreich generiert und auf dem Desktop gespeichert.`);
      return savedFiles;
    } else {
      console.log('Keine Bilder in der Antwort gefunden.');
    }
    
  } catch (error) {
    console.error('Fehler bei der Bildgenerierung:', error);
  }
}

generateHouseImage();