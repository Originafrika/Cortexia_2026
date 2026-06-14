/**
 * HELP CENTER - FAQ and documentation
 * 
 * Features:
 * - FAQ sections
 * - Keyboard shortcuts guide
 * - Search functionality
 * - Video tutorials (links)
 * - Contact support
 */

import { useState } from 'react';
import { Modal, Button, Badge, Input } from '@/components/ui-premium';
import { Search, ChevronDown, ChevronRight, HelpCircle, Keyboard, Video, MessageCircle, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// ============================================
// TYPES
// ============================================

export interface HelpCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FAQItem {
  question: string;
  answer: string;
  category: string;
}

interface KeyboardShortcut {
  keys: string;
  description: string;
  category: string;
}

// ============================================
// DATA
// ============================================

const FAQ_ITEMS: FAQItem[] = [
  {
    category: 'Getting Started',
    question: 'What is Coconut?',
    answer: 'Coconut is our advanced AI campaign builder that lets you create complete creative campaigns with images, videos, and more through a visual canvas interface.',
  },
  {
    category: 'Getting Started',
    question: 'How do credits work?',
    answer: 'Credits are used to generate AI assets. Free users get 100 credits to start. Each generation costs credits based on the AI model used (10-100 credits per asset).',
  },
  {
    category: 'Getting Started',
    question: 'What AI models do you use?',
    answer: 'We use industry-leading models: Flux 2 Pro for images, Veo 3.1 Fast for videos, and OpenAI GPT-4 for creative intelligence.',
  },
  {
    category: 'Campaigns',
    question: 'How do I create a campaign?',
    answer: 'Click "New Campaign" in the Coconut section, choose your campaign type, and start adding nodes to the canvas. Each node represents an asset to generate.',
  },
  {
    category: 'Campaigns',
    question: 'Can I connect nodes?',
    answer: 'Yes! Connect nodes to create dependencies and maintain continuity. For example, connect video frames to ensure smooth transitions.',
  },
  {
    category: 'Campaigns',
    question: 'What are CocoBoards?',
    answer: 'CocoBoards are complete campaign plans that include all assets, structure, and generation settings. Each CocoBoard costs 100 paid credits.',
  },
  {
    category: 'Generation',
    question: 'How long does generation take?',
    answer: 'Images typically take 10-30 seconds, videos 1-3 minutes. Complex campaigns with many nodes may take longer.',
  },
  {
    category: 'Generation',
    question: 'Can I regenerate assets?',
    answer: 'Yes! You can regenerate any node. This will use credits again but gives you a fresh result.',
  },
  {
    category: 'Generation',
    question: 'What if generation fails?',
    answer: 'Failed generations don\'t use credits. Check your prompt and try again. If issues persist, contact support.',
  },
  {
    category: 'Credits',
    question: 'How do I get more credits?',
    answer: 'Purchase credit packs in your account settings. Paid credits never expire and can be used for any generation.',
  },
  {
    category: 'Credits',
    question: 'Do free credits expire?',
    answer: 'Free credits don\'t expire but can only be used for basic features. Some advanced features require paid credits.',
  },
  {
    category: 'Export',
    question: 'How do I export my work?',
    answer: 'Click the Export button to download your campaign as JSON, or download individual assets directly from each node.',
  },
  {
    category: 'Export',
    question: 'What formats are supported?',
    answer: 'Images are exported as PNG/JPG, videos as MP4, and campaign data as JSON for re-importing.',
  },
];

const KEYBOARD_SHORTCUTS: KeyboardShortcut[] = [
  { category: 'Canvas', keys: 'Space + Drag', description: 'Pan the canvas' },
  { category: 'Canvas', keys: 'Scroll', description: 'Zoom in/out' },
  { category: 'Canvas', keys: 'Ctrl/Cmd + Z', description: 'Undo' },
  { category: 'Canvas', keys: 'Ctrl/Cmd + Y', description: 'Redo' },
  { category: 'Nodes', keys: 'Delete', description: 'Delete selected node' },
  { category: 'Nodes', keys: 'Ctrl/Cmd + D', description: 'Duplicate node' },
  { category: 'Nodes', keys: 'Ctrl/Cmd + C', description: 'Copy node' },
  { category: 'Nodes', keys: 'Ctrl/Cmd + V', description: 'Paste node' },
  { category: 'Selection', keys: 'Ctrl/Cmd + A', description: 'Select all nodes' },
  { category: 'Selection', keys: 'Escape', description: 'Deselect all' },
  { category: 'General', keys: 'Ctrl/Cmd + S', description: 'Save campaign' },
  { category: 'General', keys: 'Ctrl/Cmd + /', description: 'Open help' },
];

// ============================================
// COMPONENT
// ============================================

export function HelpCenter({ isOpen, onClose }: HelpCenterProps) {
  const [activeTab, setActiveTab] = useState<'faq' | 'shortcuts' | 'videos'>('faq');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<number[]>([]);

  // Filter FAQ by search
  const filteredFAQ = FAQ_ITEMS.filter(
    (item) =>
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group FAQ by category
  const faqByCategory = filteredFAQ.reduce((acc, item, index) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push({ ...item, index });
    return acc;
  }, {} as Record<string, Array<FAQItem & { index: number }>>);

  // Toggle FAQ item
  const toggleFAQ = (index: number) => {
    setExpandedFAQ((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" title="Help Center">
      <div className="flex flex-col h-[600px]">
        {/* Tabs */}
        <div className="flex gap-2 p-4 border-b border-gray-800">
          <Button
            variant={activeTab === 'faq' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('faq')}
          >
            <HelpCircle className="w-4 h-4 mr-2" />
            FAQ
          </Button>
          <Button
            variant={activeTab === 'shortcuts' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('shortcuts')}
          >
            <Keyboard className="w-4 h-4 mr-2" />
            Keyboard Shortcuts
          </Button>
          <Button
            variant={activeTab === 'videos' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('videos')}
          >
            <Video className="w-4 h-4 mr-2" />
            Video Tutorials
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'faq' && (
            <div className="space-y-6">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search help articles..."
                  className="pl-10"
                />
              </div>

              {/* FAQ Items */}
              {Object.entries(faqByCategory).map(([category, items]) => (
                <div key={category}>
                  <h3 className="text-lg font-semibold text-white mb-3">{category}</h3>
                  <div className="space-y-2">
                    {items.map((item) => (
                      <div
                        key={item.index}
                        className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden"
                      >
                        <button
                          onClick={() => toggleFAQ(item.index)}
                          className="w-full p-4 text-left flex items-center justify-between hover:bg-gray-800 transition-colors"
                        >
                          <span className="text-white font-medium">{item.question}</span>
                          {expandedFAQ.includes(item.index) ? (
                            <ChevronDown className="w-5 h-5 text-gray-400" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          )}
                        </button>
                        <AnimatePresence>
                          {expandedFAQ.includes(item.index) && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                            >
                              <div className="px-4 pb-4 text-gray-400 border-t border-gray-800">
                                {item.answer}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {filteredFAQ.length === 0 && (
                <div className="text-center py-12">
                  <HelpCircle className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400">No results found</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Try a different search term
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'shortcuts' && (
            <div className="space-y-6">
              {['Canvas', 'Nodes', 'Selection', 'General'].map((category) => (
                <div key={category}>
                  <h3 className="text-lg font-semibold text-white mb-3">{category}</h3>
                  <div className="space-y-2">
                    {KEYBOARD_SHORTCUTS.filter((s) => s.category === category).map(
                      (shortcut, index) => (
                        <div
                          key={index}
                          className="bg-gray-900 border border-gray-800 rounded-lg p-3 flex items-center justify-between"
                        >
                          <span className="text-gray-300">{shortcut.description}</span>
                          <div className="flex gap-1">
                            {shortcut.keys.split(' + ').map((key, i) => (
                              <span key={i} className="flex items-center gap-1">
                                <kbd className="px-2 py-1 text-xs bg-gray-800 border border-gray-700 rounded text-white">
                                  {key}
                                </kbd>
                                {i < shortcut.keys.split(' + ').length - 1 && (
                                  <span className="text-gray-600">+</span>
                                )}
                              </span>
                            ))}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'videos' && (
            <div className="space-y-4">
              <p className="text-gray-400 mb-6">
                Watch video tutorials to learn Cortexia faster
              </p>

              {[
                {
                  title: 'Getting Started with Cortexia',
                  duration: '5:30',
                  thumbnail: 'https://via.placeholder.com/320x180',
                },
                {
                  title: 'Creating Your First Campaign',
                  duration: '8:15',
                  thumbnail: 'https://via.placeholder.com/320x180',
                },
                {
                  title: 'Advanced Node Configuration',
                  duration: '12:45',
                  thumbnail: 'https://via.placeholder.com/320x180',
                },
                {
                  title: 'CocoBoard Production Workflow',
                  duration: '15:20',
                  thumbnail: 'https://via.placeholder.com/320x180',
                },
              ].map((video, index) => (
                <div
                  key={index}
                  className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden hover:border-gray-700 transition-colors cursor-pointer"
                >
                  <div className="flex gap-4 p-4">
                    <div className="relative flex-shrink-0">
                      <img
                        src={video.thumbnail}
                        alt={video.title}
                        className="w-40 h-24 object-cover rounded"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-12 h-12 rounded-full bg-primary-500/80 backdrop-blur-sm flex items-center justify-center">
                          <Video className="w-6 h-6 text-white" />
                        </div>
                      </div>
                      <Badge
                        variant="dark"
                        size="sm"
                        className="absolute bottom-2 right-2"
                      >
                        {video.duration}
                      </Badge>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-medium mb-1">{video.title}</h4>
                      <p className="text-sm text-gray-400">
                        Learn the fundamentals in this comprehensive guide
                      </p>
                    </div>
                    <ExternalLink className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-800 p-4 bg-gray-900/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <MessageCircle className="w-4 h-4" />
              <span>Still need help?</span>
            </div>
            <Button variant="outline" size="sm">
              Contact Support
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
