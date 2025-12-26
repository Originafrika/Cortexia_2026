// ============================================
// UPLOAD TO STORAGE
// ============================================

async function uploadFrameToStorage(data: Uint8Array): Promise<string> {
  // Upload to Supabase Storage
  const filename = `frames/frame-${Date.now()}.jpg`;
  
  const { createClient } = await import('npm:@supabase/supabase-js@2');
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
  
  const bucketName = 'make-e55aa214-coconut-assets';
  
  // Ensure bucket exists
  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketExists = buckets?.some(b => b.name === bucketName);
  
  if (!bucketExists) {
    await supabase.storage.createBucket(bucketName, { public: true }); // ✅ Must be public for Kie AI access
  }
  
  // Upload
  const { data: uploadData, error } = await supabase.storage
    .from(bucketName)
    .upload(filename, data, {
      contentType: 'image/jpeg',
      upsert: false,
    });
  
  if (error) {
    throw new Error(`Storage upload error: ${error.message}`);
  }
  
  // Get signed URL (valid for 1 hour)
  const { data: signedData } = await supabase.storage
    .from(bucketName)
    .createSignedUrl(filename, 3600);
  
  return signedData!.signedUrl;
}

// ============================================
// COCOBLEND ASSEMBLER - VIDEO CONCATENATION
// Final assembly of all shots into complete video
// ============================================

export interface VideoShot {
  id: string;
  url: string;
  duration: number;
  transition?: {
    type: 'cut' | 'fade' | 'dissolve' | 'smooth';
    duration?: number; // in seconds
  };
}

export interface AssembleResult {
  success: boolean;
  finalVideoUrl?: string;
  duration?: number;
  error?: string;
}

/**
 * CocoBlend Assembler - Concatenates video shots into final deliverable
 * Supports multiple transition types (cut, fade, dissolve, smooth)
 */
