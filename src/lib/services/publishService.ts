// Publish Service - Handle publishing generations to feed

export interface PublishData {
  imageUrl: string;
  prompt: string;
  caption?: string;
  tags?: string[];
  type: 'image' | 'video' | 'avatar';
  style: string;
  ratio: string;
}

export interface PublishedPost {
  id: string;
  userId: string;
  imageUrl: string;
  caption: string;
  tags: string[];
  likes: number;
  comments: number;
  shares: number;
  createdAt: Date;
  metadata: {
    prompt: string;
    type: string;
    style: string;
    ratio: string;
  };
}

class PublishService {
  // Publish to feed (mock for now)
  async publishToFeed(data: PublishData): Promise<{ success: boolean; postId?: string; error?: string }> {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const postId = `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // In production, this would call Supabase
      // const { data: post, error } = await supabase
      //   .from('posts')
      //   .insert({
      //     user_id: currentUser.id,
      //     image_url: data.imageUrl,
      //     caption: data.caption || data.prompt,
      //     tags: data.tags,
      //     metadata: {
      //       prompt: data.prompt,
      //       type: data.type,
      //       style: data.style,
      //       ratio: data.ratio
      //     }
      //   });

      // For now, just save to localStorage as a mock
      this.saveMockPost({
        id: postId,
        userId: 'current_user',
        imageUrl: data.imageUrl,
        caption: data.caption || data.prompt,
        tags: data.tags || [],
        likes: 0,
        comments: 0,
        shares: 0,
        createdAt: new Date(),
        metadata: {
          prompt: data.prompt,
          type: data.type,
          style: data.style,
          ratio: data.ratio
        }
      });

      return { success: true, postId };
    } catch (error) {
      console.error('Publish error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to publish' 
      };
    }
  }

  // Save as draft
  async saveDraft(data: PublishData): Promise<{ success: boolean; draftId?: string }> {
    try {
      const draftId = `draft_${Date.now()}`;
      const drafts = this.getDrafts();
      
      drafts.push({
        id: draftId,
        ...data,
        savedAt: new Date()
      });

      localStorage.setItem('cortexia_drafts', JSON.stringify(drafts));
      return { success: true, draftId };
    } catch (error) {
      console.error('Save draft error:', error);
      return { success: false };
    }
  }

  // Get all drafts
  getDrafts(): any[] {
    try {
      const stored = localStorage.getItem('cortexia_drafts');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  // Delete draft
  deleteDraft(draftId: string): void {
    const drafts = this.getDrafts().filter(d => d.id !== draftId);
    localStorage.setItem('cortexia_drafts', JSON.stringify(drafts));
  }

  // Generate hashtags from prompt
  generateHashtags(prompt: string): string[] {
    // Handle undefined, null, or empty prompt
    if (!prompt || typeof prompt !== 'string') {
      return ['ai', 'aiart', 'digitalart', 'generativeart'];
    }

    const words = prompt
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3);

    // Common AI art tags
    const commonTags = ['ai', 'aiart', 'digitalart', 'generativeart'];
    
    // Take first 3-4 meaningful words
    const promptTags = words.slice(0, 4);
    
    return [...new Set([...commonTags, ...promptTags])].slice(0, 8);
  }

  // Extract keywords for tags
  extractKeywords(text: string): string[] {
    const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with'];
    
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.includes(word))
      .slice(0, 10);
  }

  // Private: Mock post storage
  private saveMockPost(post: PublishedPost): void {
    try {
      const posts = this.getMockPosts();
      posts.unshift(post);
      localStorage.setItem('cortexia_published_posts', JSON.stringify(posts));
    } catch (error) {
      console.error('Error saving mock post:', error);
    }
  }

  private getMockPosts(): PublishedPost[] {
    try {
      const stored = localStorage.getItem('cortexia_published_posts');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  // Get user's published posts
  getUserPosts(): PublishedPost[] {
    return this.getMockPosts();
  }
}

export const publishService = new PublishService();