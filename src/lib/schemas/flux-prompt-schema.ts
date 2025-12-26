/**
 * COCONUT V14 - FLUX PROMPT JSON SCHEMA
 * Phase 3 - Jour 4: JSON Schema for Monaco validation
 */

export const fluxPromptSchema = {
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Flux 2 Pro Prompt",
  "description": "Structured prompt for Flux 2 Pro image generation",
  "type": "object",
  "required": ["scene", "style", "subjects"],
  "properties": {
    "scene": {
      "type": "string",
      "description": "Main scene description - what is happening, environment, mood",
      "minLength": 10,
      "maxLength": 500,
      "examples": [
        "A modern office space with floor-to-ceiling windows overlooking a city skyline at sunset",
        "A cozy coffee shop interior with warm lighting and vintage furniture"
      ]
    },
    "style": {
      "type": "object",
      "description": "Visual style and aesthetic preferences",
      "required": ["primary"],
      "properties": {
        "primary": {
          "type": "string",
          "description": "Primary visual style",
          "enum": [
            "photorealistic",
            "cinematic",
            "minimalist",
            "vibrant",
            "moody",
            "high-contrast",
            "soft-light",
            "dramatic",
            "editorial",
            "commercial"
          ]
        },
        "secondary": {
          "type": "array",
          "description": "Additional style modifiers",
          "items": {
            "type": "string",
            "enum": [
              "bokeh",
              "golden-hour",
              "high-key",
              "low-key",
              "film-grain",
              "sharp-focus",
              "wide-angle",
              "telephoto",
              "macro",
              "symmetrical"
            ]
          },
          "maxItems": 3
        },
        "colorPalette": {
          "type": "string",
          "description": "Color palette description",
          "examples": [
            "warm earth tones",
            "cool blues and grays",
            "vibrant primary colors"
          ]
        },
        "mood": {
          "type": "string",
          "description": "Overall mood and atmosphere",
          "enum": [
            "energetic",
            "calm",
            "mysterious",
            "joyful",
            "professional",
            "intimate",
            "epic",
            "serene"
          ]
        }
      }
    },
    "subjects": {
      "type": "array",
      "description": "Main subjects in the image",
      "minItems": 1,
      "maxItems": 5,
      "items": {
        "type": "object",
        "required": ["description"],
        "properties": {
          "description": {
            "type": "string",
            "description": "Subject description",
            "minLength": 5,
            "maxLength": 200
          },
          "position": {
            "type": "string",
            "description": "Position in frame",
            "enum": [
              "center",
              "left",
              "right",
              "foreground",
              "background",
              "top-left",
              "top-right",
              "bottom-left",
              "bottom-right"
            ]
          },
          "emphasis": {
            "type": "string",
            "description": "Level of emphasis",
            "enum": ["primary", "secondary", "background"]
          },
          "details": {
            "type": "array",
            "description": "Specific details to include",
            "items": { "type": "string" },
            "maxItems": 5
          }
        }
      }
    },
    "lighting": {
      "type": "object",
      "description": "Lighting setup",
      "properties": {
        "type": {
          "type": "string",
          "description": "Lighting type",
          "enum": [
            "natural",
            "studio",
            "ambient",
            "directional",
            "backlighting",
            "rim-lighting",
            "three-point"
          ]
        },
        "quality": {
          "type": "string",
          "description": "Light quality",
          "enum": ["soft", "hard", "diffused", "dramatic"]
        },
        "direction": {
          "type": "string",
          "description": "Light direction",
          "enum": [
            "front",
            "side",
            "back",
            "top",
            "bottom",
            "45-degree"
          ]
        },
        "timeOfDay": {
          "type": "string",
          "description": "Time of day",
          "enum": [
            "sunrise",
            "morning",
            "midday",
            "afternoon",
            "golden-hour",
            "sunset",
            "dusk",
            "night"
          ]
        }
      }
    },
    "camera": {
      "type": "object",
      "description": "Camera and lens settings",
      "properties": {
        "angle": {
          "type": "string",
          "description": "Camera angle",
          "enum": [
            "eye-level",
            "high-angle",
            "low-angle",
            "birds-eye",
            "worms-eye",
            "dutch-angle"
          ]
        },
        "shot": {
          "type": "string",
          "description": "Shot type",
          "enum": [
            "extreme-close-up",
            "close-up",
            "medium-shot",
            "full-shot",
            "wide-shot",
            "extreme-wide-shot"
          ]
        },
        "lens": {
          "type": "string",
          "description": "Lens type or focal length",
          "examples": ["24mm", "50mm", "85mm", "200mm", "wide-angle", "telephoto"]
        },
        "aperture": {
          "type": "string",
          "description": "Aperture setting for depth of field",
          "pattern": "^f\\/[0-9.]+$",
          "examples": ["f/1.4", "f/2.8", "f/5.6", "f/11"]
        }
      }
    },
    "composition": {
      "type": "object",
      "description": "Composition rules and guidelines",
      "properties": {
        "rule": {
          "type": "string",
          "description": "Composition rule",
          "enum": [
            "rule-of-thirds",
            "golden-ratio",
            "symmetry",
            "leading-lines",
            "frame-within-frame",
            "negative-space"
          ]
        },
        "balance": {
          "type": "string",
          "description": "Visual balance",
          "enum": ["symmetrical", "asymmetrical", "radial"]
        },
        "depth": {
          "type": "string",
          "description": "Depth perception",
          "enum": ["shallow", "medium", "deep"]
        }
      }
    },
    "postProcessing": {
      "type": "object",
      "description": "Post-processing effects",
      "properties": {
        "effects": {
          "type": "array",
          "description": "Visual effects to apply",
          "items": {
            "type": "string",
            "enum": [
              "vignette",
              "bloom",
              "chromatic-aberration",
              "lens-flare",
              "grain",
              "sharpening",
              "color-grading"
            ]
          },
          "maxItems": 4
        },
        "intensity": {
          "type": "string",
          "description": "Effect intensity",
          "enum": ["subtle", "moderate", "strong"]
        }
      }
    },
    "negativePrompt": {
      "type": "string",
      "description": "Things to avoid in the generation",
      "maxLength": 300,
      "examples": [
        "blurry, low quality, distorted, watermark, text",
        "unrealistic, oversaturated, noisy"
      ]
    },
    "metadata": {
      "type": "object",
      "description": "Additional metadata",
      "properties": {
        "tags": {
          "type": "array",
          "items": { "type": "string" },
          "maxItems": 10
        },
        "version": {
          "type": "string",
          "pattern": "^\\d+\\.\\d+$",
          "default": "1.0"
        }
      }
    }
  }
};

