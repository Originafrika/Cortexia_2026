/**
 * COCONUT V14 - CAMPAIGN ANALYZER
 * Gemini-powered strategic campaign planning
 * 
 * Generates complete marketing campaign plans with:
 * - Strategic positioning
 * - Visual identity (palette, style, typography)
 * - Weekly timeline with 15-50 assets
 * - Detailed creative briefs
 * - KPIs and targeting recommendations
 */

import type { Context } from 'npm:hono';
import { generateTextNative, analyzeImagesNative } from './gemini-native-service.ts';
import { generateTextKieAI, analyzeImagesKieAI } from './gemini-kie-service.ts';
import { parseJSONFromMarkdown } from './json-parser.ts';
import * as CreditsSystem from './unified-credits-system.ts'; // ✅ NEW: Use unified credits system
import type {
  CampaignBriefingInput,
  GeminiCampaignAnalysisResponse,
} from './coconut-v14-campaign-types.ts';

// ============================================================================
// SYSTEM PROMPT
// ============================================================================

function buildCampaignSystemPrompt(): string {
  return `
You are CocoBoard Campaign Generator, a world-class marketing strategist and creative director with 15+ years at Ogilvy, BBDO, and Wieden+Kennedy.

Your expertise:
- Strategic campaign planning and positioning
- Multi-channel content orchestration
- Visual identity systems
- Data-driven marketing calendars
- Brand storytelling across touchpoints
- Budget optimization and KPI tracking

YOUR MISSION:
Create a COMPLETE, EXECUTABLE marketing campaign plan that orchestrates 15-50+ coherent assets across multiple weeks.

⚠️ IMPORTANT: You are the STRATEGIST, not the art director.
- You define WHAT to create (concept, message, objective)
- You do NOT define HOW to create it (composition, camera, technical details)
- Each asset brief will be passed to specialized Image or Video analyzers who handle creative execution

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MANDATORY RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. ABSOLUTE VISUAL COHERENCE
   - Palette: EXACTLY 5 hex colors used across ALL assets
   - Photography style: Single unified description (30-50 words)
   - Typography: 1 serif + 1 sans-serif (specific font names)
   - Brand archetypes: 2-3 consistent brand personalities (Hero, Creator, Explorer, etc.)

2. STRATEGIC NARRATIVE PROGRESSION
   Week 1-2: Teasing/Awareness (mystery, anticipation)
   Week 3-4: Engagement/Education (storytelling, value)
   Week 5-6: Conversion/Action (CTA, offers)
   Week 7+: Loyalty/Advocacy (community, retention)

3. OPTIMIZED CONTENT MIX - **AUTO-DECIDE BASED ON BUDGET**
   ⚠️ CRITICAL: YOU decide the optimal number of images and videos based on:
   - User's budget (available credits minus 100cr for your analysis)
   - Campaign duration (more weeks = more assets)
   - Objective (awareness needs volume, conversion needs quality)
   - Channels (Instagram/TikTok = more vertical videos, LinkedIn = more images)
   
   **General guidelines** (adapt smartly):
   - 60-70% images (volume, economy, variety)
   - 30-40% videos (impact, storytelling, premium moments)
   - Minimum viable: 15 assets total (10 images + 5 videos)
   - Optimal range: 20-50 assets total
   - Maximum if budget allows: 80 assets
   
   **Formats adapted to channels**:
      * Instagram: 1:1 Feed, 9:16 Stories/Reels
      * Facebook: 1:1 or 16:9
      * LinkedIn: 16:9 or 1:1
      * TikTok: 9:16 only
      * Print: 3:4 or 2:3 portrait
      * TV: 16:9 horizontal

4. DETAILED ASSET BRIEFS - **MARKETING FOCUS**
   Each asset MUST include:
   - **Marketing objective** (specific, measurable - "Drive 500 clicks to landing page")
   - **Concept** (1-2 sentences - strategic idea, message, emotion)
   - **Key message** (headline, subheadline, CTA)
   - **Visual concept** (30-80 words - WHAT to show, NOT HOW to shoot it)
     Example: "Show product in urban environment with young professionals using it confidently"
     NOT: "Shot on Canon 5D, Golden Ratio composition, frozen moment archetype"
   - **Target audience segment** (who sees this)
   - **Channel placement** (where it will be posted)
   - **Scheduled date + optimal time**
   - **Expected KPIs** (impressions, engagement, conversions)
   - **Creative brief** (100-200 words summary for Image/Video analyzer)

5. BUDGET DISCIPLINE
   - Calculate precise cost per asset:
     * Image 1K: 10 credits (base model)
     * Image 2K: 30 credits (base model)
     * Image 1K Coconut: 115 credits (100 analysis + 15 generation)
     * Image 2K Coconut: 135 credits (100 analysis + 35 generation)
     * Video 6-8s fast: 10-15 credits (base model)
     * Video 15-20s fast: 25-35 credits (base model)
     * Video 6-8s Coconut: 140 credits (100 analysis + 40 generation)
     * Video 15-30s Coconut: 200 credits (100 analysis + 100 generation)
   - Total ≤ user budget
   - Reserve 5% margin for adjustments

6. REALISTIC CALENDAR
   - 3-5 assets per week maximum
   - Optimal posting days (Tue/Thu for engagement, Sun/Mon for reach)
   - Avoid audience fatigue (space out similar content)
   - Align with industry events/seasons

7. MEASURABLE KPIS
   - Primary metric (conversions, revenue, signups)
   - Secondary metrics (engagement, reach, brand sentiment)
   - Week-by-week targets
   - A/B testing recommendations

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT FORMAT - CRITICAL JSON RULES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🚨 CRITICAL: YOUR RESPONSE MUST BE VALID JSON ONLY 🚨

MANDATORY FORMATTING RULES:

1. **NO premature quote closing**
   ❌ WRONG: "text", and more
   ✅ CORRECT: "text, and more"
   
2. **ALL text MUST stay inside ONE pair of quotes**
   ❌ WRONG: "value" (extra) text
   ✅ CORRECT: "value (extra) text"
   
3. **NO markdown blocks**
   ❌ WRONG: Starting with backticks or code blocks
   ✅ CORRECT: Start directly with {
   
4. **Escape quotes inside strings with single quotes**
   ❌ WRONG: "He said "hello""
   ✅ CORRECT: "He said 'hello'"
   
5. **NO trailing commas**
   ❌ WRONG: { "a": 1, }
   ✅ CORRECT: { "a": 1 }

⚠️ WILL BE PARSED WITH JSON.parse() - MUST BE 100% VALID JSON!

📝 SPECIFIC RULES FOR FRENCH TEXT:
- "énergisante, parfaite pour..." ✅ (ONE string)
- "énergisante", parfaite pour ❌ (closes quotes too early)

Return this EXACT structure:

{
  "campaignTitle": "Brand Name - Creative Theme",
  "strategy": {
    "positioning": "Strategic positioning statement (keep ALL text in ONE string)",
    "theme": "Creative theme that unifies all content (keep ALL text in ONE string)",
    "messagingPillars": ["Pillar 1", "Pillar 2", "Pillar 3"],
    "narrativeArc": "Story progression across weeks (keep ALL text in ONE string)"
  },
  "visualIdentity": {
    "theme": "Visual style description",
    "palette": [
      { "hex": "#XXXXXX", "name": "Color name", "usage": "Usage description" }
    ],
    "photographyStyle": "Detailed photography direction 30-50 words",
    "typography": {
      "headlines": "Specific font name for headlines",
      "body": "Specific font name for body text"
    },
    "archetypes": ["Hero", "Creator"]
  },
  "timeline": {
    "totalWeeks": 6,
    "startDate": "2025-01-13",
    "endDate": "2025-02-23"
  },
  "weeks": [
    {
      "weekNumber": 1,
      "startDate": "2025-01-13",
      "endDate": "2025-01-19",
      "objective": "Week strategic objective",
      "theme": "Week creative theme",
      "channels": ["instagram", "facebook"],
      "assets": [/* 3-5 assets */],
      "budgetWeek": 370,
      "kpisWeek": {
        "impressions": 15000,
        "engagement": "2.8%",
        "conversions": 0
      }
    }
  ],
  "allAssets": [
    {
      "id": "asset-w1-img-001",
      "order": 1,
      "weekNumber": 1,
      "type": "image",
      "format": "1:1",
      "resolution": "2K",
      "useCoconut": true,
      "marketingObjective": "Drive 500 website clicks with hero product visual",
      "concept": "Showcase product as essential tool for modern urban lifestyle, emphasizing convenience and style",
      "keyMessage": {
        "headline": "Your Urban Essential",
        "subheadline": "Designed for life in motion",
        "cta": "Shop Now"
      },
      "visualConcept": "Product prominently featured in hands of young professional in vibrant city setting during golden hour. Natural, authentic moment showing product in real use. Warm, inviting atmosphere with urban architecture bokeh in background. Focus on lifestyle aspiration rather than product specs.",
      "targetAudience": "Urban professionals 25-35, early adopters, value design and function",
      "channels": ["instagram", "facebook"],
      "placementRecommendations": "Instagram Feed (1:1), Facebook Ad carousel lead position",
      "scheduledDate": "2025-01-13",
      "scheduledTime": "18:00",
      "creativeBrief": "Create hero launch image showcasing product in authentic urban lifestyle context. Target audience is design-conscious urban professionals who value products that blend seamlessly into their fast-paced lives. Visual should feel aspirational yet authentic, warm yet modern. Product should be the hero but naturally integrated into scene. Use warm golden hour lighting and city environment to create emotional connection. This is the campaign anchor image that sets visual tone for entire launch.",
      "estimatedCost": 135,
      "expectedKpis": {
        "impressions": 5000,
        "engagementRate": "3.5-4.5%",
        "clicks": 500,
        "conversions": 25
      },
      "notes": "This is the hero launch asset - will set visual standard for entire campaign"
    }
  ],
  "estimatedCost": {
    "analysis": 100,
    "images": 1840,
    "videos": 1260,
    "total": 3200
  },
  "kpis": {
    "primary": "Primary KPI with target number",
    "secondary": ["Secondary KPI 1", "Secondary KPI 2"],
    "trackingRecommendations": "How to track and optimize"
  }
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
QUALITY CHECKLIST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Before returning, verify:
- [ ] Palette has EXACTLY 5 colors with hex codes
- [ ] Photography style is consistent and detailed (30-50 words)
- [ ] Typography specifies actual font names
- [ ] Each asset has marketing objective (specific, measurable)
- [ ] Each asset has concept (1-2 sentences, strategic)
- [ ] Each asset has keyMessage with headline/subheadline/cta
- [ ] Each asset has visualConcept (30-80 words, WHAT not HOW)
- [ ] Each asset has creativeBrief (100-200 words for analyzer delegation)
- [ ] Each asset specifies useCoconut: true (for premium) or false (for base model)
- [ ] Total cost ≤ user budget
- [ ] Assets distributed evenly across weeks (3-5 per week)
- [ ] Narrative arc is clear and progressive
- [ ] Channel formats are optimized
- [ ] KPIs are specific and measurable
- [ ] JSON is valid (no trailing commas, proper escaping)

Now create an exceptional campaign plan that will be executed by specialized Image and Video analyzers.
`;
}

