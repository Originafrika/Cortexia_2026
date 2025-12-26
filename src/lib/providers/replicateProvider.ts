/**
 * Replicate Provider - MVP
 */

export async function generateReplicateImage(params: {
  prompt: string;
  model: string;
  width: number;
  height: number;
}): Promise<string> {
  const { prompt, model, width, height } = params;

  const response = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${process.env.REPLICATE_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      version: model,
      input: {
        prompt,
        width,
        height
      }
    })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Replicate API error: ${response.status}`);
  }

  const prediction = await response.json();

  // Poll for result
  let result = prediction;
  while (result.status !== 'succeeded' && result.status !== 'failed') {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const pollResponse = await fetch(
      `https://api.replicate.com/v1/predictions/${result.id}`,
      {
        headers: {
          'Authorization': `Token ${process.env.REPLICATE_API_KEY}`
        }
      }
    );
    
    result = await pollResponse.json();
  }

  if (result.status === 'failed') {
    throw new Error(result.error || 'Generation failed');
  }

  return result.output[0];
}