export async function assembleVideo(shots: VideoShot[]): Promise<AssembleResult> {
  try {
    console.log('🎬 CocoBlend Assembler starting...');
    console.log(`   Total shots: ${shots.length}`);
    
    if (shots.length === 0) {
      throw new Error('No shots provided for assembly');
    }
    
    // 1. Download all shots to temp directory
    console.log('📥 Downloading shots...');
    const tempFiles: string[] = [];
    
    for (let i = 0; i < shots.length; i++) {
      const shot = shots[i];
      console.log(`   [${i + 1}/${shots.length}] Downloading ${shot.id}...`);
      
      const response = await fetch(shot.url);
      if (!response.ok) {
        throw new Error(`Failed to download shot ${shot.id}`);
      }
      
      const videoBlob = await response.arrayBuffer();
      const tempPath = `/tmp/shot-${i}-${Date.now()}.mp4`;
      await Deno.writeFile(tempPath, new Uint8Array(videoBlob));
      
      tempFiles.push(tempPath);
      console.log(`   ✓ Downloaded: ${tempPath}`);
    }
    
    // 2. Build FFmpeg filter complex for transitions
    console.log('🔧 Building FFmpeg filter complex...');
    
    let filterComplex = '';
    let previousOutput = '';
    
    for (let i = 0; i < shots.length; i++) {
      const shot = shots[i];
      const isLast = i === shots.length - 1;
      const transition = shot.transition || { type: 'cut', duration: 0 };
      
      // Input label
      const inputLabel = `[${i}:v]`;
      
      if (i === 0) {
        // First shot - no transition
        previousOutput = inputLabel;
      } else {
        // Apply transition
        const transitionDuration = transition.duration || (transition.type === 'cut' ? 0 : 0.5);
        
        if (transition.type === 'cut' || transitionDuration === 0) {
          // Simple concatenation (no crossfade)
          previousOutput = inputLabel;
        } else if (transition.type === 'fade' || transition.type === 'dissolve' || transition.type === 'smooth') {
          // Crossfade transition
          const outputLabel = `[v${i}]`;
          filterComplex += `${previousOutput}${inputLabel}xfade=transition=fade:duration=${transitionDuration}:offset=${calculateOffset(shots, i, transitionDuration)}${outputLabel};`;
          previousOutput = outputLabel;
        }
      }
    }
    
    // If no transitions were applied, use simple concat
    if (!filterComplex) {
      filterComplex = shots.map((_, i) => `[${i}:v]`).join('') + `concat=n=${shots.length}:v=1:a=0[outv]`;
    } else {
      // Finalize filter complex
      filterComplex = filterComplex.slice(0, -1) + '[outv]';
    }
    
    console.log('   Filter complex:', filterComplex);
    
    // 3. Assemble video with FFmpeg
    console.log('🎥 Assembling final video...');
    const outputPath = `/tmp/final-${Date.now()}.mp4`;
    
    // Build FFmpeg command
    const ffmpegArgs = [
      // Input files
      ...tempFiles.flatMap(f => ['-i', f]),
      
      // Filter complex
      '-filter_complex', filterComplex,
      
      // Map output
      '-map', '[outv]',
      
      // Video codec settings (high quality)
      '-c:v', 'libx264',
      '-preset', 'medium',
      '-crf', '23',
      '-pix_fmt', 'yuv420p',
      
      // Output
      '-y', // Overwrite
      outputPath,
    ];
    
    console.log('   FFmpeg command:', 'ffmpeg', ffmpegArgs.join(' '));
    
    const cmd = new Deno.Command('ffmpeg', {
      args: ffmpegArgs,
      stdout: 'piped',
      stderr: 'piped',
    });
    
    const { code, stderr } = await cmd.output();
    
    if (code !== 0) {
      const errorOutput = new TextDecoder().decode(stderr);
      console.error('❌ FFmpeg error:', errorOutput);
      throw new Error(`FFmpeg failed with code ${code}`);
    }
    
    console.log('   ✓ Video assembled successfully');
    
    // 4. Upload final video to Supabase Storage
    console.log('📤 Uploading final video...');
    const finalVideoData = await Deno.readFile(outputPath);
    const finalVideoUrl = await uploadVideoToStorage(finalVideoData);
    
    console.log('   ✓ Upload complete:', finalVideoUrl);
    
    // 5. Calculate total duration
    const totalDuration = shots.reduce((sum, shot) => sum + shot.duration, 0);
    
    // 6. Cleanup temp files
    console.log('🧹 Cleaning up temp files...');
    try {
      for (const file of tempFiles) {
        await Deno.remove(file);
      }
      await Deno.remove(outputPath);
      console.log('   ✓ Cleanup complete');
    } catch (cleanupError) {
      console.warn('⚠️  Cleanup warning:', cleanupError);
    }
    
    console.log('✅ CocoBlend Assembler complete!');
    console.log(`   Final video: ${finalVideoUrl}`);
    console.log(`   Duration: ${totalDuration}s`);
    
    return {
      success: true,
      finalVideoUrl,
      duration: totalDuration,
    };
    
  } catch (error) {
    console.error('❌ CocoBlend Assembler error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// ============================================
// HELPER: CALCULATE TRANSITION OFFSET
// ============================================

function calculateOffset(shots: VideoShot[], currentIndex: number, transitionDuration: number): number {
  // Calculate the time offset for the transition
  // This is the cumulative duration of all previous shots minus the transition overlap
  let offset = 0;
  for (let i = 0; i < currentIndex; i++) {
    offset += shots[i].duration;
    // Subtract transition duration for overlap (except for the first shot)
    if (i > 0) {
      const prevTransition = shots[i].transition || { type: 'cut', duration: 0 };
      const prevDuration = prevTransition.duration || (prevTransition.type === 'cut' ? 0 : 0.5);
      offset -= prevDuration;
    }
  }
  // Subtract current transition duration for overlap
  offset -= transitionDuration;
  
  return Math.max(0, offset);
}

// ============================================
// UPLOAD VIDEO TO STORAGE
// ============================================

async function uploadVideoToStorage(data: Uint8Array): Promise<string> {
  const filename = `videos/final-${Date.now()}.mp4`;
  
  const { createClient } = await import('npm:@supabase/supabase-js@2');
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
  
  const bucketName = 'make-e55aa214-coconut-assets';
  
  // Ensure bucket exists
  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketExists = buckets?.some(b => b.name === bucketName);
  
  if (!bucketExists) {
    await supabase.storage.createBucket(bucketName, { public: true }); // ✅ Must be public for Kie AI access
  }
  
  // Upload
  const { data: uploadData, error } = await supabase.storage
    .from(bucketName)
    .upload(filename, data, {
      contentType: 'video/mp4',
      upsert: false,
    });
  
  if (error) {
    throw new Error(`Storage upload error: ${error.message}`);
  }
  
  // Get signed URL (valid for 24 hours for final videos)
  const { data: signedData } = await supabase.storage
    .from(bucketName)
    .createSignedUrl(filename, 86400); // 24 hours
  
  return signedData!.signedUrl;
}