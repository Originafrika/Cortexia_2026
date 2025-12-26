/**
 * Pollinations Provider - MVP
 */

export async function generatePollinationsImage(params: {
  prompt: string;
  model: string;
  images?: (string | undefined)[];
  width?: number;
  height?: number;
  seed?: number;
}): Promise<string> {
  const { prompt, model, images, width = 1024, height = 1024, seed } = params;

  // Construire l'URL Pollinations
  const baseUrl = 'https://image.pollinations.ai/prompt';
  const encodedPrompt = encodeURIComponent(prompt);
  
  let url = `${baseUrl}/${encodedPrompt}?model=${model}&width=${width}&height=${height}&nologo=true`;
  
  if (seed) {
    url += `&seed=${seed}`;
  }

  // Pour multi-images, utiliser l'API appropriée
  if (images && images.length > 0) {
    // TODO: Implémenter l'upload d'images vers Pollinations
    // Pour le MVP, on retourne juste l'URL avec le prompt
    console.warn('Multi-image not fully implemented in MVP');
  }

  return url;
}
