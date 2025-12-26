/**
 * ENHANCED GEMINI SERVICE WITH INTELLIGENCE
 * Analyze user intent for Coconut with full intelligence integration
 * 
 * 🚀 NOW WITH 2-PHASE ORCHESTRATION:
 * Phase 1: Detect assets → Generate them
 * Phase 2: Structure pipeline with assets available
 * 
 * ⚠️ NOTE: This file is deprecated and kept for legacy compatibility only.
 * New implementations should use coconut-v12-unified-analyzer.ts instead.
 */

// Import generateText from existing gemini service
import { generateText } from './gemini-service.ts';

// ============================================
// LEGACY INTELLIGENCE FUNCTIONS (INLINE)
// ============================================

function analyzeImageComplexity(intent: string) {
  // Simple complexity analysis
  const hasMultipleElements = /and|with|plus|multiple|several/.test(intent.toLowerCase());
  const hasEffects = /effect|glow|shadow|blur|3d|holographic/.test(intent.toLowerCase());
  const hasText = /text|typography|title|headline|caption/.test(intent.toLowerCase());
  
  let complexity = 'simple';
  let suggestedLevels = 1;
  
  if (hasMultipleElements && (hasEffects || hasText)) {
    complexity = 'complex';
    suggestedLevels = 3;
  } else if (hasMultipleElements || hasEffects || hasText) {
    complexity = 'medium';
    suggestedLevels = 2;
  }
  
  return {
    complexity,
    suggestedLevels,
    needsMultiLevel: suggestedLevels > 1,
    detectedElements: [
      hasMultipleElements && 'multiple elements',
      hasEffects && 'effects',
      hasText && 'typography'
    ].filter(Boolean),
    reasoning: `Image requires ${suggestedLevels} level${suggestedLevels > 1 ? 's' : ''} based on detected complexity.`
  };
}

function analyzeVideoStructure(intent: string) {
  // Simple video structure analysis
  const durationMatch = intent.match(/(\d+)\s*(?:second|sec|s)/i);
  const totalDuration = durationMatch ? parseInt(durationMatch[1]) : 10;
  
  const segmentDuration = 5; // Default 5s segments
  const optimalSegments = Math.ceil(totalDuration / segmentDuration);
  
  const suggestedShots = Array.from({ length: optimalSegments }, (_, i) => ({
    index: i + 1,
    timestamp: `0:${String(i * segmentDuration).padStart(2, '0')}-0:${String((i + 1) * segmentDuration).padStart(2, '0')}`,
    duration: segmentDuration,
    type: i === 0 ? 'wide shot' : 'medium shot',
    generationType: i === 0 ? 'text-to-video' : 'video-extend',
    needsStartingFrame: i === 0,
    usesLastFrame: i > 0
  }));
  
  return {
    totalDuration,
    optimalSegments,
    segmentDuration,
    canUseExtend: optimalSegments > 1,
    suggestedShots,
    reasoning: `Video split into ${optimalSegments} segments of ~${segmentDuration}s each.`
  };
}

function analyzeCampaignNeeds(intent: string) {
  // Simple campaign analysis
  const platforms = [];
  if (/instagram|insta|ig/i.test(intent)) platforms.push('instagram');
  if (/tiktok|tt/i.test(intent)) platforms.push('tiktok');
  if (/youtube|yt/i.test(intent)) platforms.push('youtube');
  if (platforms.length === 0) platforms.push('instagram', 'tiktok');
  
  const requiredContent = platforms.map(platform => ({
    platform,
    type: 'video',
    format: platform === 'youtube' ? '16:9' : '9:16',
    purpose: `${platform} promotion`,
    duration: platform === 'youtube' ? 30 : 15,
    priority: 'high'
  }));
  
  return {
    detectedObjective: 'multi-platform campaign',
    platforms,
    requiredContent,
    sharedAssets: ['logo', 'product', 'branding'],
    reasoning: `Campaign for ${platforms.join(', ')} platforms.`
  };
}

