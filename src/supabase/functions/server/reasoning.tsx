import { Hono } from "npm:hono";
import * as geminiService from './gemini-service.ts';
import * as geminiServiceEnhanced from './gemini-service-enhanced.ts';

const app = new Hono();

// Replicate API configuration (primary - Gemini 2.5 Flash)
const REPLICATE_API_KEY = Deno.env.get("REPLICATE_API_KEY");

// Together AI configuration (fallback)
const TOGETHER_API_KEY = Deno.env.get("TOGETHER_API_KEY");
const TOGETHER_ENDPOINT = "https://api.together.xyz/v1/chat/completions";
const TOGETHER_MODEL = "meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo";

interface AnalysisResult {
  reasoning: string;
  structure: {
    type: string;
    count: number;
    breakdown: any[];
  };
  nodes: Array<{
    id: string;
    title: string;
    description: string;
    type: string;
    prompt: string;
    dependencies: string[];
    generationType: {
      method: string;
      requiresReference: boolean;
    };
    referenceImages: string[];
    level: number;
    metadata: Record<string, any>;
    status: string;
    retryCount: number;
  }>;
}

// Analyze vision and generate structure
app.post("/analyze", async (c) => {
  try {
    const body = await c.req.json();
    const { vision, outputType, mode } = body;

    if (!vision || !outputType) {
      return c.json(
        { success: false, error: "vision and outputType are required" },
        400
      );
    }

    console.log("🔮 [Reasoning] Starting analysis...");
    console.log(`📝 [Reasoning] Vision: "${vision.substring(0, 100)}..."`);
    console.log(`🎯 [Reasoning] Output type: ${outputType}`);

    // Priority: Gemini 2.5 Flash → Together AI → Local
    let result: AnalysisResult;

    // 1. Try Gemini 2.5 Flash WITH INTELLIGENCE (PRIMARY)
    if (REPLICATE_API_KEY) {
      try {
        console.log("🧠 [Reasoning] Using Gemini 2.5 Flash with Intelligence...");
        const geminiResult = await geminiServiceEnhanced.analyzeCoconutIntent(vision, outputType);
        
        // Transform to AnalysisResult format (already includes intelligence metadata)
        result = {
          reasoning: geminiResult.reasoning,
          structure: geminiResult.structure,
          nodes: geminiResult.nodes,
          ...geminiResult // Include analysis, maxLevel, totalEstimatedCredits, etc.
        };
        
        console.log("✅ [Reasoning] Gemini intelligence analysis complete");
      } catch (error) {
        console.warn("⚠️ [Reasoning] Gemini failed, trying Together AI fallback:", error);
        
        // 2. Fallback to Together AI
        if (TOGETHER_API_KEY) {
          try {
            result = await analyzeWithTogetherAI(vision, outputType, mode || "auto");
          } catch (togetherError) {
            console.warn("⚠️ [Reasoning] Together AI failed, using local fallback:", togetherError);
            result = analyzeVisionLocally(vision, outputType, mode || "auto");
          }
        } else {
          result = analyzeVisionLocally(vision, outputType, mode || "auto");
        }
      }
    } else if (TOGETHER_API_KEY) {
      // 2. Try Together AI if Gemini not available
      try {
        console.log("☁️ [Reasoning] Using Together AI...");
        result = await analyzeWithTogetherAI(vision, outputType, mode || "auto");
      } catch (error) {
        console.warn("⚠️ [Reasoning] Together AI failed, using local fallback:", error);
        result = analyzeVisionLocally(vision, outputType, mode || "auto");
      }
    } else {
      // 3. Local fallback
      console.log("🏠 [Reasoning] No API keys set, using local algorithm");
      result = analyzeVisionLocally(vision, outputType, mode || "auto");
    }

    console.log("✅ [Reasoning] Analysis complete:", result.structure.count, "nodes");

    return c.json({ success: true, data: result });
  } catch (error) {
    console.error("❌ Reasoning analysis error:", error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Analysis failed",
      },
      500
    );
  }
});

// ============================================
// TOGETHER AI ANALYSIS
// ============================================

async function analyzeWithTogetherAI(
  vision: string,
  outputType: string,
  mode: string
): Promise<AnalysisResult> {
  const prompt = buildReasoningPrompt(vision, outputType, mode);

  const response = await fetch(TOGETHER_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${TOGETHER_API_KEY}`,
    },
    body: JSON.stringify({
      model: TOGETHER_MODEL,
      messages: [
        {
          role: "system",
          content: "You are a creative director AI. Always respond with valid JSON only, no markdown."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 8192,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Together AI error: ${error}`);
  }

  const data = await response.json();
  const text = data.choices?.[0]?.message?.content;

  if (!text) {
    throw new Error("No response from Together AI");
  }

  return parseReasoningResponse(text);
}

