// Cinematography Knowledge Base

export const SHOT_TYPES: Record<string, string> = {
  "extreme-wide": "Establishes vast environment, shows scale and context. Subject appears small or distant. Used for opening shots, revealing locations.",
  "wide": "Shows full subject and immediate surroundings. Establishes spatial relationships. Common for action scenes and group shots.",
  "full-shot": "Shows subject head to toe. Balances subject and environment. Good for showing body language and movement.",
  "medium-wide": "Shows subject from knees up. Comfortable framing for conversations and casual scenes.",
  "medium": "Shows subject from waist up. Most common shot in film and TV. Natural, conversational feel.",
  "medium-close": "Shows subject from chest up. More intimate than medium, focuses on upper body and face.",
  "close-up": "Shows face filling frame. Reveals emotions and subtle reactions. Creates intimacy with audience.",
  "extreme-close-up": "Shows specific detail (eyes, hands, object). Emphasizes importance, creates tension or intimacy.",
  "pov": "Point of view shot - shows what character sees. Puts audience in character's perspective.",
  "over-shoulder": "Shot over character's shoulder toward another subject. Common in conversations, creates spatial continuity."
};

export const CAMERA_MOVEMENTS: Record<string, string> = {
  "static": "Camera remains fixed. Stability creates formal, observational quality. Subject moves within frame.",
  "pan-left": "Camera rotates horizontally left. Reveals space, follows action, or creates anticipation.",
  "pan-right": "Camera rotates horizontally right. Reveals space, follows subject, shows reaction.",
  "tilt-up": "Camera rotates vertically upward. Reveals height, grandeur, or importance. Can show character's perspective looking up.",
  "tilt-down": "Camera rotates vertically downward. Shows descent, vulnerability, or reveals ground-level detail.",
  "dolly-in": "Camera moves forward toward subject. Intensifies emotion, increases intimacy, draws audience into scene.",
  "dolly-out": "Camera moves backward from subject. Reveals context, creates distance, shows isolation or scale.",
  "tracking": "Camera follows subject laterally. Maintains consistent framing while showing movement through space.",
  "crane": "Camera moves vertically and laterally on crane. Shows scale, transitions between heights, creates epic feel.",
  "handheld": "Camera held by operator, not stabilized. Creates documentary feel, urgency, intimacy, or chaos.",
  "steadicam": "Stabilized handheld camera. Smooth floating movement, follows subject fluidly, creates immersive feel.",
  "orbit": "Camera rotates around subject. Reveals all angles, creates dynamic presentation."
};

export const LIGHTING_SETUPS: Record<string, string> = {
  "three-point": "Classic setup: key light (main), fill light (shadows), back light (separation). Balanced, professional look.",
  "rembrandt": "45-degree angle key light creating triangle of light on shadowed cheek. Dramatic, painterly quality.",
  "butterfly": "Light above and in front of subject, creating butterfly shadow under nose. Glamorous, beauty-focused.",
  "loop": "Slight variation of Rembrandt, loop shadow from nose toward corner of mouth. Natural, flattering.",
  "split": "Light illuminates one half of face, other half in shadow. Dramatic, mysterious, shows duality.",
  "rim": "Light from behind subject creating bright outline. Separates subject from background, creates depth and drama.",
  "silhouette": "Strong backlight with no front light. Subject appears as dark shape. Mystery, anonymity, artistic.",
  "natural": "Uses available light (sun, windows, practicals). Realistic, documentary feel, soft and authentic.",
  "low-key": "High contrast with deep shadows, minimal fill light. Noir, mystery, drama, tension.",
  "high-key": "Bright, even lighting with minimal shadows. Cheerful, optimistic, commercial, clean."
};

export const LENS_CHOICES = [
  {
    focal: "14-24mm",
    usage: "Ultra wide angle",
    feel: "Dramatic perspective, distortion, vastness. Action, architecture, immersive POV."
  },
  {
    focal: "24-35mm",
    usage: "Wide angle",
    feel: "Cinematic field of view, environmental context. Establishing shots, intimate spaces."
  },
  {
    focal: "50mm",
    usage: "Standard / Normal",
    feel: "Natural perspective matching human eye. Versatile, neutral, documentary feel."
  },
  {
    focal: "85mm",
    usage: "Portrait",
    feel: "Flattering compression, beautiful bokeh. Interviews, close-ups, emotional scenes."
  },
  {
    focal: "100-135mm",
    usage: "Telephoto",
    feel: "Strong compression, isolated subject. Emotional intimacy, observational shots."
  },
  {
    focal: "200mm+",
    usage: "Super telephoto",
    feel: "Extreme compression, voyeuristic. Wildlife, sports, surveillance aesthetic."
  }
];

export const COMPOSITION_RULES = {
  "rule-of-thirds": "Divide frame into 9 sections, place subject on intersections. Creates balance and visual interest.",
  "golden-ratio": "Natural mathematical proportion (1.618:1). Creates pleasing, harmonious composition.",
  "leading-lines": "Use natural lines to guide eye toward subject. Paths, roads, architecture create depth.",
  "symmetry": "Perfect balance creates formal, powerful, often unsettling imagery. Architecture, face close-ups.",
  "negative-space": "Empty space around subject creates isolation, minimalism, or emphasizes scale.",
  "frame-within-frame": "Use natural frames (doorways, windows) to focus attention and add depth.",
  "depth-layering": "Foreground, mid-ground, background elements create dimensional, cinematic image.",
  "dutch-angle": "Tilted camera creates unease, disorientation, chaos, or stylized energy."
};

export const COLOR_GRADING_STYLES = {
  "cinematic": "Teal shadows, orange highlights. Modern blockbuster look. High contrast, saturated.",
  "vintage": "Faded colors, lifted blacks, warm tones. Nostalgic, timeless feel. Film grain.",
  "bleach-bypass": "Desaturated with high contrast. Gritty, raw, war/action aesthetic.",
  "cross-process": "Shifted color curves, unusual hues. Artistic, fashion, experimental.",
  "noir": "High contrast black and white or near-monochrome. Shadows, mystery, classic.",
  "warm": "Orange/yellow tones, cozy feel. Sunset, comfort, nostalgia, happiness.",
  "cool": "Blue/teal tones, clinical feel. Technology, isolation, sadness, calm.",
  "natural": "Balanced, realistic colors. Documentary, authentic, unmanipulated feel."
};