export async function analyzeCoconutIntent(
  intent: string,
  outputType: 'image' | 'video' | 'campaign',
  userReferences?: string[] // URLs des images uploadées par user
): Promise<any> {
  console.log('🥥 [Gemini Enhanced] Coconut intent analysis with intelligence');
  
  // ============================================
  // STEP 1: PRE-ANALYSIS WITH INTELLIGENCE
  // ============================================
  let intelligenceData: any = {};
  
  if (outputType === 'image') {
    const imageAnalysis = analyzeImageComplexity(intent);
    intelligenceData = {
      complexity: imageAnalysis.complexity,
      suggestedLevels: imageAnalysis.suggestedLevels,
      needsMultiLevel: imageAnalysis.needsMultiLevel,
      detectedElements: imageAnalysis.detectedElements,
      reasoning: imageAnalysis.reasoning
    };
    console.log('🎨 [Intelligence] Image complexity:', imageAnalysis.complexity, '→', imageAnalysis.suggestedLevels, 'levels');
  } else if (outputType === 'video') {
    const videoAnalysis = analyzeVideoStructure(intent);
    intelligenceData = {
      totalDuration: videoAnalysis.totalDuration,
      optimalSegments: videoAnalysis.optimalSegments,
      segmentDuration: videoAnalysis.segmentDuration,
      canUseExtend: videoAnalysis.canUseExtend,
      suggestedShots: videoAnalysis.suggestedShots,
      reasoning: videoAnalysis.reasoning
    };
    console.log('🎬 [Intelligence] Video structure:', videoAnalysis.optimalSegments, 'segments of ~', Math.round(videoAnalysis.segmentDuration), 's');
  } else if (outputType === 'campaign') {
    const campaignAnalysis = analyzeCampaignNeeds(intent);
    intelligenceData = {
      objective: campaignAnalysis.detectedObjective,
      platforms: campaignAnalysis.platforms,
      requiredContent: campaignAnalysis.requiredContent,
      sharedAssets: campaignAnalysis.sharedAssets,
      reasoning: campaignAnalysis.reasoning
    };
    console.log('🚀 [Intelligence] Campaign:', campaignAnalysis.detectedObjective, 'on', campaignAnalysis.platforms.join(', '));
  }
  
  // ============================================
  // STEP 2: BUILD ENRICHED SYSTEM PROMPT
  // ============================================
  const systemPrompt = `You are Coconut AI, the world's first multimodal composition intelligence.

You are an EXPERT in:
- Film direction & cinematography (DoP level)
- Visual composition & design
- Prompt engineering (SOTA)
- Multi-stage generation pipelines
- Dependency orchestration

**INTELLIGENCE PRE-ANALYSIS RESULTS:**
${JSON.stringify(intelligenceData, null, 2)}

${outputType === 'image' && intelligenceData.needsMultiLevel ? `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎨 IMAGE COMPLEXITY: ${intelligenceData.complexity.toUpperCase()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**DETECTED ELEMENTS:** ${intelligenceData.detectedElements.join(', ')}
**SUGGESTED LEVELS:** ${intelligenceData.suggestedLevels}
**REASONING:** ${intelligenceData.reasoning}

**YOU MUST CREATE A MULTI-LEVEL CASCADE STRUCTURE:**

Example for 4-level structure:

Level 0: BASE ELEMENTS (no dependencies)
  Node: Character Portrait
    → type: image
    → generationType: { method: "text-to-image", requiresReference: false }
    → prompt: detailed character description
    → dependencies: []
    → referenceImages: []

Level 1: INTERMEDIATE COMPOSITION (depends on Level 0)
  Node: Character + Background
    → type: image
    → generationType: { method: "image-to-image", requiresReference: true, referenceType: "previous-result" }
    → prompt: integrate character into environment
    → dependencies: ["character-portrait-id"]
    → referenceImages: [
        { source: "previous-node", nodeId: "character-portrait-id", purpose: "composition-layer" }
      ]

Level 2: EFFECTS & POLISH (depends on Level 1)
  Node: Composition + Effects
    → type: image
    → generationType: { method: "image-to-image", requiresReference: true, referenceType: "previous-result" }
    → prompt: add lighting effects, atmosphere
    → dependencies: ["character-bg-id"]
    → referenceImages: [
        { source: "previous-node", nodeId: "character-bg-id", purpose: "style-reference" }
      ]

Level 3: FINAL WITH TEXT (depends on Level 2)
  Node: Final Poster with Title
    → type: composition
    → generationType: { method: "composition", requiresReference: true, referenceType: "previous-result" }
    → prompt: add title typography, final color grade
    → dependencies: ["composition-effects-id"]
    → referenceImages: [
        { source: "previous-node", nodeId: "composition-effects-id", purpose: "composition-layer" }
      ]

**EACH LEVEL BUILDS ON PREVIOUS ONE USING referenceImages!**
` : outputType === 'image' ? `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎨 IMAGE COMPLEXITY: SIMPLE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Single-stage generation sufficient.
Create 1 node:
  → type: image
  → level: 0
  → generationType: { method: "text-to-image", requiresReference: false }
  → dependencies: []
  → referenceImages: []
` : ''}

${outputType === 'video' ? `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎬 VIDEO STRUCTURE CALCULATED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**TOTAL DURATION:** ${intelligenceData.totalDuration}s
**OPTIMAL SEGMENTS:** ${intelligenceData.optimalSegments}
**SEGMENT DURATION:** ~${Math.round(intelligenceData.segmentDuration)}s each
**CAN USE EXTEND:** ${intelligenceData.canUseExtend}

**SUGGESTED SHOTS BREAKDOWN:**
${intelligenceData.suggestedShots.map((shot: any, idx: number) => `
Shot ${shot.index} [${shot.timestamp}] (${shot.duration}s)
  → Type: ${shot.type}
  → Generation: ${shot.generationType}
  → Needs Starting Frame: ${shot.needsStartingFrame}
  → Uses Last Frame: ${shot.usesLastFrame}
`).join('')}

**YOU MUST CREATE THIS EXACT STRUCTURE:**

Level 0: REFERENCE IMAGES (2-3 key images for video starting frames)
  Example nodes:
  - Main Subject Image (text-to-image)
  - Environment/Background Image (text-to-image)
  - Key Object/Detail Image (text-to-image)

Level 1: VIDEO SHOTS (${intelligenceData.optimalSegments} shots following suggested structure)

Example Shot 1 [${intelligenceData.suggestedShots[0]?.timestamp}]:
  → type: shot
  → generationType: { method: "${intelligenceData.suggestedShots[0]?.generationType}", requiresReference: ${intelligenceData.suggestedShots[0]?.needsStartingFrame}, referenceType: "generated" }
  → dependencies: [reference-image-id]
  → referenceImages: [{ source: "previous-node", nodeId: "reference-image-id", purpose: "starting-frame" }]
  → metadata: {
      duration: ${intelligenceData.suggestedShots[0]?.duration}, // PARAMETER not in prompt!
      timestamp: "${intelligenceData.suggestedShots[0]?.timestamp}",
      cameraMovement: "dolly in",
      shotType: "${intelligenceData.suggestedShots[0]?.type}",
      startingFrame: "reference-image-id"
    }
  → prompt: "dolly in, wide shot, [subject], [action], [context], [lighting], [style], [mood]"

Example Shot 2 [${intelligenceData.suggestedShots[1]?.timestamp}]:
  → type: shot
  → generationType: { method: "${intelligenceData.suggestedShots[1]?.generationType}", requiresReference: ${intelligenceData.suggestedShots[1]?.usesLastFrame}, referenceType: "previous-result" }
  → dependencies: [shot-1-id]
  → referenceImages: [{ source: "previous-node", nodeId: "shot-1-id", purpose: "last-frame" }]
  → metadata: {
      duration: ${intelligenceData.suggestedShots[1]?.duration},
      timestamp: "${intelligenceData.suggestedShots[1]?.timestamp}",
      lastFrameOf: "shot-1-id",
      ${intelligenceData.suggestedShots[1]?.generationType === 'extend' ? 'extendsFrom: "shot-1-id",' : ''}
    }

Continue for ALL ${intelligenceData.optimalSegments} shots...

**CINEMATIC PROMPT FORMAT (MANDATORY FOR ALL SHOTS):**

Structure: [Camera Movement], [Shot Type], [Subject], [Action], [Context], [Lighting], [Style], [Mood], maintaining [Anchors]

Example: "dolly in, wide shot, electric car accelerating through neon tunnel, cyberpunk city at night, dramatic neon reflections, cinematic sci-fi aesthetic, energetic and futuristic, maintaining teal and orange color grading, rain-slicked surfaces"

**CAMERA MOVEMENTS:**
- dolly in / dolly out
- pan left / pan right
- tilt up / tilt down
- crane up / crane down
- orbit (circular)
- handheld (shaky)
- static (locked)

**SHOT TYPES:**
- wide shot / establishing shot
- medium shot
- close-up
- extreme close-up

**⚠️ CRITICAL: Duration is metadata.duration parameter, NEVER in prompt text!**
` : ''}

${outputType === 'campaign' ? `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🚀 CAMPAIGN STRUCTURE REQUIRED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**OBJECTIVE:** ${intelligenceData.objective}
**PLATFORMS:** ${intelligenceData.platforms.join(', ')}
**SHARED ASSETS:** ${intelligenceData.sharedAssets.join(', ')}

**REQUIRED CONTENT (${intelligenceData.requiredContent.length} pieces):**
${intelligenceData.requiredContent.map((content: any, idx: number) => `
${idx + 1}. ${content.platform.toUpperCase()} ${content.type.toUpperCase()} (${content.format})
   → Purpose: ${content.purpose}
   ${content.duration ? `→ Duration: ${content.duration}s` : ''}
   → Priority: ${content.priority}
`).join('')}

**YOU MUST CREATE THIS MULTI-TREE STRUCTURE:**

Level 0: SHARED BRAND ASSETS (used across all platforms)
  → Logo (animated if video content exists)
  → Product renders (multiple angles)
  → Brand backgrounds/colors
  → Typography/fonts

Level 1+: FOR EACH CONTENT PIECE, CREATE COMPLETE SUB-PIPELINE:

For TikTok Video (${intelligenceData.requiredContent.find((c: any) => c.platform === 'tiktok')?.duration || 15}s, 9:16):
  Level 1.0: TikTok reference images
  Level 1.1: TikTok shots (calculate segments like video structure above)
  Level 1.2: TikTok assembly

For YouTube Video (${intelligenceData.requiredContent.find((c: any) => c.platform === 'youtube')?.duration || 30}s, 16:9):
  Level 1.0: YouTube reference images
  Level 1.1: YouTube shots (more segments, longer form)
  Level 1.2: YouTube assembly

For Instagram Hero Image (1:1):
  Level 1.0: Background layer
  Level 1.1: Product layer (with Level 0 product render as ref)
  Level 1.2: Effects layer (with Level 1.1 as ref)
  Level 1.3: Final composition with text

**ANCHOR ELEMENTS (visual coherence across ALL content):**
{
  "anchorElements": {
    "colorPalette": "specific hex codes or color description",
    "lighting": "lighting mood and direction",
    "style": "visual aesthetic (minimal, bold, elegant...)",
    "mood": "emotional tone (energetic, calm, aspirational...)"
  }
}

**EVERY node prompt must reference these anchors for consistency!**
` : ''}

You must respond ONLY with valid JSON, no markdown, no explanations.`;
  
  // ============================================
  // STEP 3: BUILD USER PROMPT
  // ============================================
  const userPrompt = `Analyze this creative intent and generate a complete production structure:

**USER INTENT:** "${intent}"
**OUTPUT TYPE:** ${outputType}
${userReferences && userReferences.length > 0 ? `**USER PROVIDED REFERENCES:** ${userReferences.length} images (use as referenceImages with source: "user-upload")` : ''}

Based on the intelligence pre-analysis above, create a detailed production plan as JSON:

{
  "reasoning": "Your strategic analysis explaining the structure you chose based on intelligence data",
  "structure": {
    "type": "${outputType}",
    "count": <total nodes across all levels>,
    "breakdown": [
      { "nodeType": "image|shot|composition|asset", "count": <number> }
    ]${outputType === 'campaign' ? `,
    "platforms": [
      { "platform": "tiktok", "format": "9:16", "assets": ["teaser-video"] },
      { "platform": "youtube", "format": "16:9", "assets": ["main-video"] }
    ]` : ''}
  },
  "nodes": [
    {
      "id": "unique-id-descriptive",
      "title": "Descriptive title",
      "description": "Detailed visual description of what this node produces",
      "type": "image|video|shot|composition|asset",
      "generationType": {
        "method": "text-to-image|image-to-image|text-to-video|image-to-video|video-extend|composition",
        "requiresReference": true/false,
        "referenceType": "user-upload|generated|previous-result"
      },
      "prompt": "Super enhanced professional SOTA prompt (cinematic format for videos)",
      "negativePrompt": "bad quality, blurry, distorted, deformed, low resolution, pixelated, artifacts",
      "dependencies": ["id1", "id2"],
      "referenceImages": [
        {
          "source": "previous-node|generated|user-upload",
          "nodeId": "id-of-source-node",
          "url": "https://user-provided-url", // only if user-upload
          "purpose": "style-reference|starting-frame|last-frame|composition-layer"
        }
      ],
      "level": 0,
      "metadata": {
        "aspectRatio": "16:9|9:16|1:1",
        "duration": 5, // for video ONLY, as parameter
        "timestamp": "0:00-0:05",
        "cameraMovement": "dolly in|pan left|orbit|crane|static",
        "shotType": "wide|close-up|medium",
        "transition": "cut|fade|dissolve",
        "startingFrame": "node-id",
        "lastFrameOf": "node-id",
        "extendsFrom": "node-id",
        "layers": ["id1", "id2"],
        "style": "cinematic|photorealistic|artistic",
        "mood": "dramatic|energetic|calm",
        "platform": "tiktok|youtube|instagram|general",
        "purpose": "hero|teaser|product|lifestyle",
        "model": "flux-2-pro|veo-3.1-fast",
        "estimatedCredits": 1
      },
      "status": "pending",
      "retryCount": 0
    }
  ]${outputType === 'campaign' ? `,
  "anchorElements": {
    "colorPalette": "specific color scheme with details",
    "lighting": "lighting style and mood",
    "style": "visual aesthetic",
    "mood": "emotional tone"
  }` : ''}
}

**MANDATORY CHECKS:**
✅ Level numbering correct (dependencies determine level automatically)
✅ All referenceImages trackable (nodeId OR url)
✅ Video duration is metadata, NEVER in prompt text
✅ Cinematic prompts for ALL video shots
✅ Multi-level cascade for complex images (${outputType === 'image' && intelligenceData.needsMultiLevel ? intelligenceData.suggestedLevels + ' levels required' : 'if needed'})
✅ Campaign: each content has complete sub-pipeline
✅ All IDs unique and descriptive

Respond with valid JSON only:`;

  // ============================================
  // STEP 4: CALL GEMINI
  // ============================================
  const response = await generateText({
    prompt: userPrompt,
    systemPrompt: systemPrompt,
    temperature: 0.8,
    maxTokens: 8192
  });

  // ============================================
  // STEP 5: PARSE AND POST-PROCESS
  // ============================================
  let result: any;
  try {
    result = JSON.parse(response.text);
  } catch (error) {
    console.error('❌ [Gemini] Failed to parse JSON response:', response.text.substring(0, 500));
    throw new Error(`Invalid JSON response from Gemini: ${error}`);
  }

  // Add intelligence metadata
  result.analysis = {
    complexity: intelligenceData.complexity || (outputType === 'campaign' ? 'very-complex' : 'medium'),
    reasoning: result.reasoning,
    detectedNeeds: intelligenceData.detectedElements || intelligenceData.sharedAssets || [],
    missingAssets: [], // Could be calculated
    suggestedWorkflow: `Generate ${result.nodes.length} nodes across ${Math.max(...result.nodes.map((n: any) => n.level)) + 1} levels. ${intelligenceData.reasoning || ''}`
  };

  // Calculate max level
  const maxLevel = Math.max(...result.nodes.map((n: any) => n.level || 0));
  result.maxLevel = maxLevel;

  // Estimate total credits and time
  result.totalEstimatedCredits = result.nodes.reduce((sum: number, n: any) => sum + (n.metadata?.estimatedCredits || 1), 0);
  result.totalEstimatedTime = result.nodes.length * 15; // ~15s average per node

  console.log('✅ [Gemini Enhanced] Analysis complete:');
  console.log(`   → ${result.nodes.length} nodes across ${maxLevel + 1} levels`);
  console.log(`   → Complexity: ${result.analysis.complexity}`);
  console.log(`   → Est. credits: ${result.totalEstimatedCredits}`);
  console.log(`   → Est. time: ${Math.round(result.totalEstimatedTime / 60)}min`);

  return result;
}