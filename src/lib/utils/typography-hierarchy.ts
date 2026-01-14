/**
 * TYPOGRAPHY HIERARCHY SYSTEM
 * Professional typographic specifications
 * Ensures pixel-perfect text rendering in prompts
 */

export interface TypographySpec {
  text: string;
  font: string;
  weight: number;
  size: string;
  tracking: string;
  lineHeight: number;
  color: string;
  alignment: 'left' | 'center' | 'right';
  position: string;
  maxWidth: string;
}

export interface TypographyHierarchy {
  h1?: TypographySpec;
  h2?: TypographySpec;
  h3?: TypographySpec;
  body?: TypographySpec;
  caption?: TypographySpec;
  specs?: TypographySpec;
}

/**
 * Generate complete typography hierarchy for advertising
 */
export function generateTypographyHierarchy(
  copyContent: {
    headline: string;
    subhead?: string;
    body?: string;
    specs?: string;
    cta?: string;
  },
  style: 'premium' | 'minimal' | 'bold' | 'elegant' = 'premium',
  colorPalette: { primary?: string; text?: string; accent?: string } = {}
): TypographyHierarchy {
  const { headline, subhead, body, specs, cta } = copyContent;
  const { primary = '#1A1A1A', text = '#2A2420', accent = '#D4A574' } = colorPalette;
  
  const hierarchy: TypographyHierarchy = {};
  
  // H1: Main headline
  if (headline) {
    hierarchy.h1 = {
      text: headline,
      font: getFontForStyle(style, 'headline'),
      weight: getWeightForStyle(style, 'headline'),
      size: getSizeForStyle(style, 'headline'),
      tracking: getTrackingForStyle(style, 'headline'),
      lineHeight: 1.1,
      color: style === 'premium' ? accent : primary,
      alignment: 'center',
      position: 'upper third, 18% from top',
      maxWidth: '85% of frame',
    };
  }
  
  // H2: Subhead
  if (subhead) {
    hierarchy.h2 = {
      text: subhead,
      font: getFontForStyle(style, 'subhead'),
      weight: getWeightForStyle(style, 'subhead'),
      size: getSizeForStyle(style, 'subhead'),
      tracking: getTrackingForStyle(style, 'subhead'),
      lineHeight: 1.3,
      color: text,
      alignment: 'center',
      position: 'below headline, 8% margin',
      maxWidth: '75% of frame',
    };
  }
  
  // Body: Additional text
  if (body) {
    hierarchy.body = {
      text: body,
      font: getFontForStyle(style, 'body'),
      weight: 400,
      size: '16pt',
      tracking: '0',
      lineHeight: 1.6,
      color: text,
      alignment: 'center',
      position: 'middle section',
      maxWidth: '70% of frame',
    };
  }
  
  // Specs: Product specifications
  if (specs) {
    hierarchy.specs = {
      text: specs,
      font: getFontForStyle(style, 'caption'),
      weight: 300,
      size: '14pt',
      tracking: '50',
      lineHeight: 1.4,
      color: '#FFFFFF',
      alignment: 'center',
      position: 'bottom center, 12% from bottom',
      maxWidth: '80% of frame',
    };
  }
  
  // Caption: CTA or additional info
  if (cta) {
    hierarchy.caption = {
      text: cta,
      font: getFontForStyle(style, 'caption'),
      weight: 500,
      size: '12pt',
      tracking: '100',
      lineHeight: 1.4,
      color: text,
      alignment: 'center',
      position: 'bottom, 6% from bottom',
      maxWidth: '60% of frame',
    };
  }
  
  return hierarchy;
}

/**
 * Get font family based on style
 */
