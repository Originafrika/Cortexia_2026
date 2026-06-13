export default async function handler(req: any, res: any) {
  if (req.method === 'GET') {
    try {
      const { jobId } = req.query;
      console.log('[VideoStatus] Checking:', jobId);

      // Return mock status
      return res.status(200).json({
        success: true,
        data: {
          jobId,
          status: 'pending',
          progress: 0,
          shots: []
        }
      });
    } catch (error) {
      console.error('[VideoStatus] Error:', error);
      return res.status(500).json({ success: false, error: 'Failed to get status' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