// ============================================
// LOCAL ANALYSIS (FALLBACK)
// ============================================

function analyzeVisionLocally(
  vision: string,
  outputType: string,
  mode: string
): AnalysisResult {
  console.log("🧠 [Reasoning] Using deterministic local analysis");
  
  const lowerVision = vision.toLowerCase();
  
  // Detect node count based on keywords and output type
  const nodeCount = detectNodeCount(vision, outputType);
  
  // Generate nodes
  const nodes = generateNodes(vision, outputType, nodeCount);
  
  return {
    reasoning: generateReasoning(vision, outputType, nodeCount),
    structure: {
      type: outputType,
      count: nodeCount,
      breakdown: generateBreakdown(outputType, nodeCount)
    },
    nodes
  };
}

function detectNodeCount(vision: string, outputType: string): number {
  const lowerVision = vision.toLowerCase();
  
  // Video: 8-12 shots for 30s, 4-6 shots for 15s
  if (outputType === 'video') {
    if (lowerVision.includes('30') || lowerVision.includes('thirty')) {
      return 10; // 10 shots for 30s video
    } else if (lowerVision.includes('15') || lowerVision.includes('fifteen')) {
      return 6; // 6 shots for 15s video
    } else if (lowerVision.includes('60') || lowerVision.includes('minute')) {
      return 15; // 15 shots for 60s video
    }
    return 8; // Default: 8 shots
  }
  
  // Campaign: 3-5 assets
  if (outputType === 'campaign') {
    return 4; // Default: 4 assets
  }
  
  // Image: 1-4 images
  if (lowerVision.includes('multiple') || lowerVision.includes('series')) {
    return 4;
  } else if (lowerVision.includes('couple') || lowerVision.includes('two') || lowerVision.includes('pair')) {
    return 2;
  } else if (lowerVision.includes('three') || lowerVision.includes('trio')) {
    return 3;
  }
  
  return 1; // Default: single image
}

function generateNodes(vision: string, outputType: string, count: number): any[] {
  const nodes = [];
  
  if (outputType === 'video') {
    // Generate video shots
    for (let i = 0; i < count; i++) {
      nodes.push({
        id: `node_${i + 1}`,
        title: `Shot ${i + 1}`,
        description: `Shot ${i + 1} of the video sequence`,
        type: 'shot',
        prompt: enhancePromptForShot(vision, i, count),
        dependencies: [],
        generationType: {
          method: 'text-to-video',
          requiresReference: false
        },
        referenceImages: [],
        level: 0,
        metadata: {
          duration: 3,
          aspectRatio: '16:9',
          shotNumber: i + 1
        },
        status: 'pending',
        retryCount: 0
      });
    }
  } else if (outputType === 'image') {
    // Generate images
    for (let i = 0; i < count; i++) {
      nodes.push({
        id: `node_${i + 1}`,
        title: count > 1 ? `Image ${i + 1}` : 'Main Image',
        description: count > 1 ? `Image ${i + 1} in the series` : 'Main generated image',
        type: 'image',
        prompt: enhancePromptForImage(vision, i, count),
        dependencies: [],
        generationType: {
          method: 'text-to-image',
          requiresReference: false
        },
        referenceImages: [],
        level: 0,
        metadata: {
          aspectRatio: '16:9',
          imageNumber: i + 1
        },
        status: 'pending',
        retryCount: 0
      });
    }
  } else {
    // Campaign: mix of images and videos
    const imageCount = Math.ceil(count / 2);
    const videoCount = Math.floor(count / 2);
    
    for (let i = 0; i < imageCount; i++) {
      nodes.push({
        id: `node_${i + 1}`,
        title: `Campaign Image ${i + 1}`,
        description: `Campaign image asset ${i + 1}`,
        type: 'image',
        prompt: enhancePromptForImage(vision, i, imageCount),
        dependencies: [],
        generationType: {
          method: 'text-to-image',
          requiresReference: false
        },
        referenceImages: [],
        level: 0,
        metadata: { 
          aspectRatio: '16:9',
          platform: 'general',
          purpose: i === 0 ? 'hero' : 'lifestyle'
        },
        status: 'pending',
        retryCount: 0
      });
    }
    
    for (let i = 0; i < videoCount; i++) {
      nodes.push({
        id: `node_${imageCount + i + 1}`,
        title: `Campaign Video ${i + 1}`,
        description: `Campaign video asset ${i + 1}`,
        type: 'video',
        prompt: enhancePromptForVideo(vision, i, videoCount),
        dependencies: [],
        generationType: {
          method: 'text-to-video',
          requiresReference: false
        },
        referenceImages: [],
        level: 0,
        metadata: { 
          duration: 15, 
          aspectRatio: '16:9',
          platform: 'general',
          purpose: 'teaser'
        },
        status: 'pending',
        retryCount: 0
      });
    }
  }
  
  return nodes;
}

