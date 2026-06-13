export default async function handler(req: any, res: any) {
  if (req.method === 'POST') {
    try {
      const { intent, userId } = req.body;

      if (!intent) {
        return res.status(400).json({ success: false, error: 'Intent required' });
      }

      console.log('[AnalyzeIntent] Processing:', intent.substring(0, 100));

      // Return mock analysis result
      const result = {
        success: true,
        data: {
          projectId: `project-${Date.now()}`,
          intent: intent,
          summary: intent.substring(0, 100),
          strategy: {
            approach: 'video_ad',
            keyPoints: ['Hook', 'Problem', 'Solution', 'CTA'],
            duration: 30,
            style: 'modern'
          },
          shots: [
            { id: '1', description: 'Hook - Attention grabber', duration: 3 },
            { id: '2', description: 'Problem - Pain point', duration: 5 },
            { id: '3', description: 'Solution - Product demo', duration: 15 },
            { id: '4', description: 'CTA - Call to action', duration: 7 }
          ]
        }
      };

      return res.status(200).json(result);
    } catch (error) {
      console.error('[AnalyzeIntent] Error:', error);
      return res.status(500).json({ success: false, error: 'Analysis failed' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
