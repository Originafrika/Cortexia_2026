/**
 * Convert JSON prompt to natural text for Flux 2 Pro
 * Converts structured JSON into a well-ordered natural language prompt
 * Following FLUX.2 guide: Main subject → Key action → Critical style → Essential context
 * PRESERVES creative direction and typography from Gemini analysis
 * 
 * @param promptObj - FluxPrompt object with scene, subjects, style, etc.
 * @returns Natural language text prompt optimized for Flux 2 Pro
 */
export function buildTextPromptForFlux(promptObj: any): string {
  const parts: string[] = [];
  
  // ✅ PRIORITY 1: Main subject (first subject in array) with FULL creative details
  if (promptObj.subjects && promptObj.subjects.length > 0) {
    const mainSubject = promptObj.subjects[0];
    let subjectText = mainSubject.description || '';
    
    // Add action if present
    if (mainSubject.action) {
      subjectText += `, ${mainSubject.action}`;
    }
    
    // Add position
    if (mainSubject.position) {
      subjectText += `, ${mainSubject.position}`;
    }
    
    // Add key details (clean from TYPOGRAPHIC OVERLAY but keep everything else)
    if (mainSubject.details) {
      let cleanDetails = mainSubject.details;
      const typoIndex = cleanDetails.indexOf('[TYPOGRAPHIC OVERLAY');
      if (typoIndex > 0) {
        cleanDetails = cleanDetails.substring(0, typoIndex).trim();
      }
      if (cleanDetails) {
        subjectText += `. ${cleanDetails}`;
      }
    }
    
    parts.push(subjectText);
  }
  
  // ✅ PRIORITY 2: Additional subjects (preserve ALL creative elements)
  if (promptObj.subjects && promptObj.subjects.length > 1) {
    for (let i = 1; i < promptObj.subjects.length; i++) {
      const subject = promptObj.subjects[i];
      let subjectText = subject.description || '';
      
      if (subject.action) {
        subjectText += `, ${subject.action}`;
      }
      
      if (subject.position) {
        subjectText += `, ${subject.position}`;
      }
      
      // Add details for creative depth
      if (subject.details) {
        let cleanDetails = subject.details;
        const typoIndex = cleanDetails.indexOf('[TYPOGRAPHIC OVERLAY');
        if (typoIndex > 0) {
          cleanDetails = cleanDetails.substring(0, typoIndex).trim();
        }
        if (cleanDetails) {
          subjectText += `. ${cleanDetails}`;
        }
      }
      
      parts.push(subjectText);
    }
  }
  
  // ✅ PRIORITY 3: Critical style (preserve Gemini's creative style direction)
  if (promptObj.style) {
    parts.push(promptObj.style);
  }
  
  // ✅ PRIORITY 4: Essential context - Scene (clean but preserve creative direction)
  if (promptObj.scene) {
    let cleanScene = promptObj.scene;
    
    // Remove TYPOGRAPHIC OVERLAY
    const typoIndex = cleanScene.indexOf('[TYPOGRAPHIC OVERLAY');
    if (typoIndex > 0) {
      cleanScene = cleanScene.substring(0, typoIndex);
    }
    
    // Remove COMPOSITION ADJUSTMENTS (but we'll add composition hints elsewhere)
    const compIndex = cleanScene.indexOf('COMPOSITION ADJUSTMENTS');
    if (compIndex > 0) {
      cleanScene = cleanScene.substring(0, compIndex);
    }
    
    cleanScene = cleanScene.trim();
    if (cleanScene) {
      parts.push(cleanScene);
    }
  }
  
  // ✅ PRIORITY 5: Typography elements (FLUX.2 compatible format)
  // Extract typography from details if present and reformat for Flux
  if (promptObj.details) {
    const typoMatch = promptObj.details.match(/\[TYPOGRAPHIC OVERLAY[^\]]*\]:([\s\S]*)/);
    if (typoMatch) {
      const typoContent = typoMatch[1];
      
      // Extract key text elements and reformat for Flux
      const textElements: string[] = [];
      
      // Badge/promotion
      const badgeMatch = typoContent.match(/Text:\s*"([^"]+)"/i);
      if (badgeMatch) {
        textElements.push(`Circular promotion badge in top-right corner displaying text "${badgeMatch[1]}" in bold white typography on red gradient background`);
      }
      
      // Headline
      const headlineMatch = typoContent.match(/HEADLINE[^:]*:[^"]*"([^"]+)"/i);
      if (headlineMatch) {
        textElements.push(`Bold headline text "${headlineMatch[1]}" in upper portion, large typography with golden glow effect`);
      }
      
      // Subheadline
      const subheadMatch = typoContent.match(/SUBHEADLINE[^:]*:[^"]*"([^"]+)"/i);
      if (subheadMatch) {
        textElements.push(`Subheadline "${subheadMatch[1]}" below main text in accent color`);
      }
      
      // CTA
      const ctaMatch = typoContent.match(/CALL-TO-ACTION[^:]*:[^"]*"([^"]+)"/i);
      if (ctaMatch) {
        textElements.push(`Call-to-action button at bottom displaying "${ctaMatch[1]}" in white on gradient background`);
      }
      
      if (textElements.length > 0) {
        parts.push(textElements.join('. '));
      }
    }
  }
  
  // ✅ PRIORITY 6: Lighting (preserve full creative lighting setup)
  if (promptObj.lighting) {
    parts.push(promptObj.lighting);
  }
  
  // ✅ PRIORITY 7: Camera (preserve technical excellence)
  if (promptObj.camera) {
    const cameraText = typeof promptObj.camera === 'string' 
      ? promptObj.camera 
      : JSON.stringify(promptObj.camera);
    parts.push(cameraText);
  }
  
  // ✅ PRIORITY 8: Mood (translate to English if needed)
  if (promptObj.mood) {
    // Quick translation if in French
    const moodText = promptObj.mood
      .replace(/Professionnel/gi, 'Professional')
      .replace(/moderne/gi, 'modern')
      .replace(/épuré/gi, 'clean');
    parts.push(moodText);
  }
  
  // ✅ PRIORITY 9: Colors with explicit hex codes (brand precision)
  if (promptObj.colors && promptObj.colors.length > 0) {
    // Format: "color #HEX" as per FLUX.2 guide
    const colorParts = promptObj.colors.map((c: string) => `color ${c}`);
    parts.push(colorParts.join(', '));
  }
  
  // ✅ PRIORITY 10: Quality (preserve premium output specs)
  if (promptObj.quality) {
    parts.push(promptObj.quality);
  }
  
  // ✅ PRIORITY 11: Additional details (clean, preserve creative micro-details)
  if (promptObj.details) {
    let cleanDetails = promptObj.details;
    const typoIndex = cleanDetails.indexOf('[TYPOGRAPHIC OVERLAY');
    if (typoIndex > 0) {
      cleanDetails = cleanDetails.substring(0, typoIndex).trim();
    }
    if (cleanDetails) {
      parts.push(cleanDetails);
    }
  }
  
  // Join all parts with proper spacing
  const finalText = parts.join('. ').replace(/\.\./g, '.').replace(/\.\s*\./g, '.').trim();
  
  console.log(`📝 Built premium text prompt: ${finalText.length} characters`);
  console.log(`📊 Preserved ${parts.length} creative elements from Gemini analysis`);
  
  return finalText;
}