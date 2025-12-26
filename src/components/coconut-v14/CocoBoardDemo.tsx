/**
 * COCONUT V14 - COCOBOARD DEMO PAGE
 * Phase 3 - Jour 3: Demo page for testing CocoBoard UI
 */

import React, { useState } from 'react';
import { CocoBoard } from './CocoBoard';
import { ArrowLeft } from 'lucide-react';

interface CocoBoardDemoProps {
  onNavigate?: (screen: any) => void;
}

export function CocoBoardDemo({ onNavigate }: CocoBoardDemoProps) {
  const [showDemo, setShowDemo] = useState(false);

  // Demo data
  const DEMO_USER_ID = 'demo-user-123';
  const DEMO_PROJECT_ID = 'demo-project-456';

  if (!showDemo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h1 className="text-3xl mb-2 text-slate-900">Coconut V14 CocoBoard</h1>
            <p className="text-slate-600">Phase 3 - Jour 3: UI Structure Demo</p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h3 className="text-sm text-blue-900 mb-1">✅ Completed</h3>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• CocoBoard main component</li>
                <li>• Header with Save/Validate/Generate actions</li>
                <li>• Zustand state management</li>
                <li>• API integration hooks</li>
                <li>• Loading & error states</li>
              </ul>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <h3 className="text-sm text-amber-900 mb-1">⚠️ Note</h3>
              <p className="text-sm text-amber-700">
                This is a demo interface. To see the full CocoBoard, you need:
              </p>
              <ul className="text-sm text-amber-700 mt-2 space-y-1">
                <li>• A valid project with analysis completed</li>
                <li>• Backend API running</li>
                <li>• CocoBoard data in database</li>
              </ul>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => setShowDemo(true)}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-4 rounded-xl transition-all shadow-lg shadow-purple-500/30"
            >
              Launch CocoBoard Demo
            </button>

            <button
              onClick={() => window.location.href = '/'}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 py-4 rounded-xl transition-colors"
            >
              Back to Dashboard
            </button>
          </div>

          <div className="mt-8 pt-8 border-t border-slate-200">
            <div className="text-sm text-slate-600 space-y-2">
              <div className="flex items-center justify-between">
                <span>Phase:</span>
                <span className="font-medium text-slate-900">3 - Generation</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Day:</span>
                <span className="font-medium text-slate-900">3/7 - CocoBoard UI</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Status:</span>
                <span className="font-medium text-green-600">In Progress</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Back button */}
      <div className="fixed top-4 left-4 z-50">
        <button
          onClick={() => setShowDemo(false)}
          className="flex items-center space-x-2 bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-xl shadow-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Info</span>
        </button>
      </div>

      {/* CocoBoard Component */}
      <CocoBoard
        projectId={DEMO_PROJECT_ID}
        userId={DEMO_USER_ID}
      />
    </div>
  );
}