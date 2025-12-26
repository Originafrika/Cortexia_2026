// Storytelling & Narrative Knowledge Base

export const STORY_ARCHETYPES = {
  "heros-journey": {
    description: "Classic transformation arc - ordinary to extraordinary",
    beats: [
      "Ordinary World",
      "Call to Adventure",
      "Refusal of Call",
      "Meeting Mentor",
      "Crossing Threshold",
      "Tests & Trials",
      "Approach to Inmost Cave",
      "Ordeal",
      "Reward",
      "The Road Back",
      "Resurrection",
      "Return with Elixir"
    ],
    usage: "Product launches, brand stories, testimonials"
  },
  
  "rags-to-riches": {
    description: "Rise from nothing to success",
    beats: ["Struggle", "Opportunity", "Transformation", "Success", "New Challenge"],
    usage: "Startup stories, personal brands, motivational content"
  },
  
  "quest": {
    description: "Journey to obtain something valuable",
    beats: ["Goal Setting", "Preparation", "Journey Begins", "Obstacles", "Victory"],
    usage: "Campaign launches, product reveals, challenges"
  },
  
  "overcoming-monster": {
    description: "Confronting and defeating a threat",
    beats: ["Monster Appears", "Recognition", "Preparation", "Battle", "Victory"],
    usage: "Problem-solution ads, competitive positioning"
  },
  
  "rebirth": {
    description: "Transformation and renewal",
    beats: ["Trapped State", "Catalyst", "Struggle", "Breaking Point", "Rebirth"],
    usage: "Before/after, rebranding, makeovers"
  }
};

export const HOOK_TECHNIQUES = {
  "pattern-interrupt": "Start with unexpected element that breaks scroll. Shock, surprise, or novelty.",
  "question": "Pose compelling question viewer wants answered. Creates curiosity gap.",
  "bold-claim": "Make provocative statement that demands attention. Controversial or surprising.",
  "visual-spectacle": "Open with stunning visual that stops the scroll. Beauty, scale, or uniqueness.",
  "problem-agitate": "Show painful problem viewer relates to. Emotional resonance.",
  "mystery": "Present puzzle or incomplete information. Viewer wants resolution.",
  "promise": "Explicit benefit or value proposition upfront. Clear WIIFM (What's In It For Me).",
  "story-cold-open": "Drop into middle of compelling action or moment. Create immediate engagement.",
  "relatability": "Show common experience or feeling. 'You know when...' moment.",
  "controversy": "Take stance or challenge assumption. Polarizing but engaging."
};

export const TRANSITION_TECHNIQUES = {
  "match-cut": "Cut between similar visual elements. Seamless flow, connects scenes thematically.",
  "match-action": "Cut mid-action continuing in next shot. Maintains momentum and energy.",
  "graphic-match": "Similar shapes/compositions bridge scenes. Visual poetry, artistic flow.",
  "sound-bridge": "Audio from next scene starts before visual cut. Smooth, anticipatory.",
  "dissolve": "Gradual blend between shots. Passage of time, dreamlike quality, gentle transition.",
  "fade": "Fade to/from black. Chapter break, finality, contemplative pause.",
  "wipe": "One image replaces another with moving line. Energetic, retro, playful.",
  "whip-pan": "Rapid camera movement blurs between shots. Dynamic, modern, high-energy.",
  "morph": "Seamless transformation between elements. Magical, surreal, branded moments.",
  "cut-to-beat": "Hard cut synchronized with music. Rhythmic, energetic, music-video style."
};

export const PACING_STRATEGIES = {
  "fast": {
    description: "Quick cuts, high energy, constant movement",
    usage: "Action scenes, montages, youth products, social media",
    shotDuration: "0.5-2 seconds per shot",
    techniques: ["Jump cuts", "Quick zooms", "Rapid camera moves", "Staccato editing"]
  },
  
  "medium": {
    description: "Balanced rhythm, varied shot lengths",
    usage: "Narratives, commercials, most content",
    shotDuration: "2-5 seconds per shot",
    techniques: ["Mix of static and movement", "Motivated cuts", "Natural rhythm"]
  },
  
  "slow": {
    description: "Long takes, contemplative, deliberate",
    usage: "Luxury brands, artistic content, emotional stories",
    shotDuration: "5-15+ seconds per shot",
    techniques: ["Long takes", "Slow motion", "Minimal cuts", "Breathing room"]
  },
  
  "rhythmic": {
    description: "Synchronized to music beat",
    usage: "Music videos, dance, energetic products",
    shotDuration: "Matches musical tempo",
    techniques: ["Beat-matched cuts", "Choreographed movement", "Visual rhythm"]
  },
  
  "crescendo": {
    description: "Starts slow, accelerates to climax",
    usage: "Building tension, reveals, launches",
    shotDuration: "Decreasing shot length over time",
    techniques: ["Progressive acceleration", "Layering", "Building complexity"]
  }
};