function enhancePromptForShot(vision: string, shotIndex: number, totalShots: number): string {
  // Extract key elements from vision
  const elements = extractKeyElements(vision);
  
  // Import cinematography knowledge
  const { SHOT_TYPES, CAMERA_MOVEMENTS } = getCinematographyKnowledge();
  
  const shotType = getAdvancedShotType(shotIndex, totalShots);
  const cameraMovement = getAdvancedCameraMovement(shotIndex, totalShots);
  const lighting = getLightingSetup(shotIndex);
  
  // Build professional prompt with cinematography vocabulary
  let prompt = `${shotType} of ${elements}`;
  
  // Add camera movement
  prompt += `, ${cameraMovement}`;
  
  // Add lighting
  prompt += `, ${lighting}`;
  
  // Add timestamp-specific details
  const timestamp = getTimestamp(shotIndex, totalShots);
  prompt = `[${timestamp}] ${prompt}`;
  
  // Add cinematic quality
  prompt += ', cinematic composition, professional cinematography, smooth motion, 4K quality, film-like aesthetic';
  
  return prompt;
}

function enhancePromptForImage(vision: string, imageIndex: number, totalImages: number): string {
  const elements = extractKeyElements(vision);
  const angle = getImageAngle(imageIndex, totalImages);
  
  return `${angle} of ${elements}, professional photography, high quality, sharp details, photorealistic, 8K resolution`;
}

function enhancePromptForVideo(vision: string, videoIndex: number, totalVideos: number): string {
  const elements = extractKeyElements(vision);
  return `${elements}, smooth camera motion, cinematic, professional video production, high quality`;
}

function extractKeyElements(vision: string): string {
  // Simple keyword extraction - take first sentence or first 100 chars
  const firstSentence = vision.split(/[.!?]/)[0];
  return firstSentence.length > 100 ? firstSentence.substring(0, 97) + '...' : firstSentence;
}

function getShotType(index: number, total: number): string {
  const types = ['establishing', 'wide', 'medium', 'close-up', 'detail', 'over-shoulder', 'tracking', 'aerial'];
  return types[index % types.length];
}

function getCameraMovement(index: number, total: number): string {
  const movements = ['smooth pan right', 'slow zoom in', 'tracking shot', 'static camera', 'handheld', 'dolly forward', 'crane shot'];
  return movements[index % movements.length];
}

function getImageAngle(index: number, total: number): string {
  const angles = ['front view', 'side angle', 'top view', '3/4 angle', 'low angle', 'high angle'];
  return angles[index % angles.length];
}

function generateReasoning(vision: string, outputType: string, count: number): string {
  if (outputType === 'video') {
    return `Based on your vision, I've created a video structure with ${count} cinematic shots to tell a compelling visual story. Each shot is designed to flow naturally into the next.`;
  } else if (outputType === 'campaign') {
    return `I've designed a multi-asset campaign with ${count} pieces (images and videos) to maximize your reach across different platforms and audiences.`;
  } else {
    return `I've created ${count === 1 ? 'a single high-quality image' : `${count} complementary images`} to bring your vision to life with professional photography quality.`;
  }
}

function generateBreakdown(outputType: string, count: number): any[] {
  if (outputType === 'video') {
    return [{ nodeType: 'shot', count }];
  } else if (outputType === 'campaign') {
    const imageCount = Math.ceil(count / 2);
    const videoCount = Math.floor(count / 2);
    return [
      { nodeType: 'image', count: imageCount },
      { nodeType: 'video', count: videoCount }
    ];
  } else {
    return [{ nodeType: 'image', count }];
  }
}

// ============================================
// OPTIMIZE ENDPOINT
// ============================================