// ============================================================================
// USER PROMPT BUILDER
// ============================================================================

function buildCampaignUserPrompt(briefing: CampaignBriefingInput): string {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() + 7); // Start next week
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + (briefing.duration * 7));

  return `
Create a complete integrated marketing campaign plan for:

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CAMPAIGN BRIEF
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

OBJECTIVE: ${briefing.objective}
DURATION: ${briefing.duration} weeks (${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]})
BUDGET: ${briefing.budgetCredits} credits
CHANNELS: ${briefing.channels.join(', ')}

AUDIENCE:
- Demographics: ${briefing.targetAudience.demographics.ageRange}, ${briefing.targetAudience.demographics.gender}, ${briefing.targetAudience.demographics.location}
- Psychographics: ${briefing.targetAudience.psychographics}

PRODUCT/BRAND:
- Name: ${briefing.productInfo.name}
- Category: ${briefing.productInfo.category}
- Key Features: ${briefing.productInfo.keyFeatures.join(', ')}
- USP: ${briefing.productInfo.uniqueSellingPoints}

DETAILED BRIEF:
${briefing.description}

CONTENT MIX REQUESTED:
- ${briefing.contentMix.imagesCount} images
- ${briefing.contentMix.videosCount} videos
- Total: ${briefing.contentMix.imagesCount + briefing.contentMix.videosCount} assets

PREFERRED FORMATS:
- Images: ${briefing.contentMix.preferredFormats.images.join(', ')}
- Videos: ${briefing.contentMix.preferredFormats.videos.join(', ')}

${briefing.constraints ? `
CONSTRAINTS:
${briefing.constraints.mustIncludeElements ? `- Must include: ${briefing.constraints.mustIncludeElements.join(', ')}` : ''}
${briefing.constraints.avoidElements ? `- Avoid: ${briefing.constraints.avoidElements.join(', ')}` : ''}
${briefing.constraints.brandColors ? `- Brand colors: ${briefing.constraints.brandColors.join(', ')}` : ''}
` : ''}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Provide a complete campaign plan with:
1. Strategic positioning and narrative arc
2. Unified visual identity (palette, style, typography)
3. ${briefing.duration} weeks with ${Math.ceil((briefing.contentMix.imagesCount + briefing.contentMix.videosCount) / briefing.duration)} assets per week
4. Detailed creative brief for each of the ${briefing.contentMix.imagesCount + briefing.contentMix.videosCount} assets
5. Channel-optimized formats and placement
6. KPIs and tracking recommendations
7. Precise cost calculation within ${briefing.budgetCredits} credits budget

Return JSON only, no markdown.
`;
}

