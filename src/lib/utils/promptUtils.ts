/**
 * Convert FluxPrompt object to text string for Kie AI
 * Based on FLUX.2 official guide: Natural language, no fragmentation
 * Structure: Subject + Action + Style + Context
 * 
 * @param promptObj - FluxPrompt object with scene, subjects, style, etc.
 * @returns Text prompt string optimized for FLUX.2
 */
export function buildTextPromptFromJSON(promptObj: any): string {
  // ✅ FIX 7: FLUX.2 COMPLIANCE
  // - Natural language (no fragmentation)
  // - Positions integrated in descriptions (not "positioned XXX" suffix)
  // - Optimal order: Main subject → Secondary subjects → Text → Style → Lighting → Camera → Background
  // - Fuse scene + first subject if redundant
  
  const parts: string[] = [];
  
  // ============================================
  // 1. MAIN SUBJECT + SCENE
  // ============================================
  // ✅ FIX 7C: Fuse scene with first visual subject if they describe the same thing
  
  const visualSubjects = promptObj.subjects?.filter((s: any) => {
    const desc = s.description?.toLowerCase() || '';
    return !desc.includes('text ') && 
           !desc.includes('headline') && 
           !desc.includes('subheadline') &&
           !desc.includes('specs') &&
           !desc.includes('logo');
  }) || [];
  
  const textSubjects = promptObj.subjects?.filter((s: any) => {
    const desc = s.description?.toLowerCase() || '';
    return desc.includes('text ') || 
           desc.includes('headline') || 
           desc.includes('subheadline') ||
           desc.includes('specs') ||
           desc.includes('logo');
  }) || [];
  
  // Add scene (if exists) - this is the opening
  if (promptObj.scene) {
    // Check if first visual subject is redundant with scene
    const firstVisual = visualSubjects[0];
    if (firstVisual && sceneOverlapsWithSubject(promptObj.scene, firstVisual.description)) {
      // ✅ FIX 7C: Merge scene + first subject to avoid repetition
      const mergedDesc = mergeSceneAndSubject(promptObj.scene, firstVisual.description);
      parts.push(mergedDesc);
      visualSubjects.shift(); // Remove first subject (already merged)
    } else {
      parts.push(promptObj.scene);
    }
  }
  
  // ============================================
  // 2. SECONDARY VISUAL SUBJECTS
  // ============================================
  // ✅ FIX 7A: NO "positioned XXX" suffix - positions should be in description
  // ✅ FIX CRITIQUE: Include ALL subject fields (description + action + details + position)
  
  visualSubjects.forEach((subject: any) => {
    const subjParts: string[] = [];
    
    // Description (main subject name)
    if (subject.description) {
      subjParts.push(subject.description);
    }
    
    // Action (what the subject is doing)
    if (subject.action) {
      subjParts.push(subject.action);
    }
    
    // Details (visual specifications)
    if (subject.details) {
      subjParts.push(subject.details);
    }
    
    // Position (spatial placement)
    if (subject.position) {
      subjParts.push(subject.position);
    }
    
    // Style (if present)
    if (subject.style) {
      subjParts.push(subject.style);
    }
    
    // Join all parts with commas for natural flow
    if (subjParts.length > 0) {
      parts.push(subjParts.join(', '));
    }
  });
  
  // ============================================
  // 3. TEXT ELEMENTS (FLUX.2 syntax)
  // ============================================
  // Move text elements here (after visuals, before technical specs)
  // This follows advertising logic: Visual first, then text/copy
  
  textSubjects.forEach((subject: any) => {
    const subjDesc = subject.description || '';
    
    // Extract text content (between quotes)
    const textMatch = subjDesc.match(/'([^']+)'/);
    const textContent = textMatch ? textMatch[1] : '';
    
    if (textContent) {
      // Extract color hex code
      const colorMatch = subjDesc.match(/#[0-9A-Fa-f]{6}/);
      const colorHex = colorMatch ? colorMatch[0] : '';
      
      // Extract typography style (bold, italic, sans-serif, etc.)
      const styleDescriptors: string[] = [];
      if (subjDesc.toLowerCase().includes('large')) styleDescriptors.push('large');
      if (subjDesc.toLowerCase().includes('bold')) styleDescriptors.push('bold');
      if (subjDesc.toLowerCase().includes('headline')) styleDescriptors.push('headline');
      if (subjDesc.toLowerCase().includes('medium-weight')) styleDescriptors.push('medium-weight');
      if (subjDesc.toLowerCase().includes('small')) styleDescriptors.push('small');
      if (subjDesc.toLowerCase().includes('sans-serif')) styleDescriptors.push('sans-serif');
      if (subjDesc.toLowerCase().includes('italic')) styleDescriptors.push('italic');
      
      // Extract additional effects (stroke, shadow, etc.)
      const effects: string[] = [];
      if (subjDesc.toLowerCase().includes('stroke')) effects.push('white stroke effect');
      if (subjDesc.toLowerCase().includes('drop shadow')) effects.push('drop shadow');
      if (subjDesc.toLowerCase().includes('wide letter-spacing')) effects.push('wide letter-spacing');
      
      // Extract position if mentioned
      const posMatch = subjDesc.match(/positioned?\s+([^,\.]+)/i);
      const position = posMatch ? posMatch[1] : '';
      
      // Build FLUX.2 compliant text prompt
      let textPrompt = `The text '${textContent}' appears`;
      if (colorHex) textPrompt += ` in color ${colorHex}`;
      if (styleDescriptors.length > 0) textPrompt += ` as ${styleDescriptors.join(' ')} typography`;
      if (effects.length > 0) textPrompt += ` with ${effects.join(' and ')}`;
      if (position) textPrompt += `, ${position}`;
      
      parts.push(textPrompt);
    } else {
      // Fallback if text content not found
      parts.push(subjDesc);
    }
  });
  
  // ============================================
  // 4. STYLE + MOOD
  // ============================================
  // ✅ FIX 7D: Style comes after subjects (FLUX.2 order)
  
  const styleMood: string[] = [];
  if (promptObj.style) styleMood.push(promptObj.style);
  if (promptObj.mood) styleMood.push(`mood: ${promptObj.mood}`);
  if (styleMood.length > 0) {
    parts.push(styleMood.join(', '));
  }
  
  // ============================================
  // 5. LIGHTING
  // ============================================
  
  if (promptObj.lighting) {
    parts.push(promptObj.lighting);
  }
  
  // ============================================
  // 6. CAMERA (technical details)
  // ============================================
  // ✅ FIX: Handle camera as either string or object
  
  if (promptObj.camera) {
    if (typeof promptObj.camera === 'string') {
      // Camera is a string (full description)
      parts.push(promptObj.camera);
    } else {
      // Camera is an object with angle, lens, depth_of_field
      const camParts: string[] = [];
      if (promptObj.camera.angle) camParts.push(promptObj.camera.angle);
      if (promptObj.camera.lens) camParts.push(promptObj.camera.lens);
      if (promptObj.camera.depth_of_field) camParts.push(promptObj.camera.depth_of_field);
      if (camParts.length > 0) {
        parts.push(`Shot with ${camParts.join(', ')}`);
      }
    }
  }
  
  // ============================================
  // 7. QUALITY + DETAILS (micro-details)
  // ============================================
  
  if (promptObj.quality) {
    parts.push(promptObj.quality);
  }
  
  if (promptObj.details) {
    parts.push(promptObj.details);
  }
  
  // ============================================
  // 8. BACKGROUND + COMPOSITION
  // ============================================
  
  if (promptObj.background) {
    parts.push(promptObj.background);
  }
  
  if (promptObj.composition) {
    parts.push(promptObj.composition);
  }
  
  // ============================================
  // FINAL ASSEMBLY
  // ============================================
  // ✅ Join with commas for natural flow (FLUX.2 guide)
  // Example: "Subject A, subject B doing action, style X, lighting Y, shot with Z"
  
  const textPrompt = parts.join(', ').trim();
  
  console.log(`✅ Built FLUX.2-compliant text prompt: ${textPrompt.length} characters`);
  console.log(`📝 Full prompt preview: ${textPrompt.substring(0, 500)}...`);
  return textPrompt;
}

