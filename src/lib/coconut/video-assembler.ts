// Video Assembler — Client-side video concatenation using ffmpeg.wasm
// Combines multiple video shots into a single MP4 output

import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';

const BASE_URL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';

class VideoAssembler {
  private ffmpeg: FFmpeg | null = null;
  private loaded = false;

  /**
   * Load ffmpeg.wasm core (call once before assembling)
   */
  async load(): Promise<void> {
    if (this.loaded) return;

    this.ffmpeg = new FFmpeg();

    this.ffmpeg.on('log', ({ message }) => {
      console.log('[FFmpeg]', message);
    });

    await this.ffmpeg.load({
      coreURL: await toBlobURL(`${BASE_URL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${BASE_URL}/ffmpeg-core.wasm`, 'application/wasm'),
    });

    this.loaded = true;
    console.log('✅ FFmpeg.wasm loaded');
  }

  /**
   * Check if ffmpeg is ready
   */
  isReady(): boolean {
    return this.loaded && this.ffmpeg !== null;
  }

  /**
   * Concatenate multiple video files into a single MP4
   * Uses the concat demuxer approach for best compatibility
   */
  async concatenate(
    videoUrls: string[],
    onProgress?: (percent: number) => void
  ): Promise<Blob | null> {
    if (!this.ffmpeg) {
      console.error('❌ FFmpeg not loaded. Call load() first.');
      return null;
    }

    if (videoUrls.length === 0) {
      console.error('❌ No videos to concatenate');
      return null;
    }

    if (videoUrls.length === 1) {
      // Single video — just fetch it
      const response = await fetch(videoUrls[0]);
      return response.blob();
    }

    try {
      const ffmpeg = this.ffmpeg;

      // Write input files to ffmpeg virtual FS
      const inputFiles: string[] = [];
      for (let i = 0; i < videoUrls.length; i++) {
        const fileName = `input${i}.mp4`;
        const fileData = await fetchFile(videoUrls[i]);
        await ffmpeg.writeFile(fileName, fileData);
        inputFiles.push(fileName);
      }

      // Create concat file
      const concatContent = inputFiles.map(f => `file '${f}'`).join('\n');
      await ffmpeg.writeFile('concat.txt', concatContent);

      // Progress tracking
      let lastProgress = 0;
      ffmpeg.on('progress', ({ progress }) => {
        const percent = Math.min(Math.round(progress * 100), 100);
        if (percent > lastProgress) {
          lastProgress = percent;
          onProgress?.(percent);
        }
      });

      // Concatenate using concat demuxer (fast, no re-encoding if same codec)
      await ffmpeg.exec([
        '-f', 'concat',
        '-safe', '0',
        '-i', 'concat.txt',
        '-c', 'copy',
        '-movflags', '+faststart',
        'output.mp4',
      ]);

      // Read output
      const outputData = await ffmpeg.readFile('output.mp4');
      const outputBlob = new Blob([outputData], { type: 'video/mp4' });

      // Cleanup virtual FS
      for (const f of inputFiles) {
        await ffmpeg.deleteFile(f).catch(() => {});
      }
      await ffmpeg.deleteFile('concat.txt').catch(() => {});
      await ffmpeg.deleteFile('output.mp4').catch(() => {});

      console.log(`✅ Concatenated ${videoUrls.length} videos → ${outputBlob.size} bytes`);
      return outputBlob;

    } catch (error) {
      console.error('❌ FFmpeg concat failed:', error);

      // Fallback: try re-encoding approach
      return this.concatenateWithReencode(videoUrls, onProgress);
    }
  }

  /**
   * Fallback: concatenate with re-encoding (slower but more compatible)
   */
  private async concatenateWithReencode(
    videoUrls: string[],
    onProgress?: (percent: number) => void
  ): Promise<Blob | null> {
    if (!this.ffmpeg) return null;

    try {
      const ffmpeg = this.ffmpeg;

      // Write inputs
      for (let i = 0; i < videoUrls.length; i++) {
        const fileData = await fetchFile(videoUrls[i]);
        await ffmpeg.writeFile(`input${i}.mp4`, fileData);
      }

      // Build filter_complex for concat
      const inputs = videoUrls.map((_, i) => `[${i}:v][${i}:a]`).join('');
      const concatFilter = `${inputs}concat=n=${videoUrls.length}:v=1:a=1[outv][outa]`;

      let lastProgress = 0;
      ffmpeg.on('progress', ({ progress }) => {
        const percent = Math.min(Math.round(progress * 100), 100);
        if (percent > lastProgress) {
          lastProgress = percent;
          onProgress?.(percent);
        }
      });

      await ffmpeg.exec([
        ...videoUrls.flatMap((_, i) => ['-i', `input${i}.mp4`]),
        '-filter_complex', concatFilter,
        '-map', '[outv]',
        '-map', '[outa]',
        '-c:v', 'libx264',
        '-preset', 'ultrafast',
        '-c:a', 'aac',
        '-movflags', '+faststart',
        'output.mp4',
      ]);

      const outputData = await ffmpeg.readFile('output.mp4');
      const outputBlob = new Blob([outputData], { type: 'video/mp4' });

      // Cleanup
      for (let i = 0; i < videoUrls.length; i++) {
        await ffmpeg.deleteFile(`input${i}.mp4`).catch(() => {});
      }
      await ffmpeg.deleteFile('output.mp4').catch(() => {});

      console.log(`✅ Re-encoded concat: ${videoUrls.length} videos → ${outputBlob.size} bytes`);
      return outputBlob;

    } catch (error) {
      console.error('❌ FFmpeg re-encode concat failed:', error);
      return null;
    }
  }

  /**
   * Download the assembled video
   */
  download(blob: Blob, filename: string = 'cortexia-output.mp4'): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Estimate assembly time based on total duration and number of inputs
   */
  estimateTime(videoCount: number, totalDurationSeconds: number): {
    fast: string;
    slow: string;
  } {
    // Fast path (copy): ~1-2 seconds per video for file I/O
    const fastSeconds = videoCount * 2;
    // Slow path (re-encode): ~0.5x real-time for ultrafast preset
    const slowSeconds = Math.ceil(totalDurationSeconds * 0.5);

    return {
      fast: fastSeconds < 60 ? `${fastSeconds}s` : `${Math.ceil(fastSeconds / 60)}min`,
      slow: slowSeconds < 60 ? `${slowSeconds}s` : `${Math.ceil(slowSeconds / 60)}min`,
    };
  }
}

export const videoAssembler = new VideoAssembler();
export default videoAssembler;