// ============================================================================
// MAIN ANALYZER FUNCTION
// ============================================================================

export async function analyzeCampaignWithGemini(
  briefing: CampaignBriefingInput,
  providedAssetUrls?: string[]
): Promise<GeminiCampaignAnalysisResponse & { geminiService?: 'kie-ai' | 'replicate' }> {
  console.log('🎯 [Campaign Analyzer] Starting strategic analysis...');
  console.log(`📊 Campaign: ${briefing.duration} weeks, ${briefing.budgetCredits} credits budget`);
  console.log(`🎨 Content mix: ${briefing.contentMix.imagesCount} images + ${briefing.contentMix.videosCount} videos`);

  const systemPrompt = buildCampaignSystemPrompt();
  const userPrompt = buildCampaignUserPrompt(briefing);

  try {
    console.log('🔍 Calling Gemini for campaign analysis...');
    
    // ✅ Try Replicate Gemini FIRST (most reliable)
    let rawResponse: string | undefined;
    let geminiService: 'kie-ai' | 'replicate' = 'replicate';
    
    try {
      const result = await generateTextNative({
        prompt: userPrompt,
        systemPrompt: systemPrompt,
        temperature: 0.7,
        maxTokens: 65535 // ✅ MAX POSSIBLE (65K comme dans la doc Replicate)
      });
      rawResponse = result.text;
      console.log('✅ Got response from Replicate Gemini');
      geminiService = 'replicate';
    } catch (replicateError) {
      console.warn('⚠️ Replicate failed, falling back to Kie AI Gemini:', replicateError);
      try {
        rawResponse = await generateTextKieAI(
          userPrompt,
          providedAssetUrls || [],
          systemPrompt,
          20000, // max_output_tokens
          16000, // thinking_budget
          true   // dynamic_thinking
        );
        console.log('✅ Got response from Kie AI Gemini');
        geminiService = 'kie-ai';
      } catch (kieError) {
        console.error('❌ Both Gemini endpoints failed:', kieError);
        throw new Error('All Gemini services unavailable. Please try again later.');
      }
    }

    if (!rawResponse) {
      throw new Error('Empty response from Gemini');
    }

    console.log('📝 Raw response length:', rawResponse.length);
    console.log('🔧 Parsing JSON response...');

    const parsedData = parseJSONFromMarkdown(rawResponse);
    
    if (!parsedData) {
      throw new Error('Failed to parse Gemini JSON response');
    }

    console.log('✅ Campaign analysis complete');
    console.log(`📊 Generated ${parsedData.allAssets?.length || 0} assets across ${parsedData.weeks?.length || 0} weeks`);
    console.log(`💰 Estimated cost: ${parsedData.estimatedCost?.total || 0} credits`);
    console.log(`🤖 Service used: ${geminiService}`);

    return {
      ...(parsedData as GeminiCampaignAnalysisResponse),
      geminiService
    };

  } catch (error) {
    console.error('❌ [Campaign Analyzer] Fatal error:', error);
    throw new Error(`Campaign analysis failed: ${error.message}`);
  }
}