/**
 * Helper: Check if scene and subject describe the same main element
 */
function sceneOverlapsWithSubject(scene: string, subjectDesc: string): boolean {
  if (!scene || !subjectDesc) return false;
  
  const sceneLower = scene.toLowerCase();
  const subjLower = subjectDesc.toLowerCase();
  
  // Extract main keywords from both
  const keywords = ['iphone', 'bottle', 'product', 'player', 'car', 'watch', 'phone', 'basketball'];
  
  for (const keyword of keywords) {
    if (sceneLower.includes(keyword) && subjLower.includes(keyword)) {
      return true;
    }
  }
  
  return false;
}

/**
 * Helper: Merge scene and first subject intelligently
 */
function mergeSceneAndSubject(scene: string, subjectDesc: string): string {
  // If subject adds new details, append them
  // Otherwise, just use scene
  
  const sceneLower = scene.toLowerCase();
  const subjLower = subjectDesc.toLowerCase();
  
  // Check if subject has additional valuable details
  const hasColors = /#[0-9A-Fa-f]{6}/.test(subjectDesc) && !/#[0-9A-Fa-f]{6}/.test(scene);
  const hasDetailedDesc = subjectDesc.length > scene.length * 0.3;
  
  if (hasColors || hasDetailedDesc) {
    // Merge: scene + additional details from subject
    return `${scene}, ${subjectDesc}`;
  }
  
  // Otherwise just use scene (subject is redundant)
  return scene;
}