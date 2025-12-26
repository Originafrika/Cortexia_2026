/**
 * Together AI Provider - MVP
 */

export async function generateTogetherImage(params: {
  prompt: string;
  model: string;
  width: number;
  height: number;
  steps?: number;
  seed?: number;
}): Promise<string> {
  const { prompt, model, width, height, steps = 4, seed } = params;

  const response = await fetch('https://api.together.xyz/v1/images/generations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.TOGETHER_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model,
      prompt,
      width,
      height,
      steps,
      n: 1,
      ...(seed && { seed })
    })
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || `Together API error: ${response.status}`);
  }

  const data = await response.json();
  return data.data[0].url;
}
