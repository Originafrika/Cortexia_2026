// Sound Design Knowledge Base

export const MUSIC_MOODS = {
  epic: {
    description: "Grand, powerful, heroic. Orchestral swells, drums, brass.",
    usage: "Product launches, brand anthems, achievements",
    instruments: ["Orchestra", "Choir", "Percussion", "Brass"],
    tempo: "Moderate to Fast (120-140 BPM)",
    examples: ["Trailer music", "Sports highlights", "Hero moments"]
  },
  
  uplifting: {
    description: "Positive, hopeful, inspiring. Major keys, building progressions.",
    usage: "Success stories, testimonials, celebrations",
    instruments: ["Piano", "Strings", "Acoustic Guitar", "Light Percussion"],
    tempo: "Medium (100-120 BPM)",
    examples: ["Corporate videos", "Feel-good ads", "Charity campaigns"]
  },
  
  mysterious: {
    description: "Intriguing, suspenseful, curious. Sparse, atmospheric.",
    usage: "Teasers, reveals, investigative content",
    instruments: ["Synth pads", "Minimal piano", "Ambient textures"],
    tempo: "Slow to Medium (80-100 BPM)",
    examples: ["Product teasers", "Mystery campaigns", "Sci-fi"]
  },
  
  energetic: {
    description: "Fast-paced, exciting, dynamic. Electronic or rock elements.",
    usage: "Action, sports, youth brands, technology",
    instruments: ["Electric guitar", "Drums", "Synth", "Bass"],
    tempo: "Fast (130-160 BPM)",
    examples: ["Sports ads", "Gaming", "Fitness", "Tech launches"]
  },
  
  emotional: {
    description: "Touching, heartfelt, intimate. Strings, piano, minimal.",
    usage: "Stories, causes, family moments, nostalgia",
    instruments: ["Piano", "Strings", "Cello", "Minimal vocals"],
    tempo: "Slow (60-80 BPM)",
    examples: ["Charity ads", "Family brands", "Memorial content"]
  },
  
  corporate: {
    description: "Professional, confident, modern. Clean, polished.",
    usage: "B2B, presentations, professional services",
    instruments: ["Piano", "Light electronic", "Marimba", "Soft percussion"],
    tempo: "Medium (100-120 BPM)",
    examples: ["Corporate videos", "Explainers", "LinkedIn content"]
  },
  
  funky: {
    description: "Groovy, fun, retro. Bass-driven, rhythmic.",
    usage: "Playful brands, fashion, food, lifestyle",
    instruments: ["Bass guitar", "Electric piano", "Brass", "Drums"],
    tempo: "Medium (100-115 BPM)",
    examples: ["Fashion ads", "Food brands", "Lifestyle content"]
  },
  
  ambient: {
    description: "Atmospheric, spacious, subtle. Background texture.",
    usage: "Luxury, meditation, technology, sci-fi",
    instruments: ["Synth pads", "Drones", "Minimal piano", "Field recordings"],
    tempo: "Slow (60-90 BPM)",
    examples: ["Luxury brands", "Tech demos", "Spa/wellness"]
  }
};

export const SOUND_EFFECTS_CATEGORIES = {
  impact: {
    description: "Punctuate moments, transitions, reveals",
    examples: [
      "Whoosh (transition)",
      "Hit/Slam (impact moment)",
      "Rise/Swell (build anticipation)",
      "Drop (bass drop, reveal)",
      "Sting (punctuation)"
    ],
    usage: "Logo reveals, product drops, scene transitions"
  },
  
  ambient: {
    description: "Environmental atmosphere, world-building",
    examples: [
      "City ambience",
      "Nature sounds",
      "Office background",
      "Cafe chatter",
      "Ocean waves"
    ],
    usage: "Establishing shots, location setting, realism"
  },
  
  foley: {
    description: "Realistic everyday sounds",
    examples: [
      "Footsteps",
      "Door open/close",
      "Object handling",
      "Clothing rustles",
      "Paper sounds"
    ],
    usage: "Adding realism, emphasizing actions, detail"
  },
  
  ui: {
    description: "Interface and tech sounds",
    examples: [
      "Button clicks",
      "Screen transitions",
      "Notifications",
      "Loading/processing",
      "Error/success tones"
    ],
    usage: "App demos, tech products, digital interfaces"
  },
  
  musical: {
    description: "Tonal sound design elements",
    examples: [
      "Logo sonic brand",
      "Product 'voice'",
      "Signature sound",
      "Melodic stingers",
      "Brand audio cue"
    ],
    usage: "Brand identity, product sounds, memorability"
  }
};

