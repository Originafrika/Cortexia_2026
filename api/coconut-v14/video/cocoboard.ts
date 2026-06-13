export default async function handler(req: any, res: any) {
  if (req.method === 'GET') {
    try {
      const { id } = req.query;
      console.log('[VideoCocoboard] Getting:', id);

      // Return mock cocoboard
      return res.status(200).json({
        success: true,
        data: {
          id,
          name: 'My Video Campaign',
          status: 'ready',
          assets: []
        }
      });
    } catch (error) {
      console.error('[VideoCocoboard] Error:', error);
      return res.status(500).json({ success: false, error: 'Failed to get cocoboard' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