/**
 * Default Flux prompt template
 */
export const defaultFluxPrompt = {
  scene: "A professional workspace with modern design",
  style: {
    primary: "photorealistic",
    secondary: ["soft-light"],
    colorPalette: "neutral tones with blue accents",
    mood: "professional"
  },
  subjects: [
    {
      description: "Main subject",
      position: "center",
      emphasis: "primary"
    }
  ],
  lighting: {
    type: "natural",
    quality: "soft",
    timeOfDay: "morning"
  },
  camera: {
    angle: "eye-level",
    shot: "medium-shot",
    lens: "50mm"
  },
  composition: {
    rule: "rule-of-thirds",
    balance: "asymmetrical"
  }
};

/**
 * Auto-complete suggestions for Monaco
 */
export const fluxPromptSuggestions = {
  styles: [
    "photorealistic",
    "cinematic",
    "minimalist",
    "vibrant",
    "moody",
    "high-contrast",
    "soft-light",
    "dramatic",
    "editorial",
    "commercial"
  ],
  
  styleModifiers: [
    "bokeh",
    "golden-hour",
    "high-key",
    "low-key",
    "film-grain",
    "sharp-focus",
    "wide-angle",
    "telephoto",
    "macro",
    "symmetrical"
  ],
  
  moods: [
    "energetic",
    "calm",
    "mysterious",
    "joyful",
    "professional",
    "intimate",
    "epic",
    "serene"
  ],
  
  positions: [
    "center",
    "left",
    "right",
    "foreground",
    "background",
    "top-left",
    "top-right",
    "bottom-left",
    "bottom-right"
  ],
  
  lightingTypes: [
    "natural",
    "studio",
    "ambient",
    "directional",
    "backlighting",
    "rim-lighting",
    "three-point"
  ],
  
  timesOfDay: [
    "sunrise",
    "morning",
    "midday",
    "afternoon",
    "golden-hour",
    "sunset",
    "dusk",
    "night"
  ],
  
  cameraAngles: [
    "eye-level",
    "high-angle",
    "low-angle",
    "birds-eye",
    "worms-eye",
    "dutch-angle"
  ],
  
  shotTypes: [
    "extreme-close-up",
    "close-up",
    "medium-shot",
    "full-shot",
    "wide-shot",
    "extreme-wide-shot"
  ],
  
  compositionRules: [
    "rule-of-thirds",
    "golden-ratio",
    "symmetry",
    "leading-lines",
    "frame-within-frame",
    "negative-space"
  ]
};