export const EMOTIONAL_BEATS = {
  joy: ["Discovery", "Celebration", "Connection", "Victory", "Wonder"],
  sadness: ["Loss", "Longing", "Regret", "Isolation", "Melancholy"],
  fear: ["Threat", "Uncertainty", "Dread", "Panic", "Relief"],
  anger: ["Injustice", "Frustration", "Confrontation", "Resolution", "Empowerment"],
  surprise: ["Revelation", "Plot Twist", "Unexpected", "Realization", "Amazement"],
  trust: ["Vulnerability", "Support", "Loyalty", "Reliability", "Comfort"],
  anticipation: ["Preparation", "Hope", "Expectation", "Countdown", "Build-up"],
  disgust: ["Rejection", "Aversion", "Criticism", "Purification", "Renewal"]
};

export const COMMERCIAL_STRUCTURES = {
  "problem-solution": {
    structure: ["Show Problem", "Agitate", "Introduce Solution", "Demonstrate", "CTA"],
    duration: "15-30s",
    usage: "Product ads, services, B2B"
  },
  
  "testimonial": {
    structure: ["Before State", "Discovery", "Transformation", "After State", "Recommendation"],
    duration: "30-60s",
    usage: "Trust-building, social proof, case studies"
  },
  
  "lifestyle": {
    structure: ["Aspiration", "Product Integration", "Experience", "Emotion", "Brand"],
    duration: "20-45s",
    usage: "Luxury, fashion, lifestyle brands"
  },
  
  "comparison": {
    structure: ["Alternative A", "Problems with A", "Alternative B (Product)", "Benefits", "Choice"],
    duration: "20-30s",
    usage: "Competitive positioning, disruptors"
  },
  
  "story": {
    structure: ["Setup", "Conflict", "Product as Solution", "Resolution", "Message"],
    duration: "45-90s",
    usage: "Brand building, emotional connection"
  },
  
  "explainer": {
    structure: ["Hook Question", "Problem Context", "How It Works", "Benefits", "CTA"],
    duration: "30-60s",
    usage: "Tech products, complex services, education"
  }
};

export const CALL_TO_ACTIONS = {
  direct: [
    "Shop Now",
    "Learn More",
    "Get Started",
    "Sign Up Free",
    "Download Now",
    "Join Today",
    "Book Demo",
    "Try Free"
  ],
  
  soft: [
    "Discover More",
    "Explore",
    "See How",
    "Find Out",
    "Experience",
    "Join Us",
    "Be Part Of",
    "Unlock"
  ],
  
  urgency: [
    "Limited Time",
    "Don't Miss Out",
    "Act Now",
    "Today Only",
    "While Supplies Last",
    "Ends Soon",
    "Last Chance",
    "Hurry"
  ],
  
  social: [
    "Share Your Story",
    "Tag A Friend",
    "Join The Movement",
    "Spread The Word",
    "Show Us",
    "Follow Along",
    "Comment Below",
    "What Would You Do?"
  ]
};

export const BRAND_TONES = {
  professional: "Authoritative, credible, polished, formal, expert",
  friendly: "Warm, approachable, conversational, casual, welcoming",
  luxurious: "Sophisticated, exclusive, refined, premium, elegant",
  playful: "Fun, energetic, quirky, humorous, lighthearted",
  inspiring: "Uplifting, motivational, aspirational, empowering, visionary",
  authentic: "Genuine, transparent, honest, relatable, human",
  innovative: "Cutting-edge, bold, futuristic, disruptive, pioneering",
  compassionate: "Caring, empathetic, supportive, understanding, kind"
};

// Story prompt enhancement
export function enhanceWithStorytelling(
  basePrompt: string,
  archetype: keyof typeof STORY_ARCHETYPES,
  beat: string,
  emotion: keyof typeof EMOTIONAL_BEATS
): string {
  const arc = STORY_ARCHETYPES[archetype];
  const emotionalContext = EMOTIONAL_BEATS[emotion][0];
  
  return `${basePrompt}, narrative beat: ${beat} (${arc.description}), emotional tone: ${emotionalContext}, cinematic storytelling, professional film quality`;
}