app.post("/optimize", async (c) => {
  try {
    const body = await c.req.json();
    const { prompt, nodeType, model } = body;

    if (!prompt || !nodeType) {
      return c.json(
        { success: false, error: "prompt and nodeType are required" },
        400
      );
    }

    // Use simple optimization (no API call needed)
    const optimizedPrompt = optimizePromptLocally(prompt, nodeType, model || "flux-pro");

    return c.json({ success: true, data: { optimizedPrompt } });
  } catch (error) {
    console.error("❌ Prompt optimization error:", error);
    return c.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Optimization failed",
      },
      500
    );
  }
});

// ============================================
// NEGATIVE PROMPT ENDPOINT
// ============================================

app.post("/negative-prompt", async (c) => {
  try {
    const body = await c.req.json();
    const { prompt, nodeType } = body;

    if (!prompt || !nodeType) {
      return c.json(
        { success: false, error: "prompt and nodeType are required" },
        400
      );
    }

    const negativePrompt = generateNegativePrompt(nodeType);

    return c.json({ success: true, data: { negativePrompt } });
  } catch (error) {
    console.error("❌ Negative prompt error:", error);
    return c.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Failed to generate negative prompt",
      },
      500
    );
  }
});

// ============================================
// HELPER FUNCTIONS
// ============================================

function buildReasoningPrompt(
  vision: string,
  outputType: string,
  mode: string
): string {
  return `You are a creative director AI analyzing a project vision to create a complete production structure.

**User Vision:**
"${vision}"

**Output Type:** ${outputType}
**Mode:** ${mode}

Your task is to analyze this vision and generate a detailed production structure with nodes, dependencies, and optimized prompts.

**Instructions:**
1. Understand the creative intent and desired output
2. Break down the vision into logical production nodes
3. For images: Create 1-4 image nodes with detailed prompts
4. For videos: Create a storyboard structure with shots (8-12 shots for 30s, 4-6 shots for 15s)
5. For campaigns: Create a multi-asset campaign with images and/or videos
6. Define dependencies (which nodes depend on which)
7. Generate optimized prompts for each node (cinematic, detailed, production-ready)

**Output Format (JSON):**
{
  "reasoning": "Brief explanation of your creative approach (2-3 sentences)",
  "structure": {
    "type": "image|video|campaign",
    "count": <number of nodes>,
    "breakdown": [
      { "nodeType": "image|video|shot", "count": <number> }
    ]
  },
  "nodes": [
    {
      "id": "node_1",
      "title": "Descriptive title",
      "type": "image|video|shot|storyboard|campaign",
      "prompt": "Detailed, optimized prompt for generation",
      "dependencies": ["node_id_1", "node_id_2"],
      "metadata": {
        "duration": 5,
        "aspectRatio": "16:9",
        "style": "cinematic",
        "mood": "dramatic"
      }
    }
  ]
}

**Prompt Guidelines:**
- Be cinematic and detailed
- Include lighting, camera angles, mood
- Specify art style or aesthetic
- Use production terminology
- Avoid abstract concepts, be concrete

**Dependency Rules:**
- Shots depend on storyboard
- Campaign assets can be independent or sequential
- Video nodes have no dependencies (unless part of campaign)

Respond ONLY with valid JSON, no markdown code blocks.`;
}

function optimizePromptLocally(
  prompt: string,
  nodeType: string,
  model: string
): string {
  const modelEnhancements: Record<string, string> = {
    'flux-2-pro': 'professional photography, sharp details, high quality, photorealistic',
    'flux-2-flex': 'ultra detailed, 8K resolution, professional grade, premium quality',
    'nanobanana-pro': 'seamless composition, cohesive style, professional layout, high detail',
    'veo-3.1-fast': 'smooth motion, cinematic camera work, consistent style, fluid transitions'
  };
  
  const enhancement = modelEnhancements[model] || 'high quality, professional';
  
  // Add enhancement if not already present
  if (!prompt.toLowerCase().includes(enhancement.split(',')[0])) {
    return `${prompt}, ${enhancement}`;
  }
  
  return prompt;
}

function generateNegativePrompt(nodeType: string): string {
  const baseNegative = [
    "blurry",
    "low quality",
    "distorted",
    "deformed",
    "ugly",
    "bad anatomy",
    "watermark",
    "text",
    "signature",
  ];

  const typeSpecific: Record<string, string[]> = {
    image: ["pixelated", "jpeg artifacts", "noise", "grainy"],
    video: [
      "flickering",
      "frame drops",
      "stuttering",
      "inconsistent motion",
      "morphing",
    ],
    shot: [
      "camera shake",
      "jump cuts",
      "inconsistent lighting",
      "unnatural movement",
    ],
  };

  const negatives = [
    ...baseNegative,
    ...(typeSpecific[nodeType] || typeSpecific.image),
  ];

  return negatives.join(", ");
}

