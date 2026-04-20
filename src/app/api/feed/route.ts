import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const offset = parseInt(searchParams.get('offset') || '0');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Mock feed data - in production, query from Neon DB
    const mockCreations = [
      {
        id: 'demo-1',
        userId: 'demo-user-1',
        username: 'AIArtist',
        caption: 'Exploring the cosmos with AI #space #ai #art',
        assetUrl: 'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?w=800',
        likes: 142,
        comments: 23,
        remixes: 5,
        userAvatar: 'https://images.unsplash.com/photo-1592849902530-cbabb686381d?w=100',
        createdAt: new Date().toISOString()
      },
      {
        id: 'demo-2',
        userId: 'demo-user-2',
        username: 'CreativeMind',
        caption: 'Abstract dreams in digital form',
        assetUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800',
        likes: 89,
        comments: 12,
        remixes: 3,
        userAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
        createdAt: new Date().toISOString()
      },
      {
        id: 'demo-3',
        userId: 'demo-user-3',
        username: 'NeuralArt',
        caption: 'Nature meets technology',
        assetUrl: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800',
        likes: 256,
        comments: 45,
        remixes: 18,
        userAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
        createdAt: new Date().toISOString()
      },
      {
        id: 'demo-4',
        userId: 'demo-user-4',
        username: 'PixelDreamer',
        caption: 'Cyberpunk city vibes',
        assetUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800',
        likes: 178,
        comments: 31,
        remixes: 8,
        userAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
        createdAt: new Date().toISOString()
      },
      {
        id: 'demo-5',
        userId: 'demo-user-5',
        username: 'GenerativeGenius',
        caption: 'Fluid shapes and colors',
        assetUrl: 'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=800',
        likes: 312,
        comments: 67,
        remixes: 22,
        userAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
        createdAt: new Date().toISOString()
      }
    ];

    // Paginate
    const paginatedCreations = mockCreations.slice(offset, offset + limit);
    const hasMore = offset + limit < mockCreations.length;

    return NextResponse.json({
      success: true,
      creations: paginatedCreations,
      pagination: {
        offset,
        limit,
        total: mockCreations.length,
        hasMore
      }
    });
  } catch (error) {
    console.error('[Feed] Error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch feed'
    }, { status: 500 });
  }
}