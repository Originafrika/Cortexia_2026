export default async function handler(req: any, res: any) {
  if (req.method === 'POST') {
    try {
      const { prompt, options = {} } = req.body;

      if (!prompt || typeof prompt !== 'string' || prompt.length < 3) {
        return res.status(400).json({
          success: false,
          error: 'Invalid prompt - must be at least 3 characters'
        });
      }

      const FREE_MODELS = ['zimage', 'seedream', 'kontext', 'nanobanana', 'pollinations', 'flux', 'flux-pro', 'flux-realism', 'flux-anime', 'flux-3d', 'turbo'];
      const PAID_MODELS = ['flux-2-pro', 'flux-2-flex'];

      const model = (options.model || 'zimage').toLowerCase();
      const isFreeModel = FREE_MODELS.includes(model);
      const isPaidModel = PAID_MODELS.includes(model);

      if (!isFreeModel && !isPaidModel) {
        return res.status(400).json({
          success: false,
          error: `Unknown model: ${model}`
        });
      }

      const width = options.width || 1024;
      const height = options.height || 1024;
      const seed = options.seed || Math.floor(Math.random() * 1000000);

      if (isFreeModel) {
        const pollinationsUrl = `https://text.pollinations.ai/${encodeURIComponent(prompt)}?width=${width}&height=${height}&seed=${seed}&model=${model}&nologo=true`;

        return res.status(200).json({
          success: true,
          jobId: `job-${Date.now()}`,
          status: 'succeeded',
          output: pollinationsUrl,
          model: model,
          creditsUsed: 1
        });
      } else {
        const referenceImages = options.referenceImages || [];
        const KIE_API_BASE = process.env.KIE_API_BASE || 'https://api.kie.ai';
        const KIE_API_KEY = process.env.KIE_API_KEY || '';

        try {
          const response = await fetch(`${KIE_API_BASE}/v1/images/generations`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${KIE_API_KEY}`
            },
            body: JSON.stringify({
              prompt,
              width,
              height,
              seed,
              model,
              reference_images: referenceImages
            })
          });

          const data = await response.json();

          if (data.task_id) {
            return res.status(200).json({
              success: true,
              jobId: data.task_id,
              status: 'processing'
            });
          }

          return res.status(200).json({
            success: true,
            jobId: `job-${Date.now()}`,
            status: 'succeeded',
            output: data.images?.[0]?.url || data.image_url,
            model: model,
            creditsUsed: 5
          });
        } catch (error) {
          console.error('[Generation] Kie AI error:', error);
          return res.status(500).json({
            success: false,
            error: 'Paid generation failed'
          });
        }
      }
    } catch (error) {
      console.error('[Generation] Error:', error);
      return res.status(500).json({
        success: false,
        error: 'Generation failed'
      });
    }
  } else if (req.method === 'GET') {
    const { jobId, status, output } = req.query;

    return res.status(200).json({
      success: true,
      jobId,
      status: status || 'succeeded',
      output
    });
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
