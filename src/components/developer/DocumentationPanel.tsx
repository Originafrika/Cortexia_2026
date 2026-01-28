/**
 * DOCUMENTATION PANEL - Developer Dashboard
 * 
 * Quick access to API documentation
 * Features:
 * - Endpoint references
 * - Code examples
 * - Authentication guide
 * - Rate limiting info
 * - SDKs and libraries
 * 
 * BDS Compliant: Light theme + warm cream palette
 */

import { useState } from 'react';
import { Book, Code, Key, Zap, ExternalLink, Copy, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner@2.0.3';

const API_ENDPOINTS = [
  {
    method: 'POST',
    path: '/v1/generate/image',
    description: 'Generate an image from a text prompt',
    params: ['prompt', 'style', 'resolution'],
  },
  {
    method: 'POST',
    path: '/v1/generate/video',
    description: 'Generate a video from a text prompt',
    params: ['prompt', 'duration', 'fps'],
  },
  {
    method: 'GET',
    path: '/v1/generations/:id',
    description: 'Get generation status and result',
    params: ['id'],
  },
  {
    method: 'GET',
    path: '/v1/credits',
    description: 'Get credit balance and usage',
    params: [],
  },
];

const CODE_EXAMPLES = {
  curl: `curl -X POST https://api.cortexia.ai/v1/generate/image \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "A beautiful sunset over mountains",
    "style": "photorealistic",
    "resolution": "1024x1024"
  }'`,
  javascript: `const response = await fetch('https://api.cortexia.ai/v1/generate/image', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    prompt: 'A beautiful sunset over mountains',
    style: 'photorealistic',
    resolution: '1024x1024'
  })
});

const data = await response.json();
console.log(data);`,
  python: `import requests

url = 'https://api.cortexia.ai/v1/generate/image'
headers = {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
}
data = {
    'prompt': 'A beautiful sunset over mountains',
    'style': 'photorealistic',
    'resolution': '1024x1024'
}

response = requests.post(url, headers=headers, json=data)
result = response.json()
print(result)`,
  node: `const axios = require('axios');

const options = {
  method: 'POST',
  url: 'https://api.cortexia.ai/v1/generate/image',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  data: {
    prompt: 'A beautiful sunset over mountains',
    style: 'photorealistic',
    resolution: '1024x1024'
  }
};

axios(options)
  .then(response => console.log(response.data))
  .catch(error => console.error(error));`
};

export function DocumentationPanel() {
  const [selectedLanguage, setSelectedLanguage] = useState<keyof typeof CODE_EXAMPLES>('curl');
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    toast.success('Code copied to clipboard!');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'GET': return 'bg-blue-100 text-blue-700';
      case 'POST': return 'bg-green-100 text-green-700';
      case 'PUT': return 'bg-amber-100 text-amber-700';
      case 'DELETE': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">API Documentation</h2>
        <p className="text-sm text-gray-600">
          Quick reference guide for integrating Cortexia API
        </p>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.a
          href="#"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4 p-6 bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 rounded-2xl hover:shadow-lg transition-all duration-200 group"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Book size={24} className="text-blue-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">Full Documentation</h3>
            <p className="text-sm text-gray-600">Complete API reference and guides</p>
          </div>
          <ExternalLink size={20} className="text-gray-400 group-hover:text-blue-600 transition-colors" />
        </motion.a>

        <motion.a
          href="#"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-4 p-6 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-2xl hover:shadow-lg transition-all duration-200 group"
        >
          <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Code size={24} className="text-green-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">Code Examples</h3>
            <p className="text-sm text-gray-600">Sample code in multiple languages</p>
          </div>
          <ExternalLink size={20} className="text-gray-400 group-hover:text-green-600 transition-colors" />
        </motion.a>
      </div>

      {/* Quick Start */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-cream-100"
      >
        <div className="flex items-center gap-2 mb-4">
          <Zap size={20} className="text-amber-600" />
          <h3 className="font-semibold text-gray-900">Quick Start</h3>
        </div>

        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
              1
            </div>
            <div>
              <p className="font-medium text-gray-900">Get your API key</p>
              <p className="text-sm text-gray-600">Create an API key from the "API Keys" tab</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
              2
            </div>
            <div>
              <p className="font-medium text-gray-900">Make your first request</p>
              <p className="text-sm text-gray-600">Use the code examples below to get started</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-sm font-bold flex-shrink-0">
              3
            </div>
            <div>
              <p className="font-medium text-gray-900">Monitor usage</p>
              <p className="text-sm text-gray-600">Track your API calls in the "Usage & Stats" tab</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Authentication */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-cream-100"
      >
        <div className="flex items-center gap-2 mb-4">
          <Key size={20} className="text-purple-600" />
          <h3 className="font-semibold text-gray-900">Authentication</h3>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          All API requests must include your API key in the Authorization header:
        </p>

        <div className="relative">
          <pre className="bg-gray-900 text-gray-100 p-4 rounded-xl overflow-x-auto text-sm">
            <code>Authorization: Bearer YOUR_API_KEY</code>
          </pre>
        </div>

        <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="flex items-start gap-3">
            <AlertCircle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-amber-800">
              <strong>Important:</strong> Keep your API keys secure and never expose them in client-side code or public repositories.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Code Examples */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-cream-100"
      >
        <h3 className="font-semibold text-gray-900 mb-4">Code Examples</h3>

        {/* Language Selector */}
        <div className="flex items-center gap-2 mb-4 overflow-x-auto pb-2">
          {Object.keys(CODE_EXAMPLES).map((lang) => (
            <button
              key={lang}
              onClick={() => setSelectedLanguage(lang as keyof typeof CODE_EXAMPLES)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                selectedLanguage === lang
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {lang === 'curl' ? 'cURL' : 
               lang === 'javascript' ? 'JavaScript' :
               lang === 'python' ? 'Python' : 'Node.js'}
            </button>
          ))}
        </div>

        {/* Code Block */}
        <div className="relative">
          <pre className="bg-gray-900 text-gray-100 p-6 rounded-xl overflow-x-auto text-sm">
            <code>{CODE_EXAMPLES[selectedLanguage]}</code>
          </pre>
          <button
            onClick={() => handleCopyCode(CODE_EXAMPLES[selectedLanguage])}
            className="absolute top-4 right-4 p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            title="Copy code"
          >
            {copiedCode ? (
              <CheckCircle size={18} className="text-green-400" />
            ) : (
              <Copy size={18} className="text-gray-400" />
            )}
          </button>
        </div>
      </motion.div>

      {/* API Endpoints */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-2xl shadow-sm border border-cream-100 overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-cream-100">
          <h3 className="font-semibold text-gray-900">API Endpoints</h3>
        </div>

        <div className="divide-y divide-cream-100">
          {API_ENDPOINTS.map((endpoint, index) => (
            <div key={index} className="p-6 hover:bg-cream-50 transition-colors">
              <div className="flex items-start gap-4 mb-2">
                <span className={`px-3 py-1 rounded-lg text-xs font-bold ${getMethodColor(endpoint.method)}`}>
                  {endpoint.method}
                </span>
                <code className="flex-1 text-sm font-mono text-gray-900">
                  {endpoint.path}
                </code>
              </div>
              <p className="text-sm text-gray-600 mb-3 pl-20">
                {endpoint.description}
              </p>
              {endpoint.params.length > 0 && (
                <div className="pl-20">
                  <p className="text-xs font-medium text-gray-500 mb-2">Parameters:</p>
                  <div className="flex flex-wrap gap-2">
                    {endpoint.params.map((param) => (
                      <code key={param} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                        {param}
                      </code>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Rate Limiting */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-cream-100"
      >
        <div className="flex items-center gap-2 mb-4">
          <Zap size={20} className="text-amber-600" />
          <h3 className="font-semibold text-gray-900">Rate Limiting</h3>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-3">
              API requests are rate-limited based on your plan:
            </p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                <span><strong>Developer:</strong> 100 requests/minute</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-600" />
                <span><strong>Enterprise:</strong> 1000 requests/minute</span>
              </li>
            </ul>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <p className="text-sm text-blue-800">
              <strong>Tip:</strong> Check the <code className="px-2 py-0.5 bg-blue-100 rounded">X-RateLimit-Remaining</code> header to monitor your usage.
            </p>
          </div>
        </div>
      </motion.div>

      {/* SDKs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-cream-100"
      >
        <h3 className="font-semibold text-gray-900 mb-4">Official SDKs</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {['JavaScript', 'Python', 'PHP'].map((sdk) => (
            <a
              key={sdk}
              href="#"
              className="flex items-center gap-3 p-4 border border-cream-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all group"
            >
              <Code size={20} className="text-gray-600 group-hover:text-blue-600 transition-colors" />
              <div className="flex-1">
                <p className="font-medium text-gray-900">{sdk} SDK</p>
                <p className="text-xs text-gray-500">npm install cortexia</p>
              </div>
              <ExternalLink size={16} className="text-gray-400 group-hover:text-blue-600 transition-colors" />
            </a>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
