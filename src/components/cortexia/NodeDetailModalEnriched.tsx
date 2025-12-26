/**
 * NODE DETAIL MODAL - ENRICHED WITH CREATIVE INTELLIGENCE
 * Shows comprehensive details for a Coconut V10 node with all Creative Intelligence metadata
 */

import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Image as ImageIcon, Video, Layers, Sparkles, ChevronRight, 
  Palette, Camera, Film, Target, Lightbulb, Globe, Users
} from 'lucide-react';

interface NodeDetailModalProps {
  node: any;
  isOpen: boolean;
  onClose: () => void;
  generatedAssets: Map<string, any>;
}

export function NodeDetailModal({ node, isOpen, onClose, generatedAssets }: NodeDetailModalProps) {
  if (!node) return null;

  // Get the actual result if generated
  const result = generatedAssets.get(node.id);
  const intelligence = node.creativeIntelligence;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-4 md:inset-8 lg:inset-16 z-50 bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                {node.type === 'video' || node.type === 'shot' ? (
                  <Video className="w-6 h-6 text-purple-400" />
                ) : (
                  <ImageIcon className="w-6 h-6 text-blue-400" />
                )}
                <div>
                  <h2 className="text-xl text-white">{node.title}</h2>
                  <p className="text-sm text-white/60">{node.description}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Preview */}
              {result?.url && (
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <h3 className="text-sm text-white/60 mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Generated Result
                  </h3>
                  {node.type === 'video' || node.type === 'shot' ? (
                    <video
                      src={result.url}
                      controls
                      className="w-full rounded-xl"
                    />
                  ) : (
                    <img
                      src={result.url}
                      alt={node.title}
                      className="w-full rounded-xl"
                    />
                  )}
                </div>
              )}

              {/* ✅ CREATIVE CONCEPT */}
              {intelligence?.concept && (
                <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl p-4 border border-purple-500/20">
                  <h3 className="text-sm text-white/60 mb-3 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-purple-400" />
                    Creative Concept
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs text-white/40">Title</span>
                      <p className="text-lg text-white">{intelligence.concept.title}</p>
                    </div>
                    <div>
                      <span className="text-xs text-white/40">Tagline</span>
                      <p className="text-white/90 italic">"{intelligence.concept.tagline}"</p>
                    </div>
                    <div>
                      <span className="text-xs text-white/40">Narrative</span>
                      <p className="text-sm text-white/80 leading-relaxed">
                        {intelligence.concept.narrative}
                      </p>
                    </div>
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <span className="text-xs text-white/40">Emotion</span>
                        <p className="text-sm text-purple-300">{intelligence.concept.emotion}</p>
                      </div>
                      <div className="flex-1">
                        <span className="text-xs text-white/40">Unique Angle</span>
                        <p className="text-sm text-pink-300">{intelligence.concept.uniqueAngle}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ✅ COLOR PALETTE */}
              {intelligence?.colorStrategy && (
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <h3 className="text-sm text-white/60 mb-3 flex items-center gap-2">
                    <Palette className="w-4 h-4" />
                    Color Palette
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Primary Colors */}
                    <div>
                      <span className="text-xs text-white/40 mb-2 block">Primary</span>
                      <div className="flex gap-2">
                        {intelligence.colorStrategy.palette.primary.map((color: string, i: number) => (
                          <div key={i} className="flex flex-col items-center gap-1">
                            <div 
                              className="w-16 h-16 rounded-lg border-2 border-white/20 shadow-lg"
                              style={{ 
                                backgroundColor: intelligence.colorStrategy.hexCodes?.[i] || '#888' 
                              }}
                            />
                            <span className="text-xs text-white/80">{color}</span>
                            {intelligence.colorStrategy.hexCodes?.[i] && (
                              <span className="text-xs text-white/40 font-mono">
                                {intelligence.colorStrategy.hexCodes[i]}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Secondary Colors */}
                    {intelligence.colorStrategy.palette.secondary && intelligence.colorStrategy.palette.secondary.length > 0 && (
                      <div>
                        <span className="text-xs text-white/40 mb-2 block">Secondary</span>
                        <div className="flex gap-2">
                          {intelligence.colorStrategy.palette.secondary.map((color: string, i: number) => (
                            <div key={i} className="flex flex-col items-center gap-1">
                              <div 
                                className="w-12 h-12 rounded-lg border-2 border-white/20"
                                style={{ 
                                  backgroundColor: intelligence.colorStrategy.hexCodes?.[intelligence.colorStrategy.palette.primary.length + i] || '#666' 
                                }}
                              />
                              <span className="text-xs text-white/80">{color}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Psychology */}
                    <div>
                      <span className="text-xs text-white/40 block mb-1">Psychology</span>
                      <p className="text-sm text-white/90 leading-relaxed">
                        {intelligence.colorStrategy.colorPsychology}
                      </p>
                    </div>
                    
                    {/* Contrast Level */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-white/40">Contrast:</span>
                      <span className="text-xs px-2 py-1 bg-white/10 rounded-full text-white/90">
                        {intelligence.colorStrategy.contrastLevel}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* ✅ ART DIRECTION (for images) */}
              {node.type === 'image' && intelligence?.artDirection && (
                <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-2xl p-4 border border-blue-500/20">
                  <h3 className="text-sm text-white/60 mb-3 flex items-center gap-2">
                    <Camera className="w-4 h-4 text-blue-400" />
                    Art Direction
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-xs text-white/40 block mb-1">Composition</span>
                      <p className="text-sm text-white/90">{intelligence.artDirection.composition}</p>
                    </div>
                    <div>
                      <span className="text-xs text-white/40 block mb-1">Lighting</span>
                      <p className="text-sm text-white/90">{intelligence.artDirection.lighting}</p>
                    </div>
                    <div>
                      <span className="text-xs text-white/40 block mb-1">Framing</span>
                      <p className="text-sm text-white/90">{intelligence.artDirection.framing}</p>
                    </div>
                    <div>
                      <span className="text-xs text-white/40 block mb-1">Perspective</span>
                      <p className="text-sm text-white/90">{intelligence.artDirection.perspective}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-xs text-white/40 block mb-1">Depth Strategy</span>
                      <p className="text-sm text-white/90">{intelligence.artDirection.depth}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-xs text-white/40 block mb-1">Visual Hierarchy</span>
                      <p className="text-sm text-white/90">{intelligence.artDirection.visualHierarchy}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* ✅ CINEMATOGRAPHY (for videos) */}
              {node.type === 'video' && intelligence?.cinematography && (
                <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-2xl p-4 border border-purple-500/20">
                  <h3 className="text-sm text-white/60 mb-3 flex items-center gap-2">
                    <Film className="w-4 h-4 text-purple-400" />
                    Cinematography
                  </h3>
                  
                  {/* Shot List */}
                  {intelligence.cinematography.shotList && intelligence.cinematography.shotList.length > 0 && (
                    <div className="space-y-2 mb-4">
                      <span className="text-xs text-white/40 block">Shot List</span>
                      {intelligence.cinematography.shotList.map((shot: any, i: number) => (
                        <div key={i} className="bg-white/5 rounded-lg p-3 border border-white/10">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded font-medium">
                              Shot {shot.shotNumber}
                            </span>
                            <span className="text-xs text-white/60">{shot.duration}</span>
                            <span className="text-xs text-white/40">•</span>
                            <span className="text-xs text-white/60">{shot.shotType}</span>
                          </div>
                          <p className="text-sm text-white/90 mb-2">{shot.description}</p>
                          <div className="flex gap-2 text-xs text-white/60">
                            <span className="bg-white/10 px-2 py-0.5 rounded">{shot.cameraMovement}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Technical Details */}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-xs text-white/40 block mb-1">Camera Style</span>
                      <p className="text-sm text-white/90">{intelligence.cinematography.cameraStyle}</p>
                    </div>
                    <div>
                      <span className="text-xs text-white/40 block mb-1">Lens Choice</span>
                      <p className="text-sm text-white/90">{intelligence.cinematography.lensChoice}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-xs text-white/40 block mb-1">Focus Strategy</span>
                      <p className="text-sm text-white/90">{intelligence.cinematography.focusStrategy}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-xs text-white/40 block mb-1">Motion Design</span>
                      <p className="text-sm text-white/90">{intelligence.cinematography.motionDesign}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* ✅ MARKETING STRATEGY (for campaigns) */}
              {node.type === 'campaign' && intelligence?.marketingStrategy && (
                <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-2xl p-4 border border-green-500/20">
                  <h3 className="text-sm text-white/60 mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4 text-green-400" />
                    Marketing Strategy
                  </h3>
                  
                  <div className="space-y-4">
                    <div>
                      <span className="text-xs text-white/40 block mb-1">Objective</span>
                      <p className="text-sm text-white/90">{intelligence.marketingStrategy.objective}</p>
                    </div>
                    
                    <div>
                      <span className="text-xs text-white/40 block mb-1">Target Audience</span>
                      <p className="text-sm text-white/90">{intelligence.marketingStrategy.targetAudience}</p>
                    </div>
                    
                    <div>
                      <span className="text-xs text-white/40 block mb-2">Platforms</span>
                      <div className="flex gap-2 flex-wrap">
                        {intelligence.marketingStrategy.platforms.map((platform: string, i: number) => (
                          <span key={i} className="text-xs bg-green-500/20 text-green-300 px-3 py-1 rounded-full">
                            {platform}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {intelligence.marketingStrategy.contentMix && intelligence.marketingStrategy.contentMix.length > 0 && (
                      <div>
                        <span className="text-xs text-white/40 block mb-2">Content Mix</span>
                        <div className="space-y-2">
                          {intelligence.marketingStrategy.contentMix.map((content: any, i: number) => (
                            <div key={i} className="flex items-center justify-between bg-white/5 rounded-lg p-3">
                              <div className="flex items-center gap-3">
                                <span className="text-sm text-white/90">{content.type}</span>
                                <span className="text-xs bg-white/10 text-white/60 px-2 py-1 rounded">
                                  x{content.count}
                                </span>
                              </div>
                              <span className="text-xs text-white/60">{content.purpose}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <span className="text-xs text-white/40 block mb-1">Messaging Strategy</span>
                      <p className="text-sm text-white/90">{intelligence.marketingStrategy.messagingStrategy}</p>
                    </div>
                    
                    <div className="bg-white/10 rounded-lg p-3 border-l-4 border-green-400">
                      <span className="text-xs text-white/40 block mb-1">Call to Action</span>
                      <p className="text-white">{intelligence.marketingStrategy.callToAction}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* ✅ VISUAL STYLE */}
              {intelligence?.visualStyle && (
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <h3 className="text-sm text-white/60 mb-3">Visual Style</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs text-white/40 block mb-2">Style Keywords</span>
                      <div className="flex gap-2 flex-wrap">
                        {intelligence.visualStyle.styleKeywords.map((keyword: string, i: number) => (
                          <span key={i} className="text-xs bg-purple-500/20 text-purple-300 px-3 py-1 rounded-full">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {intelligence.visualStyle.artMovement && (
                      <div>
                        <span className="text-xs text-white/40 block mb-1">Art Movement</span>
                        <p className="text-sm text-white/90">{intelligence.visualStyle.artMovement}</p>
                      </div>
                    )}
                    
                    {intelligence.visualStyle.references && intelligence.visualStyle.references.length > 0 && (
                      <div>
                        <span className="text-xs text-white/40 block mb-1">References</span>
                        <ul className="list-disc list-inside text-sm text-white/90 space-y-1">
                          {intelligence.visualStyle.references.map((ref: string, i: number) => (
                            <li key={i}>{ref}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    
                    <div className="flex gap-4">
                      <div className="flex-1">
                        <span className="text-xs text-white/40 block mb-1">Atmosphere</span>
                        <p className="text-sm text-white/90">{intelligence.visualStyle.atmosphere}</p>
                      </div>
                      <div className="flex-1">
                        <span className="text-xs text-white/40 block mb-1">Tone</span>
                        <p className="text-sm text-white/90">{intelligence.visualStyle.tone}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ✅ BRAND IDENTITY */}
              {intelligence?.brandIdentity && (
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <h3 className="text-sm text-white/60 mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Brand Identity
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <span className="text-xs text-white/40 block mb-1">Positioning</span>
                      <p className="text-sm text-white/90">{intelligence.brandIdentity.positioning}</p>
                    </div>
                    <div>
                      <span className="text-xs text-white/40 block mb-1">Visual Identity</span>
                      <p className="text-sm text-white/90">{intelligence.brandIdentity.visualIdentity}</p>
                    </div>
                    <div>
                      <span className="text-xs text-white/40 block mb-1">Logo Style</span>
                      <p className="text-sm text-white/90">{intelligence.brandIdentity.logoStyle}</p>
                    </div>
                    <div>
                      <span className="text-xs text-white/40 block mb-1">Typography</span>
                      <p className="text-sm text-white/90">{intelligence.brandIdentity.typography}</p>
                    </div>
                    <div>
                      <span className="text-xs text-white/40 block mb-1">Brand Voice</span>
                      <p className="text-sm text-white/90">{intelligence.brandIdentity.brandVoice}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* ✅ CULTURAL CONTEXT */}
              {intelligence?.culturalContext && (
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <h3 className="text-sm text-white/60 mb-3 flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    Cultural Context
                  </h3>
                  
                  <div className="space-y-3">
                    {intelligence.culturalContext.location && (
                      <div>
                        <span className="text-xs text-white/40 block mb-1">Location</span>
                        <p className="text-sm text-white/90">{intelligence.culturalContext.location}</p>
                      </div>
                    )}
                    
                    {intelligence.culturalContext.culturalElements && intelligence.culturalContext.culturalElements.length > 0 && (
                      <div>
                        <span className="text-xs text-white/40 block mb-2">Cultural Elements</span>
                        <div className="flex gap-2 flex-wrap">
                          {intelligence.culturalContext.culturalElements.map((element: string, i: number) => (
                            <span key={i} className="text-xs bg-white/10 text-white/80 px-2 py-1 rounded">
                              {element}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div>
                      <span className="text-xs text-white/40 block mb-1">Local Aesthetic</span>
                      <p className="text-sm text-white/90">{intelligence.culturalContext.localAesthetic}</p>
                    </div>
                    
                    <div>
                      <span className="text-xs text-white/40 block mb-1">Authenticity</span>
                      <p className="text-sm text-white/90">{intelligence.culturalContext.authenticity}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Generation Type */}
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <h3 className="text-sm text-white/60 mb-3">Generation Type</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-white/80">Method</span>
                    <span className="text-white font-medium">
                      {node.generationType?.method || 'text-to-image'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white/80">Model</span>
                    <span className="text-white font-medium">{node.model}</span>
                  </div>
                  {node.metadata?.passNumber && (
                    <div className="flex items-center justify-between">
                      <span className="text-white/80">Pass</span>
                      <span className="text-white font-medium">
                        {node.metadata.passNumber} / {node.metadata.totalPasses}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Prompt */}
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <h3 className="text-sm text-white/60 mb-3">Prompt</h3>
                <p className="text-white/90 text-sm leading-relaxed whitespace-pre-wrap font-mono">
                  {node.prompt}
                </p>
              </div>

              {/* Reference Images */}
              {node.referenceImages && node.referenceImages.length > 0 && (
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <h3 className="text-sm text-white/60 mb-3 flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    Reference Images ({node.referenceImages.length})
                  </h3>
                  <div className="space-y-3">
                    {node.referenceImages.map((ref: any, idx: number) => {
                      const refAsset = ref.nodeId ? generatedAssets.get(ref.nodeId) : null;
                      const imageUrl = ref.url || refAsset?.url;
                      
                      return (
                        <div
                          key={idx}
                          className="bg-white/5 rounded-xl p-3 border border-white/10"
                        >
                          <div className="flex items-start gap-3">
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={ref.purpose}
                                className="w-20 h-20 object-cover rounded-lg"
                              />
                            ) : (
                              <div className="w-20 h-20 bg-white/10 rounded-lg flex items-center justify-center">
                                <ImageIcon className="w-8 h-8 text-white/40" />
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded-full">
                                  {ref.purpose}
                                </span>
                              </div>
                              {ref.nodeId && (
                                <p className="text-xs text-white/60 flex items-center gap-1">
                                  <ChevronRight className="w-3 h-3" />
                                  From: {ref.nodeId}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Dependencies */}
              {node.dependencies && node.dependencies.length > 0 && (
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <h3 className="text-sm text-white/60 mb-3">Dependencies</h3>
                  <div className="space-y-2">
                    {node.dependencies.map((depId: string) => (
                      <div
                        key={depId}
                        className="flex items-center gap-2 text-sm text-white/80 bg-white/5 rounded-lg p-2 font-mono"
                      >
                        <ChevronRight className="w-4 h-4 text-white/40" />
                        {depId}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