export const VOICEOVER_STYLES = {
  narrator: {
    description: "Authoritative third-person storytelling",
    characteristics: ["Clear", "Measured pace", "Neutral accent", "Professional"],
    usage: "Documentaries, corporate, explainers",
    tone: "Informative, credible, trustworthy"
  },
  
  conversational: {
    description: "Friendly, relatable, direct-to-camera feel",
    characteristics: ["Natural", "Warm", "Casual delivery", "Personable"],
    usage: "Social media, testimonials, lifestyle brands",
    tone: "Friendly, authentic, approachable"
  },
  
  cinematic: {
    description: "Dramatic, movie-trailer quality",
    characteristics: ["Deep voice", "Dramatic pauses", "Build tension", "Epic"],
    usage: "Product launches, trailers, epic reveals",
    tone: "Powerful, dramatic, commanding"
  },
  
  character: {
    description: "Specific persona or personality",
    characteristics: ["Unique voice", "Personality-driven", "Memorable", "Distinctive"],
    usage: "Brand mascots, animated content, quirky brands",
    tone: "Playful, unique, branded"
  },
  
  instructional: {
    description: "Clear, educational, step-by-step",
    characteristics: ["Patient", "Clear enunciation", "Supportive", "Methodical"],
    usage: "Tutorials, how-tos, training videos",
    tone: "Helpful, clear, reassuring"
  }
};

export const AUDIO_MIXING_TECHNIQUES = {
  "dialogue-priority": {
    description: "Voice always clear and upfront",
    levels: { dialogue: "0dB", music: "-20dB", sfx: "-15dB" },
    usage: "Interviews, testimonials, explainers"
  },
  
  "music-driven": {
    description: "Music is hero, dialogue supports",
    levels: { music: "-5dB", dialogue: "-10dB", sfx: "-18dB" },
    usage: "Music videos, brand anthems, emotional pieces"
  },
  
  "balanced": {
    description: "Equal importance to all elements",
    levels: { dialogue: "-5dB", music: "-15dB", sfx: "-12dB" },
    usage: "Commercials, narratives, most content"
  },
  
  "immersive": {
    description: "Ambient and SFX create world",
    levels: { ambient: "-8dB", sfx: "-10dB", music: "-20dB", dialogue: "0dB" },
    usage: "Cinematic content, documentaries, atmosphere"
  }
};

export const AUDIO_TRANSITIONS = {
  "j-cut": "Audio from next scene starts before visual cut. Smooth, anticipatory.",
  "l-cut": "Audio from previous scene continues after visual cut. Thoughtful, contemplative.",
  "crossfade": "Gradual blend between audio sources. Gentle, seamless transition.",
  "hard-cut": "Abrupt audio change with visual cut. Energetic, shocking, punctuating.",
  "audio-bridge": "Sound effect or music connects disparate scenes. Thematic continuity.",
  "silence": "Intentional absence of sound. Dramatic, emphasizes next moment, tension."
};

export const BRAND_SONIC_GUIDELINES = {
  "audio-logo": {
    description: "3-5 second signature sound identifying brand",
    elements: ["Memorable melody", "Distinctive sound", "Consistent use", "Emotional resonance"],
    examples: ["Intel bong", "Netflix 'ta-dum'", "McDonald's 'I'm lovin' it'"]
  },
  
  "music-style": {
    description: "Consistent musical genre/style for brand",
    considerations: ["Genre fit with brand personality", "Instrumentation consistency", "Tempo range", "Emotional palette"],
    examples: ["Apple - minimal, modern", "Nike - energetic, epic", "Coca-Cola - uplifting, joyful"]
  },
  
  "voice-casting": {
    description: "Consistent voice characteristics",
    factors: ["Age range", "Gender", "Accent/dialect", "Tone qualities", "Pace"],
    examples: ["Luxury - mature, sophisticated", "Youth - energetic, casual", "Tech - clear, modern"]
  }
};

// Audio prompt generation helpers
export function generateAudioPrompt(
  mood: keyof typeof MUSIC_MOODS,
  duration: number,
  usage: string
): string {
  const moodData = MUSIC_MOODS[mood];
  return `${moodData.description} ${duration} second music track, ${moodData.tempo}, featuring ${moodData.instruments.join(', ')}, professional production quality, for ${usage}`;
}

export function generateVoiceoverPrompt(
  style: keyof typeof VOICEOVER_STYLES,
  script: string,
  emotion: string
): string {
  const voData = VOICEOVER_STYLES[style];
  return `${voData.description} voiceover, ${voData.tone} tone, conveying ${emotion} emotion, professional voice talent, clear articulation, script: "${script}"`;
}
