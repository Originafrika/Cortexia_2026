import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Mail, Lock, User, Sparkles, Building2, Code, Users as UsersIcon } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface SignupPageProps {
  onNavigate: (screen: 'landing' | 'login' | 'onboarding') => void;
  onSignupComplete: (userType: 'individual' | 'enterprise' | 'developer') => void;
}

export function SignupPage({ onNavigate, onSignupComplete }: SignupPageProps) {
  const [step, setStep] = useState<'type' | 'details'>('type');
  const [userType, setUserType] = useState<'individual' | 'enterprise' | 'developer' | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    companyName: '',
  });
  const [loading, setLoading] = useState(false);

  const userTypes = [
    {
      id: 'individual' as const,
      icon: User,
      title: 'Individual Creator',
      description: 'For personal projects and creative exploration',
      features: ['Simple creation mode', 'Community access', '10 free credits'],
      gradient: 'from-[#F5EBE0]/20 to-[#E3D5CA]/20',
      borderGradient: 'from-[#F5EBE0]/30 to-[#E3D5CA]/30',
    },
    {
      id: 'enterprise' as const,
      icon: Building2,
      title: 'Enterprise',
      description: 'For teams and professional production',
      features: ['Full Coconut access', 'Image + Video + Campaigns', '10,000 credits/month'],
      gradient: 'from-[#E3D5CA]/20 to-[#D6CCC2]/20',
      borderGradient: 'from-[#E3D5CA]/30 to-[#D6CCC2]/30',
      popular: true,
    },
    {
      id: 'developer' as const,
      icon: Code,
      title: 'Developer',
      description: 'API access for integration and automation',
      features: ['Full API access', 'Webhooks', 'Documentation'],
      gradient: 'from-[#D6CCC2]/20 to-[#EDEDE9]/20',
      borderGradient: 'from-[#D6CCC2]/30 to-[#EDEDE9]/30',
    },
  ];

  const handleTypeSelect = (type: 'individual' | 'enterprise' | 'developer') => {
    setUserType(type);
    setStep('details');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password || !formData.name) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (userType === 'enterprise' && !formData.companyName) {
      toast.error('Company name is required for enterprise accounts');
      return;
    }

    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      toast.success('Account created successfully!');
      onSignupComplete(userType!);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center px-6 py-12 relative overflow-hidden">
      {/* Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[#F5EBE0]/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#E3D5CA]/5 rounded-full blur-[120px]" />
      </div>

      {/* Back Button */}
      <button
        onClick={() => step === 'type' ? onNavigate('landing') : setStep('type')}
        className="fixed top-6 left-6 z-50 p-3 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 transition-all hover:bg-white/10"
      >
        <ArrowLeft size={20} />
      </button>

      <div className="w-full max-w-6xl relative">
        {/* Type Selection */}
        {step === 'type' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-6">
                <Sparkles className="text-[#F5EBE0]" size={16} />
                <span className="text-sm text-[#F5EBE0]">Create Your Account</span>
              </div>
              <h1 className="text-5xl md:text-6xl mb-4">Choose Your Path</h1>
              <p className="text-xl text-white/60">Select the account type that fits your needs</p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {userTypes.map((type, idx) => (
                <motion.button
                  key={type.id}
                  onClick={() => handleTypeSelect(type.id)}
                  className="group relative p-8 rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 text-left transition-all hover:bg-white/10 overflow-hidden"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: idx * 0.1 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                >
                  {/* Popular Badge */}
                  {type.popular && (
                    <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-[#F5EBE0]/20 text-[#F5EBE0] text-xs">
                      Popular
                    </div>
                  )}

                  {/* Gradient Background */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${type.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                  
                  <div className="relative">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${type.gradient} border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                      <type.icon className="text-[#F5EBE0]" size={28} />
                    </div>
                    
                    <h3 className="text-2xl mb-3">{type.title}</h3>
                    <p className="text-white/60 mb-6">{type.description}</p>
                    
                    <ul className="space-y-2 mb-6">
                      {type.features.map((feature, fIdx) => (
                        <li key={fIdx} className="flex items-center gap-2 text-sm text-white/80">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#F5EBE0]" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-[#F5EBE0]">Select</span>
                      <div className="w-8 h-8 rounded-lg bg-white/10 group-hover:bg-[#F5EBE0]/20 flex items-center justify-center transition-colors">
                        <div className="w-2 h-2 rounded-full bg-[#F5EBE0]" />
                      </div>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>

            <motion.div
              className="text-center mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <p className="text-white/40 text-sm">
                Already have an account?{' '}
                <button
                  onClick={() => onNavigate('login')}
                  className="text-[#F5EBE0] hover:underline"
                >
                  Sign in
                </button>
              </p>
            </motion.div>
          </motion.div>
        )}

        {/* Details Form */}
        {step === 'details' && userType && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-md mx-auto"
          >
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm mb-6">
                {userType === 'individual' && <User className="text-[#F5EBE0]" size={16} />}
                {userType === 'enterprise' && <Building2 className="text-[#F5EBE0]" size={16} />}
                {userType === 'developer' && <Code className="text-[#F5EBE0]" size={16} />}
                <span className="text-sm text-[#F5EBE0] capitalize">{userType}</span>
              </div>
              <h1 className="text-4xl md:text-5xl mb-4">Create Your Account</h1>
              <p className="text-white/60">Enter your details to get started</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label className="block text-sm text-white/60 mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-[#F5EBE0]/50 transition-colors"
                    placeholder="John Doe"
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm text-white/60 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-[#F5EBE0]/50 transition-colors"
                    placeholder="john@example.com"
                    required
                  />
                </div>
              </div>

              {/* Company Name (Enterprise only) */}
              {userType === 'enterprise' && (
                <div>
                  <label className="block text-sm text-white/60 mb-2">Company Name</label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                    <input
                      type="text"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                      className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-[#F5EBE0]/50 transition-colors"
                      placeholder="Acme Inc."
                      required
                    />
                  </div>
                </div>
              )}

              {/* Password */}
              <div>
                <label className="block text-sm text-white/60 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 text-white placeholder:text-white/40 focus:outline-none focus:border-[#F5EBE0]/50 transition-colors"
                    placeholder="••••••••"
                    required
                    minLength={8}
                  />
                </div>
                <p className="text-xs text-white/40 mt-2">Minimum 8 characters</p>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-4 rounded-xl bg-gradient-to-br from-[#F5EBE0] to-[#E3D5CA] text-black transition-all hover:shadow-xl hover:shadow-[#F5EBE0]/30 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                    <span>Creating account...</span>
                  </div>
                ) : (
                  'Create Account'
                )}
              </button>
            </form>

            <div className="text-center mt-6">
              <p className="text-white/40 text-sm">
                Already have an account?{' '}
                <button
                  onClick={() => onNavigate('login')}
                  className="text-[#F5EBE0] hover:underline"
                >
                  Sign in
                </button>
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
