/**
 * TEST CAMPAIGN PAGE - Coconut Warm Premium Design
 */

import { useState } from 'react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

const API_BASE = `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214`;

export default function TestCampaignPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState(false);

  // ✅ Initialize credits on mount
  const initCredits = async () => {
    try {
      console.log('💳 Initializing 5000 paid credits for test-user...');
      const response = await fetch(`${API_BASE}/debug/init-credits/test-user`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ free: 0, paid: 5000 })
      });
      
      const data = await response.json();
      console.log('✅ Credits initialized:', data);
    } catch (error) {
      console.error('❌ Failed to init credits:', error);
    }
  };

  const runTest = async () => {
    console.log('🚀 [TestCampaign] runTest() called!');
    setIsRunning(true);
    setResult('🔄 Analyzing campaign with Gemini 2.0 Flash...');
    setIsSuccess(false);

    try {
      // ✅ Initialize credits first
      console.log('💳 Initializing credits...');
      await initCredits();

      const briefing = {
        objective: 'brand-awareness',
        duration: 1, // 1 semaine seulement
        budgetCredits: 5000, // ✅ 5000 crédits maintenant disponibles
        channels: ['instagram'],
        targetAudience: {
          demographics: {
            ageRange: '25-45 ans',
            gender: 'all',
            location: 'France'
          },
          psychographics: 'Professionnels tech'
        },
        contentMix: {
          imagesCount: 2, // Réduit pour économiser les crédits
          videosCount: 0,
          preferredFormats: {
            images: ['1:1'],
            videos: []
          }
        },
        providedAssets: {
          productPhotos: []
        },
        description: 'Test minimal campaign for Cortexia validation',
        productInfo: {
          name: 'Cortexia AI',
          category: 'SaaS',
          keyFeatures: ['AI Generation', 'Multi-model orchestration'],
          uniqueSellingPoints: 'Premium AI creation platform'
        },
        userId: 'test-user',
        projectId: `test-${Date.now()}`
      };

      console.log('🧪 Sending request to /campaign/analyze');
      console.log('📦 Briefing:', briefing);

      const response = await fetch(`${API_BASE}/campaign/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify({ briefing })
      });

      const data = await response.json();
      
      console.log('📥 Response:', response.status, data);

      if (!response.ok) {
        setIsSuccess(false);
        setResult(`❌ Error ${response.status}\n\n${data.error || response.statusText}\n\nDetails:\n${JSON.stringify(data, null, 2)}`);
      } else {
        setIsSuccess(true);
        const analysisData = data.data;
        setResult(
          `✅ CAMPAIGN ANALYSIS SUCCESS!\n\n` +
          `🤖 Service: ${analysisData?.geminiService || 'N/A'}\n` +
          `📋 Title: ${analysisData?.campaignTitle || 'N/A'}\n` +
          `📅 Duration: ${analysisData?.timeline?.totalWeeks || 0} weeks\n` +
          `🎨 Total Assets: ${analysisData?.allAssets?.length || 0}\n` +
          `💰 Credits Used: ${analysisData?.creditsDeducted || 0}\n\n` +
          `Full Response:\n${JSON.stringify(data, null, 2)}`
        );
      }
    } catch (error: any) {
      console.error('❌ Failed:', error);
      setIsSuccess(false);
      setResult(`❌ FETCH ERROR\n\n${error.message}\n\nCheck console for details.`);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0118] via-[#1a0a2e] to-[#0A0118] p-8">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="relative backdrop-blur-xl bg-white/5 rounded-3xl border border-white/10 p-8 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-r from-[#E8C4A0]/10 via-[#C19A6B]/10 to-[#A67C52]/10 rounded-3xl blur-2xl opacity-50" />
          <div className="relative">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#E8C4A0] via-[#D4AF7A] to-[#C19A6B] mb-2">
              Campaign Test Console
            </h1>
            <p className="text-[#E8C4A0]/60 text-sm">
              Coconut V14 • Gemini 2.0 Flash Analysis • Production Endpoint
            </p>
          </div>
        </div>
      </div>

      {/* Test Panel */}
      <div className="max-w-6xl mx-auto">
        <div className="relative backdrop-blur-xl bg-white/5 rounded-3xl border border-white/10 p-8 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-[#E8C4A0]/5 to-transparent rounded-3xl" />
          
          <div className="relative">
            {/* Test Configuration */}
            <div className="mb-6 p-6 rounded-2xl bg-white/5 border border-[#E8C4A0]/20">
              <h3 className="text-xl font-semibold text-[#E8C4A0] mb-4">Test Configuration</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-[#E8C4A0]/60">Budget:</span>
                  <span className="ml-2 text-[#E8C4A0] font-medium">5000 credits (paid)</span>
                </div>
                <div>
                  <span className="text-[#E8C4A0]/60">Duration:</span>
                  <span className="ml-2 text-[#E8C4A0] font-medium">1 week</span>
                </div>
                <div>
                  <span className="text-[#E8C4A0]/60">Assets:</span>
                  <span className="ml-2 text-[#E8C4A0] font-medium">2 images</span>
                </div>
                <div>
                  <span className="text-[#E8C4A0]/60">Channels:</span>
                  <span className="ml-2 text-[#E8C4A0] font-medium">Instagram</span>
                </div>
                <div>
                  <span className="text-[#E8C4A0]/60">User:</span>
                  <span className="ml-2 text-[#E8C4A0] font-medium">test-user</span>
                </div>
                <div>
                  <span className="text-[#E8C4A0]/60">AI Model:</span>
                  <span className="ml-2 text-[#E8C4A0] font-medium">Gemini 2.0 Flash</span>
                </div>
              </div>
            </div>

            {/* Run Button */}
            <button 
              onClick={runTest}
              disabled={isRunning}
              className="w-full relative group overflow-hidden rounded-2xl p-[2px] transition-all duration-300 mb-6"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#E8C4A0] via-[#D4AF7A] to-[#C19A6B] opacity-80 group-hover:opacity-100 transition-opacity" />
              <div className="relative bg-[#0A0118] rounded-2xl px-8 py-4 group-hover:bg-opacity-80 transition-all">
                <span className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-[#E8C4A0] to-[#C19A6B]">
                  {isRunning ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin">⏳</span>
                      Analyzing with Gemini...
                    </span>
                  ) : (
                    '🚀 Run Campaign Analysis'
                  )}
                </span>
              </div>
            </button>
            
            {/* Result Display */}
            <div className={`p-6 rounded-2xl border transition-all duration-300 ${
              isSuccess 
                ? 'bg-emerald-500/10 border-emerald-400/30' 
                : result.includes('Error') || result.includes('FETCH ERROR')
                ? 'bg-red-500/10 border-red-400/30'
                : 'bg-white/5 border-[#E8C4A0]/20'
            }`}>
              <h3 className="text-lg font-semibold text-[#E8C4A0] mb-3">Result:</h3>
              <pre className="text-[#E8C4A0]/80 text-xs leading-relaxed whitespace-pre-wrap font-mono overflow-x-auto">
                {result || '⏸️ No result yet. Click "Run Campaign Analysis" to start.'}
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}