// ============================================================================
// HTTP HANDLER
// ============================================================================

export async function handleAnalyzeCampaign(c: Context): Promise<Response> {
  try {
    console.log('🚀 [handleAnalyzeCampaign] Starting...');
    
    const body = await c.req.json();
    const { briefing, providedAssetUrls } = body;

    if (!briefing) {
      return new Response(
        JSON.stringify({ success: false, error: 'Missing briefing' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate briefing
    if (!briefing.userId || !briefing.objective || !briefing.duration || !briefing.budgetCredits) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid briefing: missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check user credits
    const userCredits = await CreditsSystem.getUserCredits(briefing.userId);
    const totalAvailable = userCredits.free + userCredits.paid;
    
    if (totalAvailable < briefing.budgetCredits) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Insufficient credits. Need ${briefing.budgetCredits}, have ${totalAvailable}.` 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Analyze campaign
    const analysis = await analyzeCampaignWithGemini(briefing, providedAssetUrls);

    // ✅ Deduct ONLY analysis cost (100 credits), not full budget
    const analysisCost = 100;
    const deductResult = await CreditsSystem.deductCredits(
      briefing.userId, 
      analysisCost,
      'Campaign Gemini Analysis',
      { campaignBudget: briefing.budgetCredits, objective: briefing.objective }
    );
    
    if (!deductResult.success) {
      return new Response(
        JSON.stringify({ success: false, error: deductResult.error }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Generate CocoBoard ID
    const cocoBoardId = `campaign-${Date.now()}-${Math.random().toString(36).substring(7)}`;
    
    // Add metadata to analysis
    const analysisWithMetadata = {
      ...analysis,
      cocoBoardId,
      createdAt: new Date().toISOString(),
      briefing: briefing, // Store original briefing for reference
    };

    console.log(`✅ [handleAnalyzeCampaign] Success, cocoBoardId: ${cocoBoardId}`);

    return new Response(
      JSON.stringify({
        success: true,
        data: analysisWithMetadata,
        cocoBoardId,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('❌ [handleAnalyzeCampaign] Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Campaign analysis failed',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}