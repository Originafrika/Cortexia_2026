import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, ArrowLeft, Sparkles, Palette, Zap, Check, Upload, Building2, Code, User, Award, TrendingUp, DollarSign, Star, Copy, Gift } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { useAuth } from '../../lib/contexts/AuthContext'; // ✅ NEW: Import useAuth
import { AcquisitionSourceStep } from './AcquisitionSourceStep'; // ✅ NEW: Import acquisition source step

interface OnboardingFlowProps {
  userType: 'individual' | 'enterprise' | 'developer';
  onComplete: () => void;
}

export function OnboardingFlow({ userType, onComplete }: OnboardingFlowProps) {
  const { completeOnboarding } = useAuth(); // ✅ NEW: Get completeOnboarding
  const [currentStep, setCurrentStep] = useState(0);
  const [preferences, setPreferences] = useState({
    // Common
    styles: [] as string[],
    goals: [] as string[],
    
    // Individual
    creatorType: '' as string, // photographer, designer, marketer, hobbyist, etc.
    experienceLevel: '' as string, // beginner, intermediate, pro
    contentFrequency: '' as string, // daily, weekly, monthly, occasional
    creatorOptIn: false as boolean,
    
    // Enterprise
    companyName: '' as string,
    industry: '' as string, // tech, retail, agency, etc.
    teamSize: '' as string, // 1-10, 11-50, 51-200, 201+
    role: '' as string, // marketing manager, creative director, etc.
    painPoints: [] as string[], // slow turnaround, high costs, lack of consistency, etc.
    currentTools: [] as string[], // photoshop, canva, midjourney, etc.
    monthlyBudget: '' as string, // <1k, 1k-5k, 5k-20k, 20k+
    companyLogo: null as string | null,
    brandColors: [] as string[],
    autoBrandGuidelines: true as boolean, // ✅ NEW: Auto-apply brand guidelines (default: true)
    acquisitionSource: '' as string, // ✅ NEW: How did you hear about us?
    
    // Developer
    productType: '' as string, // saas, ecommerce, mobile app, etc.
    useCase: '' as string, // user avatars, product images, marketing content, etc.
    techStack: [] as string[], // react, python, nodejs, etc.
    expectedVolume: '' as string, // <1k, 1k-10k, 10k-100k, 100k+
  });

  // Individual steps
  const individualSteps = [
    {
      title: 'Welcome to Cortexia',
      subtitle: 'Your AI creative companion',
      component: <WelcomeStep userType={userType} />,
    },
    {
      title: 'What brings you here?',
      subtitle: 'Help us personalize your experience',
      component: (
        <GoalsStep
          goals={preferences.goals}
          onChange={(goals) => setPreferences({ ...preferences, goals })}
        />
      ),
    },
    {
      title: 'Choose your style',
      subtitle: 'Select your preferred aesthetics',
      component: (
        <StyleStep
          styles={preferences.styles}
          onChange={(styles) => setPreferences({ ...preferences, styles })}
        />
      ),
    },
    {
      title: 'Become a Creator?',
      subtitle: 'Unlock Coconut and earn credits',
      component: (
        <CreatorOptInStep
          optIn={preferences.creatorOptIn || false}
          onChange={(optIn) => setPreferences({ ...preferences, creatorOptIn: optIn })}
        />
      ),
    },
    {
      title: 'You\'re all set!',
      subtitle: '25 free credits to start creating',
      component: <CompletionStep userType={userType} creatorOptIn={preferences.creatorOptIn} />,
    },
  ];

  // Enterprise steps
  const enterpriseSteps = [
    {
      title: 'Welcome to the fluid state',
      subtitle: 'Where campaigns launch at the speed of thought',
      component: <WelcomeStep userType={userType} />,
    },
    {
      title: 'Tell us about you',
      subtitle: 'So we can tailor your experience',
      component: (
        <EnterpriseProfileStep
          companyName={preferences.companyName}
          industry={preferences.industry}
          teamSize={preferences.teamSize}
          role={preferences.role}
          onChange={(data) => setPreferences({ ...preferences, ...data })}
        />
      ),
    },
    {
      title: 'What keeps you up at night?',
      subtitle: 'The challenges we\'ll help you solve',
      component: (
        <PainPointsStep
          painPoints={preferences.painPoints}
          onChange={(painPoints) => setPreferences({ ...preferences, painPoints })}
        />
      ),
    },
    {
      title: 'Your creative workflow today',
      subtitle: 'Let\'s understand your current process',
      component: (
        <CurrentToolsStep
          currentTools={preferences.currentTools}
          monthlyBudget={preferences.monthlyBudget}
          onChange={(data) => setPreferences({ ...preferences, ...data })}
        />
      ),
    },
    {
      title: 'Make it yours',
      subtitle: 'Your brand, perfectly consistent',
      component: (
        <BrandSetupStep
          logo={preferences.companyLogo}
          colors={preferences.brandColors}
          onChange={(data) => setPreferences({ ...preferences, ...data })}
        />
      ),
    },
    {
      title: 'How did you hear about us?',
      subtitle: 'Help us improve our reach',
      component: (
        <AcquisitionSourceStep
          acquisitionSource={preferences.acquisitionSource}
          onChange={(acquisitionSource) => setPreferences({ ...preferences, acquisitionSource })}
        />
      ),
    },
    {
      title: 'You\'re ready',
      subtitle: 'Brief at 9. Campaign by lunch.',
      component: <CompletionStep userType={userType} />,
    },
  ];

  // Developer steps
  const developerSteps = [
    {
      title: 'Welcome Developer',
      subtitle: 'API-first creative platform',
      component: <WelcomeStep userType={userType} />,
    },
    {
      title: 'Your use case',
      subtitle: 'What will you build?',
      component: (
        <GoalsStep
          goals={preferences.goals}
          onChange={(goals) => setPreferences({ ...preferences, goals })}
          isDeveloper
        />
      ),
    },
    {
      title: 'API Key generated',
      subtitle: 'Start integrating Cortexia',
      component: <APIKeyStep />,
    },
  ];

  const steps = userType === 'individual' ? individualSteps : userType === 'enterprise' ? enterpriseSteps : developerSteps;
  const isLastStep = currentStep === steps.length - 1;

  const handleNext = async () => { // ✅ Make async
    if (isLastStep) {
      toast.success('Onboarding complete!');
      
      // ✅ Save ALL onboarding data to user profile in KV store
      await completeOnboarding({
        // Common data
        styles: preferences.styles,
        goals: preferences.goals,
        
        // Individual-specific data
        ...(userType === 'individual' && {
          creatorType: preferences.creatorType,
          experienceLevel: preferences.experienceLevel,
          contentFrequency: preferences.contentFrequency,
          creatorOptIn: preferences.creatorOptIn,
        }),
        
        // Enterprise-specific data
        ...(userType === 'enterprise' && {
          companyName: preferences.companyName,
          industry: preferences.industry,
          teamSize: preferences.teamSize,
          role: preferences.role,
          painPoints: preferences.painPoints,
          currentTools: preferences.currentTools,
          monthlyBudget: preferences.monthlyBudget,
          companyLogo: preferences.companyLogo,
          brandColors: preferences.brandColors,
          autoBrandGuidelines: preferences.autoBrandGuidelines,
          acquisitionSource: preferences.acquisitionSource,
        }),
        
        // Developer-specific data
        ...(userType === 'developer' && {
          productType: preferences.productType,
          useCase: preferences.useCase,
          techStack: preferences.techStack,
          expectedVolume: preferences.expectedVolume,
        }),
      });
      
      onComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[#F5EBE0]/5 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#E3D5CA]/5 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="w-full max-w-3xl relative">
        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-white/60">Step {currentStep + 1} of {steps.length}</span>
            <span className="text-sm text-white/60">{Math.round(((currentStep + 1) / steps.length) * 100)}%</span>
          </div>
          <div className="h-2 rounded-full bg-white/5 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#F5EBE0] to-[#E3D5CA]"
              initial={{ width: '0%' }}
              animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
            />
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.4 }}
          >
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl mb-3">{steps[currentStep].title}</h1>
              <p className="text-xl text-white/60">{steps[currentStep].subtitle}</p>
            </div>

            <div className="mb-12">
              {steps[currentStep].component}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className="px-6 py-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 transition-all hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>

          <button
            onClick={handleNext}
            className="px-8 py-3 rounded-xl bg-gradient-to-br from-[#F5EBE0] to-[#E3D5CA] text-black transition-all hover:shadow-xl hover:shadow-[#F5EBE0]/30 hover:scale-105 flex items-center gap-2"
          >
            <span>{isLastStep ? 'Get Started' : 'Continue'}</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

// Welcome Step Component
function WelcomeStep({ userType }: { userType: 'individual' | 'enterprise' | 'developer' }) {
  const content = {
    individual: {
      icon: User,
      title: 'Create Amazing Content',
      features: [
        'Simple creation mode',
        'Access community feed',
        '25 free credits every month',
        'Share & download without watermark',
      ],
    },
    enterprise: {
      icon: Building2,
      title: 'Professional Production Suite',
      features: [
        'Full Coconut V14 orchestration access',
        'AI Creative Director for campaigns',
        'Multi-channel content generation',
        'Priority support & enterprise features',
      ],
    },
    developer: {
      icon: Code,
      title: 'Build with AI Creative API',
      features: [
        'Full REST API access',
        'Webhooks & real-time updates',
        '100 credits to start',
        'Flexible credit packages + referral bonus',
      ],
    },
  };

  const data = content[userType];
  const Icon = data.icon;

  return (
    <div className="max-w-xl mx-auto">
      <div className="p-12 rounded-3xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10">
        <div className="flex justify-center mb-8">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#F5EBE0]/20 to-[#E3D5CA]/20 flex items-center justify-center">
            <Icon className="text-[#F5EBE0]" size={40} />
          </div>
        </div>

        <h3 className="text-2xl text-center mb-8">{data.title}</h3>

        <ul className="space-y-4">
          {data.features.map((feature, idx) => (
            <motion.li
              key={idx}
              className="flex items-center gap-3 text-white/80"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: idx * 0.1 }}
            >
              <div className="w-8 h-8 rounded-lg bg-[#F5EBE0]/20 flex items-center justify-center flex-shrink-0">
                <Check className="text-[#F5EBE0]" size={16} />
              </div>
              <span>{feature}</span>
            </motion.li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// Goals Step Component
function GoalsStep({ 
  goals, 
  onChange, 
  isEnterprise = false,
  isDeveloper = false,
}: { 
  goals: string[]; 
  onChange: (goals: string[]) => void;
  isEnterprise?: boolean;
  isDeveloper?: boolean;
}) {
  const options = isDeveloper
    ? [
        { id: 'integration', label: 'Product Integration', icon: Code },
        { id: 'automation', label: 'Workflow Automation', icon: Zap },
        { id: 'prototyping', label: 'Rapid Prototyping', icon: Sparkles },
      ]
    : isEnterprise
    ? [
        { id: 'marketing', label: 'Marketing Campaigns', icon: Sparkles },
        { id: 'advertising', label: 'Advertising Production', icon: Zap },
        { id: 'social', label: 'Social Media Content', icon: Palette },
        { id: 'branding', label: 'Brand Development', icon: Building2 },
      ]
    : [
        { id: 'explore', label: 'Explore & Discover', icon: Sparkles },
        { id: 'personal', label: 'Personal Projects', icon: Palette },
        { id: 'learning', label: 'Learn AI Creation', icon: Zap },
      ];

  const toggleGoal = (id: string) => {
    if (goals.includes(id)) {
      onChange(goals.filter(g => g !== id));
    } else {
      onChange([...goals, id]);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
      {options.map((option, idx) => {
        const isSelected = goals.includes(option.id);
        const Icon = option.icon;

        return (
          <motion.button
            key={option.id}
            onClick={() => toggleGoal(option.id)}
            className={`p-6 rounded-2xl backdrop-blur-sm border transition-all ${
              isSelected
                ? 'bg-gradient-to-br from-[#F5EBE0]/20 to-[#E3D5CA]/20 border-[#F5EBE0]/50'
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                isSelected ? 'bg-[#F5EBE0]/30' : 'bg-white/10'
              }`}>
                <Icon className={isSelected ? 'text-[#F5EBE0]' : 'text-white/60'} size={24} />
              </div>
              <span className="text-left">{option.label}</span>
            </div>

            {isSelected && (
              <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-[#F5EBE0] flex items-center justify-center">
                <Check size={14} className="text-black" />
              </div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

// Style Step Component
function StyleStep({ styles, onChange }: { styles: string[]; onChange: (styles: string[]) => void }) {
  const styleOptions = [
    { id: 'modern', label: 'Modern', gradient: 'from-blue-500/20 to-cyan-500/20' },
    { id: 'vintage', label: 'Vintage', gradient: 'from-amber-500/20 to-orange-500/20' },
    { id: 'minimal', label: 'Minimal', gradient: 'from-gray-500/20 to-slate-500/20' },
    { id: 'bold', label: 'Bold', gradient: 'from-pink-500/20 to-purple-500/20' },
    { id: 'natural', label: 'Natural', gradient: 'from-green-500/20 to-emerald-500/20' },
    { id: 'abstract', label: 'Abstract', gradient: 'from-violet-500/20 to-fuchsia-500/20' },
  ];

  const toggleStyle = (id: string) => {
    if (styles.includes(id)) {
      onChange(styles.filter(s => s !== id));
    } else {
      onChange([...styles, id]);
    }
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
      {styleOptions.map((style, idx) => {
        const isSelected = styles.includes(style.id);

        return (
          <motion.button
            key={style.id}
            onClick={() => toggleStyle(style.id)}
            className={`aspect-square p-6 rounded-2xl backdrop-blur-sm border transition-all ${
              isSelected
                ? 'bg-gradient-to-br from-[#F5EBE0]/20 to-[#E3D5CA]/20 border-[#F5EBE0]/50'
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: idx * 0.05 }}
            whileHover={{ scale: 1.05 }}
          >
            <div className={`w-full h-full rounded-xl bg-gradient-to-br ${style.gradient} flex items-center justify-center relative`}>
              <span>{style.label}</span>
              {isSelected && (
                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[#F5EBE0] flex items-center justify-center">
                  <Check size={14} className="text-black" />
                </div>
              )}
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}

// Brand Setup Step Component
function BrandSetupStep({ 
  logo, 
  colors, 
  onChange 
}: { 
  logo: string | null; 
  colors: string[]; 
  onChange: (data: { companyLogo?: string | null; brandColors?: string[]; autoBrandGuidelines?: boolean }) => void;
}) {
  const [autoApply, setAutoApply] = useState(true); // Default: ON

  const handleLogoUpload = () => {
    // Simulated file upload
    toast.success('Logo uploaded successfully!');
    onChange({ companyLogo: 'mock-logo-url' });
  };

  const handleToggleAutoApply = () => {
    const newValue = !autoApply;
    setAutoApply(newValue);
    onChange({ autoBrandGuidelines: newValue });
  };

  return (
    <div className="max-w-xl mx-auto space-y-6">
      {/* Logo Upload */}
      <div>
        <label className="block text-sm text-white/60 mb-3">Company Logo</label>
        <button
          onClick={handleLogoUpload}
          className="w-full p-12 rounded-2xl bg-white/5 backdrop-blur-sm border-2 border-dashed border-white/20 transition-all hover:bg-white/10 hover:border-[#F5EBE0]/50"
        >
          {logo ? (
            <div className="flex items-center justify-center gap-3">
              <Check className="text-[#F5EBE0]" size={24} />
              <span className="text-[#F5EBE0]">Logo uploaded</span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <Upload className="text-white/40" size={32} />
              <span className="text-white/60">Click to upload logo</span>
              <span className="text-xs text-white/40">PNG, JPG or SVG • Max 5MB</span>
            </div>
          )}
        </button>
      </div>

      {/* Brand Colors (Optional) */}
      <div>
        <label className="block text-sm text-white/60 mb-3">Brand Colors (Optional)</label>
        <div className="p-6 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10">
          <p className="text-sm text-white/60 text-center">
            We'll detect colors from your logo automatically
          </p>
        </div>
      </div>

      {/* ✅ NEW: Auto-Apply Brand Guidelines Toggle */}
      <div className="mt-8 pt-6 border-t border-white/10">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <h4 className="text-base mb-2">Apply brand guidelines automatically</h4>
            <p className="text-sm text-white/60">
              {autoApply 
                ? 'Your logo and colors will be included in all Coconut generations'
                : 'You can specify brand details per project (recommended for agencies)'}
            </p>
          </div>
          
          <button
            onClick={handleToggleAutoApply}
            className={`relative w-14 h-8 rounded-full transition-all ${
              autoApply 
                ? 'bg-gradient-to-r from-[#F5EBE0] to-[#E3D5CA]' 
                : 'bg-white/20'
            }`}
          >
            <motion.div
              className="absolute top-1 left-1 w-6 h-6 rounded-full bg-white shadow-lg"
              animate={{ x: autoApply ? 24 : 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
            />
          </button>
        </div>

        {/* Info box */}
        <motion.div
          className={`mt-4 p-4 rounded-xl border transition-all ${
            autoApply
              ? 'bg-[#F5EBE0]/10 border-[#F5EBE0]/20'
              : 'bg-blue-500/10 border-blue-500/20'
          }`}
          key={autoApply ? 'on' : 'off'}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">
              {autoApply ? (
                <Check className="text-[#F5EBE0]" size={18} />
              ) : (
                <Building2 className="text-blue-400" size={18} />
              )}
            </div>
            <div className="text-xs text-white/70">
              {autoApply ? (
                <>
                  <strong className="text-white">Recommended for single-brand companies.</strong> Every Coconut project will automatically include your brand assets for consistent results.
                </>
              ) : (
                <>
                  <strong className="text-white">Perfect for agencies.</strong> You can manually specify brand details for each client project in the CocoBoard.
                </>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// API Key Step Component
function APIKeyStep() {
  const apiKey = 'ctx_live_' + Math.random().toString(36).substring(2, 15);

  const handleCopy = () => {
    navigator.clipboard.writeText(apiKey);
    toast.success('API key copied to clipboard!');
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="p-8 rounded-2xl bg-gradient-to-br from-[#F5EBE0]/10 to-[#E3D5CA]/10 backdrop-blur-sm border border-[#F5EBE0]/20">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-[#F5EBE0]/20 flex items-center justify-center">
            <Code className="text-[#F5EBE0]" size={24} />
          </div>
          <div>
            <h3 className="text-lg">Your API Key</h3>
            <p className="text-sm text-white/60">Keep this secure</p>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-black/40 border border-white/10 mb-4">
          <code className="text-sm text-[#F5EBE0] break-all">{apiKey}</code>
        </div>

        <button
          onClick={handleCopy}
          className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 transition-all hover:bg-white/20"
        >
          Copy to Clipboard
        </button>

        <div className="mt-6 pt-6 border-t border-white/10">
          <p className="text-sm text-white/60 mb-3">Quick links:</p>
          <ul className="space-y-2 text-sm">
            <li>
              <a href="#" className="text-[#F5EBE0] hover:underline">📚 API Documentation</a>
            </li>
            <li>
              <a href="#" className="text-[#F5EBE0] hover:underline">🔧 Code Examples</a>
            </li>
            <li>
              <a href="#" className="text-[#F5EBE0] hover:underline">💬 Developer Discord</a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// Completion Step Component
function CompletionStep({ userType, creatorOptIn }: { userType: 'individual' | 'enterprise' | 'developer'; creatorOptIn?: boolean }) {
  const [referralCode, setReferralCode] = useState<string | null>(null);
  
  // ✅ Get referral code from sessionStorage
  useState(() => {
    const code = sessionStorage.getItem('cortexia_referral_code');
    if (code) {
      setReferralCode(code);
    }
  });

  const handleCopyReferralCode = () => {
    if (referralCode) {
      navigator.clipboard.writeText(referralCode);
      toast.success('Referral code copied to clipboard!');
    }
  };

  const content = {
    individual: {
      credits: '25 free credits',
      message: 'Start creating amazing content',
    },
    enterprise: {
      credits: 'Coconut access activated',
      message: 'Your workspace is ready',
    },
    developer: {
      credits: '100 credits activated',
      message: 'Start building with Cortexia',
    },
  };

  const data = content[userType];

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="w-24 h-24 rounded-full bg-gradient-to-br from-[#F5EBE0] to-[#E3D5CA] flex items-center justify-center mx-auto mb-8"
        >
          <Check size={48} className="text-black" />
        </motion.div>

        <h3 className="text-3xl mb-4">{data.message}</h3>
        <p className="text-xl text-white/60 mb-2">{data.credits} activated</p>
        
        {userType === 'individual' && creatorOptIn && (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 text-sm mt-2">
            <Award size={14} />
            <span>Creator mode enabled</span>
          </div>
        )}
      </div>

      {/* Individual - Show next steps based on choice */}
      {userType === 'individual' && (
        <div className="space-y-4 mb-8">
          {creatorOptIn ? (
            <motion.div
              className="p-6 rounded-2xl bg-gradient-to-br from-[#F5EBE0]/10 to-[#E3D5CA]/10 border border-[#F5EBE0]/20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <h4 className="text-lg mb-4 flex items-center gap-2">
                <TrendingUp className="text-[#F5EBE0]" size={20} />
                <span>Your Creator Journey</span>
              </h4>
              <div className="space-y-3 text-sm text-white/80">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-[#F5EBE0]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs text-[#F5EBE0]">1</span>
                  </div>
                  <div>
                    <p className="text-white mb-1">Generate 60 creations this month</p>
                    <p className="text-xs text-white/60">Use Simple mode to create images, videos, and avatars</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-[#F5EBE0]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs text-[#F5EBE0]">2</span>
                  </div>
                  <div>
                    <p className="text-white mb-1">Publish 5 posts with 5+ likes each</p>
                    <p className="text-xs text-white/60">Share your best work in the community feed</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-lg bg-[#F5EBE0]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs text-[#F5EBE0]">3</span>
                  </div>
                  <div>
                    <p className="text-white mb-1">Unlock Creator Benefits</p>
                    <p className="text-xs text-white/60">3 Coconut generations/month • 10-15% referral commissions • Watermark-free downloads</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              className="p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <h4 className="text-lg mb-4 flex items-center gap-2">
                <Sparkles className="text-blue-400" size={20} />
                <span>What's Next</span>
              </h4>
              <div className="space-y-3 text-sm text-white/80">
                <div className="flex items-center gap-3">
                  <Check size={16} className="text-blue-400" />
                  <span>Explore Simple mode creation tools</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check size={16} className="text-blue-400" />
                  <span>Browse the community feed for inspiration</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check size={16} className="text-blue-400" />
                  <span>Generate your first AI creation</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-xs text-white/60">
                  💡 Want to unlock Coconut later? You can always join the Creator program from your profile.
                </p>
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* Enterprise - Show Coconut capabilities */}
      {userType === 'enterprise' && (
        <motion.div
          className="p-6 rounded-2xl bg-gradient-to-br from-[#F5EBE0]/10 to-[#E3D5CA]/10 border border-[#F5EBE0]/20 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h4 className="text-lg mb-4">Your Coconut Workspace</h4>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
              <div className="text-xl mb-1">✨</div>
              <div className="text-white/80">Image Mode</div>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
              <div className="text-xl mb-1">🎬</div>
              <div className="text-white/80">Video Mode</div>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
              <div className="text-xl mb-1">🚀</div>
              <div className="text-white/80">Campaign Mode</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Developer - Show API resources */}
      {userType === 'developer' && (
        <motion.div
          className="p-6 rounded-2xl bg-gradient-to-br from-[#F5EBE0]/10 to-[#E3D5CA]/10 border border-[#F5EBE0]/20 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h4 className="text-lg mb-4">Resources</h4>
          <div className="space-y-2 text-sm">
            <a href="#" className="flex items-center gap-2 text-[#F5EBE0] hover:underline">
              <Code size={16} />
              <span>API Documentation</span>
            </a>
            <a href="#" className="flex items-center gap-2 text-[#F5EBE0] hover:underline">
              <Zap size={16} />
              <span>Quick Start Guide</span>
            </a>
            <a href="#" className="flex items-center gap-2 text-[#F5EBE0] hover:underline">
              <Sparkles size={16} />
              <span>Code Examples</span>
            </a>
          </div>
        </motion.div>
      )}

      {/* ✅ Referral Code Section - Show for all user types */}
      {referralCode && userType === 'individual' && (
        <motion.div
          className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-violet-500/10 border border-purple-500/20 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <h4 className="text-lg mb-4 flex items-center gap-2">
            <Gift className="text-purple-400" size={20} />
            <span>Your Referral Code</span>
          </h4>
          <p className="text-sm text-white/60 mb-4">
            Share this code with friends! They'll get bonus credits, and you'll earn rewards when they sign up.
          </p>
          
          <div className="flex gap-3">
            <div className="flex-1 p-4 rounded-xl bg-black/40 border border-purple-500/30 flex items-center justify-center">
              <code className="text-2xl font-bold text-purple-400 tracking-wider">{referralCode}</code>
            </div>
            <button
              onClick={handleCopyReferralCode}
              className="px-6 py-3 rounded-xl bg-purple-500/20 border border-purple-500/30 hover:bg-purple-500/30 transition-all flex items-center gap-2 text-purple-400"
            >
              <Copy size={18} />
              <span className="hidden sm:inline">Copy</span>
            </button>
          </div>

          <div className="mt-4 p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
            <p className="text-xs text-white/70">
              💡 <strong>How it works:</strong> When someone signs up with your code, they get 5 bonus credits and you earn 2 credits per successful referral!
            </p>
          </div>
        </motion.div>
      )}

      <div className="p-6 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/10 text-center">
        <p className="text-sm text-white/80">
          You're all set! Click "Get Started" to {userType === 'enterprise' ? 'open your Coconut workspace' : userType === 'developer' ? 'see your API dashboard' : 'begin creating'}.
        </p>
      </div>
    </div>
  );
}

// Creator Opt-In Step Component
function CreatorOptInStep({ optIn, onChange }: { optIn: boolean; onChange: (optIn: boolean) => void }) {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Option 1: Just Create (No opt-in) */}
        <motion.button
          onClick={() => onChange(false)}
          className={`p-8 rounded-3xl backdrop-blur-sm border transition-all text-left ${
            !optIn
              ? 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-blue-500/50'
              : 'bg-white/5 border-white/10 hover:bg-white/10'
          }`}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
          whileHover={{ scale: 1.02 }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              !optIn ? 'bg-blue-500/30' : 'bg-white/10'
            }`}>
              <Zap className={!optIn ? 'text-blue-400' : 'text-white/60'} size={24} />
            </div>
            <div>
              <h4 className="text-lg">Just Create</h4>
              <p className="text-xs text-white/60">Simple Mode</p>
            </div>
          </div>

          <ul className="space-y-3 text-sm">
            {[
              'Image & Video generation',
              'Avatar creation',
              'Community feed access',
              'Share & download',
              'No requirements',
            ].map((item, idx) => (
              <li key={idx} className="flex items-center gap-2 text-white/70">
                <Check size={14} className={!optIn ? 'text-blue-400' : 'text-white/40'} />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          {!optIn && (
            <div className="mt-6 pt-4 border-t border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-blue-400 flex items-center justify-center">
                  <Check size={12} className="text-black" />
                </div>
                <span className="text-sm text-blue-400">Selected</span>
              </div>
            </div>
          )}
        </motion.button>

        {/* Option 2: Become Creator (Opt-in) */}
        <motion.button
          onClick={() => onChange(true)}
          className={`p-8 rounded-3xl backdrop-blur-sm border transition-all text-left relative overflow-hidden ${
            optIn
              ? 'bg-gradient-to-br from-[#F5EBE0]/20 to-[#E3D5CA]/20 border-[#F5EBE0]/50'
              : 'bg-white/5 border-white/10 hover:bg-white/10'
          }`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          whileHover={{ scale: 1.02 }}
        >
          <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-green-500/20 text-green-400 text-xs">
            Unlock Coconut
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              optIn ? 'bg-[#F5EBE0]/30' : 'bg-white/10'
            }`}>
              <Award className={optIn ? 'text-[#F5EBE0]' : 'text-white/60'} size={24} />
            </div>
            <div>
              <h4 className="text-lg">Become Creator</h4>
              <p className="text-xs text-white/60">Earn & Unlock</p>
            </div>
          </div>

          <ul className="space-y-3 text-sm mb-6">
            {[
              'Everything in Simple +',
              'Unlock Coconut AI director',
              'Earn 2cr per download',
              'Top 10 = 10k free credits',
              'Creator Dashboard',
            ].map((item, idx) => (
              <li key={idx} className="flex items-center gap-2 text-white/70">
                <Check size={14} className={optIn ? 'text-[#F5EBE0]' : 'text-white/40'} />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          {/* Requirements Box */}
          <div className={`p-4 rounded-xl border ${
            optIn ? 'bg-[#F5EBE0]/10 border-[#F5EBE0]/20' : 'bg-white/5 border-white/10'
          }`}>
            <p className="text-xs text-white/60 mb-2">Monthly requirements:</p>
            <div className="space-y-1 text-xs text-white/80">
              <div className="flex items-center gap-2">
                <Star size={12} className={optIn ? 'text-[#F5EBE0]' : 'text-white/40'} />
                <span>Generate 60 creations</span>
              </div>
              <div className="flex items-center gap-2">
                <Star size={12} className={optIn ? 'text-[#F5EBE0]' : 'text-white/40'} />
                <span>Publish 5 posts (5+ likes each)</span>
              </div>
            </div>
          </div>

          {optIn && (
            <div className="mt-6 pt-4 border-t border-white/10">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-[#F5EBE0] flex items-center justify-center">
                  <Check size={12} className="text-black" />
                </div>
                <span className="text-sm text-[#F5EBE0]">Selected</span>
              </div>
            </div>
          )}
        </motion.button>
      </div>

      {/* Info Box */}
      <motion.div
        className="p-6 rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <div className="flex items-start gap-3">
          <TrendingUp className="text-green-400 flex-shrink-0 mt-0.5" size={20} />
          <div>
            <p className="text-sm text-white/80 mb-2">
              <strong>Pro tip:</strong> You can change this later. Start with Simple Mode and upgrade to Creator when you're ready!
            </p>
            <p className="text-xs text-white/60">
              Creators get access to Coconut's AI intelligence once they hit monthly requirements.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Enterprise Profile Step Component
function EnterpriseProfileStep({ 
  companyName, 
  industry, 
  teamSize, 
  role, 
  onChange 
}: { 
  companyName: string; 
  industry: string; 
  teamSize: string; 
  role: string; 
  onChange: (data: { companyName?: string; industry?: string; teamSize?: string; role?: string }) => void;
}) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange({ [name]: value } as any);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Company Name */}
      <div>
        <label className="block text-sm text-white/60 mb-3">Company Name</label>
        <input
          type="text"
          name="companyName"
          value={companyName}
          onChange={handleInputChange}
          className="w-full p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 transition-all hover:bg-white/10"
        />
      </div>

      {/* Industry */}
      <div>
        <label className="block text-sm text-white/60 mb-3">Industry</label>
        <input
          type="text"
          name="industry"
          value={industry}
          onChange={handleInputChange}
          className="w-full p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 transition-all hover:bg-white/10"
        />
      </div>

      {/* Team Size */}
      <div>
        <label className="block text-sm text-white/60 mb-3">Team Size</label>
        <input
          type="text"
          name="teamSize"
          value={teamSize}
          onChange={handleInputChange}
          className="w-full p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 transition-all hover:bg-white/10"
        />
      </div>

      {/* Role */}
      <div>
        <label className="block text-sm text-white/60 mb-3">Your Role</label>
        <input
          type="text"
          name="role"
          value={role}
          onChange={handleInputChange}
          className="w-full p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 transition-all hover:bg-white/10"
        />
      </div>
    </div>
  );
}

// Pain Points Step Component
function PainPointsStep({ 
  painPoints, 
  onChange 
}: { 
  painPoints: string[]; 
  onChange: (painPoints: string[]) => void;
}) {
  const options = [
    { id: 'slow_turnaround', label: 'Slow Turnaround Time' },
    { id: 'high_costs', label: 'High Costs' },
    { id: 'lack_of_consistency', label: 'Lack of Consistency' },
    { id: 'limited_resources', label: 'Limited Resources' },
    { id: 'complex_process', label: 'Complex Process' },
    { id: 'time_consumption', label: 'Time Consumption' },
    { id: 'quality_issues', label: 'Quality Issues' },
    { id: 'limited_creativity', label: 'Limited Creativity' },
    { id: 'technical_difficulties', label: 'Technical Difficulties' },
    { id: 'inconsistent_branding', label: 'Inconsistent Branding' },
  ];

  const togglePainPoint = (id: string) => {
    if (painPoints.includes(id)) {
      onChange(painPoints.filter(p => p !== id));
    } else {
      onChange([...painPoints, id]);
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
      {options.map((option, idx) => {
        const isSelected = painPoints.includes(option.id);

        return (
          <motion.button
            key={option.id}
            onClick={() => togglePainPoint(option.id)}
            className={`p-6 rounded-2xl backdrop-blur-sm border transition-all ${
              isSelected
                ? 'bg-gradient-to-br from-[#F5EBE0]/20 to-[#E3D5CA]/20 border-[#F5EBE0]/50'
                : 'bg-white/5 border-white/10 hover:bg-white/10'
            }`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
            whileHover={{ scale: 1.02 }}
          >
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                isSelected ? 'bg-[#F5EBE0]/30' : 'bg-white/10'
              }`}>
                <Sparkles className={isSelected ? 'text-[#F5EBE0]' : 'text-white/60'} size={24} />
              </div>
              <span className="text-left">{option.label}</span>
            </div>

            {isSelected && (
              <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-[#F5EBE0] flex items-center justify-center">
                <Check size={14} className="text-black" />
              </div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

// Current Tools Step Component
function CurrentToolsStep({ 
  currentTools, 
  monthlyBudget, 
  onChange 
}: { 
  currentTools: string[]; 
  monthlyBudget: string; 
  onChange: (data: { currentTools?: string[]; monthlyBudget?: string }) => void;
}) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    onChange({ [name]: value } as any);
  };

  const handleToolChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    if (currentTools.includes(value)) {
      onChange({ currentTools: currentTools.filter(t => t !== value) });
    } else {
      onChange({ currentTools: [...currentTools, value] });
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Current Tools */}
      <div>
        <label className="block text-sm text-white/60 mb-3">Current Tools</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {['Photoshop', 'Canva', 'Midjourney', 'Illustrator', 'Figma', 'Adobe XD'].map((tool, idx) => {
            const isSelected = currentTools.includes(tool);

            return (
              <motion.button
                key={tool}
                onClick={() => handleToolChange({ target: { value: tool } } as any)}
                className={`p-4 rounded-xl backdrop-blur-sm border transition-all ${
                  isSelected
                    ? 'bg-gradient-to-br from-[#F5EBE0]/20 to-[#E3D5CA]/20 border-[#F5EBE0]/50'
                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    isSelected ? 'bg-[#F5EBE0]/30' : 'bg-white/10'
                  }`}>
                    <Sparkles className={isSelected ? 'text-[#F5EBE0]' : 'text-white/60'} size={20} />
                  </div>
                  <span className="text-left">{tool}</span>
                </div>

                {isSelected && (
                  <div className="absolute top-4 right-4 w-6 h-6 rounded-full bg-[#F5EBE0] flex items-center justify-center">
                    <Check size={14} className="text-black" />
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Monthly Budget */}
      <div>
        <label className="block text-sm text-white/60 mb-3">Monthly Budget</label>
        <input
          type="text"
          name="monthlyBudget"
          value={monthlyBudget}
          onChange={handleInputChange}
          className="w-full p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 transition-all hover:bg-white/10"
        />
      </div>
    </div>
  );
}