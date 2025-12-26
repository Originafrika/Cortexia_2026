/**
 * 🎨 FLUX.2 TYPOGRAPHY EXTRACTION & PROMPT GENERATION
 * 
 * Extrait les éléments textuels de l'intent et génère des instructions
 * de typography selon le guide officiel FLUX.2.
 * 
 * GUIDE FLUX.2 - Typography Tips:
 * ✅ Use quotation marks: "The text 'OPEN' appears in red neon letters"
 * ✅ Specify placement: Where text appears relative to other elements
 * ✅ Describe style: "elegant serif typography", "bold industrial lettering"
 * ✅ Font size: "large headline text", "small body copy", "medium subheading"
 * ✅ Color: Use hex codes for brand text: "The logo text 'ACME' in color #FF5733"
 * 
 * Source: https://docs.bfl.ml/prompting-guide/flux2#typography-and-design
 */

export interface TextElement {
  content: string;
  type: 'title' | 'subtitle' | 'headline' | 'body' | 'date' | 'location' | 'price' | 'info' | 'logo-text' | 'callout';
  priority: 1 | 2 | 3; // 1 = most important, 3 = least
  style?: 'bold' | 'elegant' | 'modern' | 'playful' | 'corporate';
  size?: 'large' | 'medium' | 'small';
  color?: string; // Hex code
  placement?: 'top' | 'center' | 'bottom' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export interface TypographyInstructions {
  elements: TextElement[];
  hierarchyDescription: string; // How elements relate to each other
  styleGuide: string; // Overall typography style
  promptSnippet: string; // Ready-to-use prompt fragment
}

/**
 * 🔍 EXTRAIT LES ÉLÉMENTS TEXTUELS D'UN INTENT
 */
export function extractTextElements(intent: string, contentType: 'poster' | 'ad' | 'magazine' | 'infographic' | 'generic' = 'generic'): TypographyInstructions {
  const elements: TextElement[] = [];
  
  console.log(`🔍 [TYPOGRAPHY] Extracting text elements from intent (${contentType})`);
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 1. EXTRACT QUOTED TEXT (highest priority)
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const quotedMatches = intent.match(/"([^"]+)"|'([^']+)'/g);
  if (quotedMatches) {
    quotedMatches.forEach(match => {
      const content = match.replace(/["']/g, '');
      elements.push({
        content,
        type: 'headline',
        priority: 1,
        style: 'bold',
        size: 'large',
      });
    });
  }
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 2. EXTRACT TITLE/EVENT NAME
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const titlePatterns = [
    /(?:concert|event|festival|expo)\s+(?:pour|for|titled|called)?\s*[:\s]*([A-Z][^.!?\n]+)/i,
    /(?:affiche|poster|ad)\s+(?:pour|for)?\s*[:\s]*([A-Z][^.!?\n]+)/i,
    /(?:annoncer|announce|presenting)\s+(?:le|la|the)?\s*([A-Z][^.!?\n]+)/i,
  ];
  
  for (const pattern of titlePatterns) {
    const match = intent.match(pattern);
    if (match && match[1]) {
      const title = match[1].trim().replace(/[.!?,]$/, '');
      // Check if not already added via quoted text
      if (!elements.some(e => e.content === title)) {
        elements.push({
          content: title,
          type: 'title',
          priority: 1,
          style: 'bold',
          size: 'large',
          placement: 'top',
        });
      }
      break;
    }
  }
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 3. EXTRACT DATES
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const datePatterns = [
    /(\d{1,2})\s*(?:au|to|-)\s*(\d{1,2})\s+(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre|january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{4})/i,
    /(?:le|on)?\s*(\d{1,2})\s+(janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre|january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{4})/i,
    /(\d{1,2}\/\d{1,2}\/\d{4})/,
  ];
  
  for (const pattern of datePatterns) {
    const match = intent.match(pattern);
    if (match) {
      elements.push({
        content: match[0].trim(),
        type: 'date',
        priority: 2,
        style: 'modern',
        size: 'medium',
        placement: contentType === 'poster' ? 'bottom' : undefined,
      });
      break;
    }
  }
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 4. EXTRACT LOCATION
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const locationPatterns = [
    /(?:à|au|in|at)\s+([A-Z][a-zà-ÿ]+(?:\s+[A-Z][a-zà-ÿ]+)*)\s*,?\s*(?:au|in|à)?\s*([A-Z][a-zà-ÿ]+)/i,
    /(?:lieu|location|venue)[:\s]+([^.\n]+)/i,
  ];
  
  for (const pattern of locationPatterns) {
    const match = intent.match(pattern);
    if (match) {
      const location = match[1] + (match[2] ? ', ' + match[2] : '');
      elements.push({
        content: location.trim(),
        type: 'location',
        priority: 2,
        style: 'modern',
        size: 'medium',
        placement: contentType === 'poster' ? 'bottom' : undefined,
      });
      break;
    }
  }
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 5. EXTRACT TIME
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const timePatterns = [
    /(?:à partir de|from|at)\s+(\d{1,2}h\d{0,2})/i,
    /(\d{1,2}:\d{2}(?:\s*(?:AM|PM))?)/i,
  ];
  
  for (const pattern of timePatterns) {
    const match = intent.match(pattern);
    if (match) {
      elements.push({
        content: match[1].trim(),
        type: 'info',
        priority: 3,
        size: 'small',
      });
      break;
    }
  }
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 6. EXTRACT PRICES
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const pricePatterns = [
    /(?:entrée|entry|ticket)[:\s]+(?:à partir de|from)?\s*([\d.,]+\s*(?:francs?|€|\$|USD|EUR))/i,
    /VIP[:\s]+([\d.,]+\s*(?:francs?|€|\$|USD|EUR))/i,
  ];
  
  pricePatterns.forEach(pattern => {
    const matches = intent.matchAll(new RegExp(pattern.source, 'gi'));
    for (const match of matches) {
      elements.push({
        content: match[0].trim(),
        type: 'price',
        priority: 2,
        size: 'medium',
        placement: contentType === 'poster' ? 'bottom' : undefined,
      });
    }
  });
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 7. EXTRACT SPONSORS
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  
  // ✅ FIX: Extract sponsors from dedicated section, not from descriptions
  const sponsorMatch = intent.match(/sponsor[s]?[:\s]+([^\n]+?)(?=\n|$)/i);
  if (sponsorMatch) {
    let sponsorText = sponsorMatch[1].trim();
    
    // ✅ REMOVE any trailing incomplete sentence fragments
    // If it ends mid-sentence (no period, question mark, etc.), truncate
    if (!/[.!?]$/.test(sponsorText) && sponsorText.length > 50) {
      // Likely a description got caught - extract only the first part
      const firstSentence = sponsorText.match(/^[^,\n]+/);
      if (firstSentence) {
        sponsorText = firstSentence[0].trim();
      }
    }
    
    // ✅ ROBUST VALIDATION: Detect if it's a descriptive phrase vs real sponsor name
    function isDescriptivePhraseNotSponsor(text: string): boolean {
      // 1. Detect action verbs (descriptions)
      const actionVerbs = /\b(are|is|will|should|featuring|displaying|showing|with|perfectly|aligned|balanced)\b/i;
      if (actionVerbs.test(text)) return true;
      
      // 2. Detect technical adjectives in long phrases (descriptions)
      const techAdjectives = /\b(cohesive|integrated|seamless|professional)\b/i;
      const wordCount = text.split(/\s+/).length;
      if (wordCount > 6 && techAdjectives.test(text)) return true;
      
      // 3. Technical words as WHOLE WORDS, not part of brand names
      // Exception: Allow if followed by "Festival", "Company", "Inc", etc.
      const technicalWordsRegex = /\b(printing|strip|band|logo)\b(?!\s+(Festival|Company|Inc|Co\.|Ltd|Corp))/i;
      if (technicalWordsRegex.test(text)) return true;
      
      // 4. Contains phrases like "au sens" (French) indicating description
      if (/au sens|dans le sens|in the sense/i.test(text)) return true;
      
      return false;
    }
    
    if (!isDescriptivePhraseNotSponsor(sponsorText) && sponsorText.length > 0 && sponsorText.length < 100) {
      // Split by commas or newlines to get individual sponsors
      const sponsors = sponsorText.split(/[,\n]/).filter(s => s.trim().length > 0);
      sponsors.forEach(sponsor => {
        const trimmedSponsor = sponsor.trim();
        // Only add if it's a real sponsor name (not technical description)
        if (trimmedSponsor.length > 2 && trimmedSponsor.length < 50 && !isDescriptivePhraseNotSponsor(trimmedSponsor)) {
          elements.push({
            content: trimmedSponsor,
            type: 'logo-text',
            priority: 3,
            size: 'small',
            placement: 'bottom',
          });
        }
      });
    }
  }
  
  console.log(`✅ [TYPOGRAPHY] Extracted ${elements.length} text elements`);
  
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // 8. BUILD PROMPT SNIPPET
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  const promptSnippet = buildTypographyPromptSnippet(elements, contentType);
  
  return {
    elements,
    hierarchyDescription: buildHierarchyDescription(elements),
    styleGuide: detectTypographyStyle(contentType, intent),
    promptSnippet,
  };
}

/**
 * 🏗️ CONSTRUIT LE SNIPPET DE PROMPT POUR LA TYPOGRAPHY
 */
function buildTypographyPromptSnippet(elements: TextElement[], contentType: string): string {
  if (elements.length === 0) return '';
  
  const parts: string[] = [];
  
  // Sort by priority
  const sorted = [...elements].sort((a, b) => a.priority - b.priority);
  
  sorted.forEach((el, index) => {
    let instruction = '';
    
    // Size descriptor
    const sizeDesc = el.size === 'large' ? 'large headline' 
                   : el.size === 'small' ? 'small body copy'
                   : 'medium';
    
    // Style descriptor
    const styleDesc = el.style === 'bold' ? 'bold'
                    : el.style === 'elegant' ? 'elegant serif'
                    : el.style === 'playful' ? 'playful'
                    : 'clean modern';
    
    // Build instruction according to FLUX.2 guide
    switch (el.type) {
      case 'title':
      case 'headline':
        instruction = `The text "${el.content}" appears as ${sizeDesc} ${styleDesc} headline${el.placement ? ` at the ${el.placement}` : ''}`;
        break;
        
      case 'date':
        instruction = `"${el.content}" displayed in ${sizeDesc} text${el.placement ? ` positioned ${el.placement}` : ''}`;
        break;
        
      case 'location':
        instruction = `"${el.content}" shown in ${sizeDesc} ${styleDesc} text${el.placement ? ` placed ${el.placement}` : ''}`;
        break;
        
      case 'price':
        instruction = `"${el.content}" in ${sizeDesc} text`;
        break;
        
      case 'info':
        instruction = `"${el.content}" as ${sizeDesc} detail text`;
        break;
        
      case 'logo-text':
        instruction = `Sponsor text "${el.content}" in ${sizeDesc} type${el.placement ? ` at ${el.placement}` : ''}`;
        break;
        
      default:
        instruction = `The text "${el.content}" in ${styleDesc} typography`;
    }
    
    // Add color if specified
    if (el.color) {
      instruction += ` in color ${el.color}`;
    }
    
    parts.push(instruction);
  });
  
  return parts.join(', ');
}

/**
 * 📊 CONSTRUIT LA DESCRIPTION DE HIÉRARCHIE
 */
function buildHierarchyDescription(elements: TextElement[]): string {
  const priority1 = elements.filter(e => e.priority === 1);
  const priority2 = elements.filter(e => e.priority === 2);
  const priority3 = elements.filter(e => e.priority === 3);
  
  const parts: string[] = [];
  
  if (priority1.length > 0) {
    parts.push(`Primary: ${priority1.map(e => e.type).join(', ')}`);
  }
  if (priority2.length > 0) {
    parts.push(`Secondary: ${priority2.map(e => e.type).join(', ')}`);
  }
  if (priority3.length > 0) {
    parts.push(`Tertiary: ${priority3.map(e => e.type).join(', ')}`);
  }
  
  return parts.join(' | ');
}

/**
 * 🎨 DÉTECTE LE STYLE TYPOGRAPHIQUE
 */
function detectTypographyStyle(contentType: string, intent: string): string {
  const lower = intent.toLowerCase();
  
  // Poster/Concert → Bold, energetic
  if (contentType === 'poster' || lower.includes('concert') || lower.includes('festival')) {
    return 'bold vibrant typography with high contrast, poster-style text hierarchy';
  }
  
  // Magazine → Editorial
  if (contentType === 'magazine' || lower.includes('magazine') || lower.includes('editorial')) {
    return 'professional editorial typography, magazine layout with clean text hierarchy';
  }
  
  // Ad → Clean, modern
  if (contentType === 'ad' || lower.includes('advertisement') || lower.includes('product')) {
    return 'clean minimalist tech aesthetic, professional product advertisement typography';
  }
  
  // Infographic → Structured
  if (contentType === 'infographic' || lower.includes('infographic')) {
    return 'structured infographic typography with clear data hierarchy';
  }
  
  // Default
  return 'professional clean typography with clear visual hierarchy';
}

/**
 * 🔍 DÉTECTE LE TYPE DE CONTENU
 */
export function detectContentType(intent: string): 'poster' | 'ad' | 'magazine' | 'infographic' | 'generic' {
  const lower = intent.toLowerCase();
  
  if (lower.includes('poster') || lower.includes('affiche') || lower.includes('concert') || lower.includes('festival')) {
    return 'poster';
  }
  
  if (lower.includes('magazine') || lower.includes('editorial')) {
    return 'magazine';
  }
  
  if (lower.includes('advertisement') || lower.includes('product') || lower.includes('ad ')) {
    return 'ad';
  }
  
  if (lower.includes('infographic')) {
    return 'infographic';
  }
  
  return 'generic';
}