function parseReasoningResponse(text: string): AnalysisResult {
  try {
    // Remove markdown code blocks if present
    const cleaned = text.replace(/```json\n?|```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned);

    // Validate structure
    if (!parsed.reasoning || !parsed.structure || !parsed.nodes) {
      throw new Error("Invalid response structure");
    }

    // Generate IDs and ensure all required fields
    parsed.nodes = parsed.nodes.map((node: any, index: number) => ({
      id: node.id || `node_${index + 1}`,
      title: node.title || `Node ${index + 1}`,
      description: node.description || `Generated ${node.type || 'asset'} ${index + 1}`,
      type: node.type || "image",
      prompt: node.prompt || "",
      negativePrompt: node.negativePrompt,
      dependencies: node.dependencies || [],
      generationType: node.generationType || {
        method: (node.type === 'video' || node.type === 'shot') ? 'text-to-video' : 'text-to-image',
        requiresReference: false
      },
      referenceImages: node.referenceImages || [],
      level: node.level !== undefined ? node.level : 0,
      metadata: node.metadata || {},
      status: node.status || 'pending',
      retryCount: node.retryCount || 0
    }));

    return parsed;
  } catch (error) {
    console.error("❌ Failed to parse reasoning response:", error);
    // Fallback to local analysis
    throw error;
  }
}

// ============================================
// CINEMATOGRAPHY HELPERS
// ============================================

function getCinematographyKnowledge() {
  // Inline knowledge base for video prompting
  return {
    SHOT_TYPES: [
      'extreme wide shot',
      'wide shot',
      'medium shot',
      'close-up shot',
      'extreme close-up',
      'over-shoulder shot',
      'point-of-view shot'
    ],
    CAMERA_MOVEMENTS: [
      'smooth dolly in',
      'dolly out revealing context',
      'pan left following action',
      'pan right revealing scene',
      'tilt up showing scale',
      'tilt down to subject',
      'tracking shot',
      'crane shot',
      'orbit around subject',
      'static frame',
      'handheld for energy'
    ],
    LIGHTING_SETUPS: [
      'cinematic three-point lighting',
      'dramatic rembrandt lighting',
      'natural window light',
      'low-key dramatic lighting',
      'high-key bright lighting',
      'golden hour warm tones',
      'blue hour cool tones',
      'rim lighting for depth'
    ]
  };
}

function getAdvancedShotType(index: number, total: number): string {
  const knowledge = getCinematographyKnowledge();
  const shotTypes = knowledge.SHOT_TYPES;
  
  // Strategic shot selection based on position
  if (index === 0) {
    return shotTypes[0]; // Start with wide establishing shot
  } else if (index === total - 1) {
    return shotTypes[3]; // End with close-up for emotion
  } else {
    // Vary between medium and close shots
    return shotTypes[2 + (index % 3)];
  }
}

function getAdvancedCameraMovement(index: number, total: number): string {
  const knowledge = getCinematographyKnowledge();
  const movements = knowledge.CAMERA_MOVEMENTS;
  
  // Strategic movement selection
  if (index === 0) {
    return movements[0]; // Dolly in for opening
  } else if (index === total - 1) {
    return movements[1]; // Dolly out for ending
  } else {
    // Vary movements
    return movements[index % movements.length];
  }
}

function getLightingSetup(index: number): string {
  const knowledge = getCinematographyKnowledge();
  const lighting = knowledge.LIGHTING_SETUPS;
  
  return lighting[index % lighting.length];
}

function getTimestamp(index: number, total: number): string {
  // Calculate timestamp based on shot index
  // Assuming 3-4s per shot
  const shotDuration = 3;
  const start = index * shotDuration;
  const end = start + shotDuration;
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  return `${formatTime(start)}-${formatTime(end)}`;
}

// ============================================
// EXPORTED UTILITY FUNCTION
// ============================================

/**
 * Optimize a prompt for a specific model
 * Can be called directly (not as HTTP endpoint)
 */
export async function optimizePromptForModel(
  prompt: string,
  model: string,
  nodeType: string = 'image'
): Promise<string> {
  return optimizePromptLocally(prompt, nodeType, model);
}

export default app;