function getFontForStyle(
  style: string,
  level: 'headline' | 'subhead' | 'body' | 'caption'
): string {
  const fonts = {
    premium: {
      headline: 'Playfair Display',
      subhead: 'Montserrat',
      body: 'Lato',
      caption: 'Lato',
    },
    minimal: {
      headline: 'Helvetica Neue',
      subhead: 'Helvetica Neue',
      body: 'Helvetica Neue',
      caption: 'Helvetica Neue',
    },
    bold: {
      headline: 'Bebas Neue',
      subhead: 'Montserrat',
      body: 'Open Sans',
      caption: 'Open Sans',
    },
    elegant: {
      headline: 'Cormorant Garamond',
      subhead: 'Lato',
      body: 'Lato',
      caption: 'Lato',
    },
  };
  
  return fonts[style]?.[level] || fonts.premium[level];
}

/**
 * Get font weight based on style
 */
function getWeightForStyle(
  style: string,
  level: 'headline' | 'subhead' | 'body' | 'caption'
): number {
  const weights = {
    premium: {
      headline: 700,
      subhead: 400,
      body: 400,
      caption: 300,
    },
    minimal: {
      headline: 300,
      subhead: 300,
      body: 300,
      caption: 300,
    },
    bold: {
      headline: 900,
      subhead: 700,
      body: 400,
      caption: 400,
    },
    elegant: {
      headline: 400,
      subhead: 300,
      body: 300,
      caption: 300,
    },
  };
  
  return weights[style]?.[level] || weights.premium[level];
}

/**
 * Get font size based on style
 */
function getSizeForStyle(
  style: string,
  level: 'headline' | 'subhead' | 'body' | 'caption'
): string {
  const sizes = {
    premium: {
      headline: '72pt',
      subhead: '36pt',
      body: '18pt',
      caption: '12pt',
    },
    minimal: {
      headline: '96pt',
      subhead: '24pt',
      body: '16pt',
      caption: '10pt',
    },
    bold: {
      headline: '120pt',
      subhead: '48pt',
      body: '20pt',
      caption: '14pt',
    },
    elegant: {
      headline: '64pt',
      subhead: '32pt',
      body: '16pt',
      caption: '11pt',
    },
  };
  
  return sizes[style]?.[level] || sizes.premium[level];
}

/**
 * Get letter spacing (tracking) based on style
 */
function getTrackingForStyle(
  style: string,
  level: 'headline' | 'subhead' | 'body' | 'caption'
): string {
  const tracking = {
    premium: {
      headline: '-20',
      subhead: '0',
      body: '0',
      caption: '50',
    },
    minimal: {
      headline: '100',
      subhead: '50',
      body: '0',
      caption: '100',
    },
    bold: {
      headline: '-40',
      subhead: '-10',
      body: '0',
      caption: '0',
    },
    elegant: {
      headline: '20',
      subhead: '10',
      body: '0',
      caption: '80',
    },
  };
  
  return tracking[style]?.[level] || tracking.premium[level];
}

/**
 * Convert typography spec to FLUX prompt description
 */
export function typographyToPromptDescription(spec: TypographySpec): string {
  return `Text reading '${spec.text}', 
    font '${spec.font}' size ${spec.size} weight ${spec.weight}, 
    tracking ${spec.tracking}, line-height ${spec.lineHeight}, 
    color ${spec.color}, ${spec.alignment} aligned, 
    positioned at ${spec.position}, max-width ${spec.maxWidth}`;
}

/**
 * Apply baseline grid for vertical rhythm
 */
export function applyBaselineGrid(
  hierarchy: TypographyHierarchy,
  baselineUnit: number = 8
): TypographyHierarchy {
  // Ensure all line heights are multiples of baseline unit
  const adjusted: TypographyHierarchy = {};
  
  for (const [key, spec] of Object.entries(hierarchy)) {
    if (spec) {
      const fontSize = parseInt(spec.size);
      const targetLineHeight = Math.ceil((fontSize * spec.lineHeight) / baselineUnit) * baselineUnit;
      
      adjusted[key as keyof TypographyHierarchy] = {
        ...spec,
        lineHeight: targetLineHeight / fontSize,
      };
    }
  }
  
  return adjusted;
}
