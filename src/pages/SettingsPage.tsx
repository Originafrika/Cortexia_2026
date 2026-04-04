/**
 * SETTINGS PAGE - PRODUCTION READY
 * Beauty Design System compliant settings for Individuals
 * Cohérent avec ForYouFeed, CreateHub, et le reste du design Individuals
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, Bell, Shield, ChevronLeft, LogOut,
  Edit2, Check, X, Camera, Palette, Trophy,
  Award, Sparkles, TrendingUp, DollarSign, Trash2, AlertTriangle
} from 'lucide-react';
import { useAuth } from '../lib/contexts/AuthContext';
import { toast } from 'sonner@2.0.3';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { getAvatarUrl, formatUsername } from '../utils/avatarHelpers';

type SettingsTab = 'profile' | 'notifications' | 'creator' | 'account';

export function SettingsPage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [creatorStats, setCreatorStats] = useState<any>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Load user profile and stats
  useEffect(() => {
    loadUserData();
  }, [user?.id]);
  
  const loadUserData = async () => {
    if (!user?.id) return;
    
    try {
      // Fetch profile
      const profileRes = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214/user/profile/${user.id}`,
        {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        }
      );
      
      if (profileRes.ok) {
        const profileData = await profileRes.json();
        if (profileData.success) {
          setUserProfile(profileData.profile);
          setUsername(profileData.profile.username || '');
          setBio(profileData.profile.bio || '');
        }
      }
      
      // Fetch creator stats if user is creator
      const statsRes = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214/creators/stats/${user.id}`,
        {
          headers: { 'Authorization': `Bearer ${publicAnonKey}` }
        }
      );
      
      if (statsRes.ok) {
        const statsData = await statsRes.json();
        if (statsData.success) {
          setCreatorStats(statsData.stats);
        }
      }
    } catch (error) {
      console.error('❌ Error loading user data:', error);
    }
  };
  
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Validate file
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB');
      return;
    }
    
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };
  
  const handleUploadAvatar = async () => {
    if (!avatarFile || !user?.id) return;
    
    setIsSaving(true);
    
    try {
      const formData = new FormData();
      formData.append('avatar', avatarFile);
      formData.append('userId', user.id);
      
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214/avatar/upload`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: formData
        }
      );
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('✅ Avatar updated!');
        setAvatarFile(null);
        setAvatarPreview(null);
        loadUserData();
      } else {
        throw new Error(data.error || 'Failed to upload');
      }
    } catch (error: any) {
      console.error('❌ Avatar upload error:', error);
      toast.error('Failed to upload avatar');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleSaveUsername = async () => {
    if (!username.trim() || !user?.id) return;
    
    setIsSaving(true);
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214/user/profile/${user.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            username: username.trim(),
            bio: bio.trim()
          })
        }
      );
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('✅ Profile updated!');
        setIsEditingUsername(false);
        loadUserData();
      } else {
        throw new Error(data.error || 'Failed to update');
      }
    } catch (error: any) {
      console.error('❌ Profile update error:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleDeleteAccount = async () => {
    if (!user?.id) return;
    
    setIsDeleting(true);
    
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214/users/${user.id}/account`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`
          }
        }
      );
      
      const data = await response.json();
      
      if (data.success) {
        toast.success('✅ Account deleted!');
        logout();
      } else {
        throw new Error(data.error || 'Failed to delete');
      }
    } catch (error: any) {
      console.error('❌ Account delete error:', error);
      toast.error('Failed to delete account');
    } finally {
      setIsDeleting(false);
    }
  };

  const tabs = [
    { id: 'profile' as const, label: 'Profile', icon: User },
    { id: 'creator' as const, label: 'Creator', icon: Trophy },
    { id: 'notifications' as const, label: 'Notifications', icon: Bell },
    { id: 'account' as const, label: 'Account', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-black text-white pb-safe">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className="px-6 h-14 flex items-center justify-between">
          <button 
            onClick={() => window.history.back()}
            className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
          >
            <ChevronLeft size={24} />
            <span className="font-medium">Settings</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 py-4 border-b border-white/10 overflow-x-auto">
        <div className="flex gap-2 min-w-max">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-full flex items-center gap-2 transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-purple-500/20 to-violet-500/20 border border-purple-500/50 text-white'
                    : 'bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon size={18} />
                <span className="font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6">
        <AnimatePresence mode="wait">
          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Avatar Section */}
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <h3 className="text-lg font-semibold mb-4">Profile Photo</h3>
                
                <div className="flex items-center gap-6">
                  <div className="relative">
                    <ImageWithFallback
                      src={avatarPreview || getAvatarUrl(userProfile?.avatar, username, user?.id)}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover border-2 border-white/20"
                    />
                    
                    <label className="absolute bottom-0 right-0 w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-purple-600 transition-colors border-2 border-black">
                      <Camera size={16} className="text-white" />
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarChange}
                        className="hidden"
                      />
                    </label>
                  </div>
                  
                  <div className="flex-1">
                    <p className="text-white/80 mb-2">Upload a new profile picture</p>
                    <p className="text-sm text-white/40 mb-3">JPG, PNG or GIF • Max 5MB</p>
                    
                    {avatarFile && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleUploadAvatar}
                          disabled={isSaving}
                          className="px-4 py-2 rounded-lg bg-purple-500 hover:bg-purple-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                          {isSaving ? (
                            <>
                              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              <span>Uploading...</span>
                            </>
                          ) : (
                            <>
                              <Check size={16} />
                              <span>Save Photo</span>
                            </>
                          )}
                        </button>
                        
                        <button
                          onClick={() => {
                            setAvatarFile(null);
                            setAvatarPreview(null);
                          }}
                          className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Username & Bio */}
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Profile Info</h3>
                  
                  {!isEditingUsername && (
                    <button
                      onClick={() => setIsEditingUsername(true)}
                      className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors flex items-center gap-2 text-sm"
                    >
                      <Edit2 size={14} />
                      <span>Edit</span>
                    </button>
                  )}
                </div>
                
                <div className="space-y-4">
                  {/* Username */}
                  <div>
                    <label className="block text-sm text-white/60 mb-2">Username</label>
                    {isEditingUsername ? (
                      <div className="flex items-center gap-2">
                        <div className="flex-1 flex items-center gap-2 px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus-within:border-purple-500">
                          <span className="text-white/60">@</span>
                          <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="flex-1 bg-transparent outline-none text-white"
                            placeholder="username"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white">
                        @{formatUsername(username || user?.email || 'user')}
                      </div>
                    )}
                  </div>
                  
                  {/* Bio */}
                  {isEditingUsername && (
                    <div>
                      <label className="block text-sm text-white/60 mb-2">Bio</label>
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 focus:border-purple-500 outline-none text-white resize-none"
                        placeholder="Tell us about yourself..."
                        rows={3}
                      />
                    </div>
                  )}
                  
                  {isEditingUsername && (
                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={handleSaveUsername}
                        disabled={isSaving}
                        className="px-6 py-2.5 rounded-lg bg-purple-500 hover:bg-purple-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {isSaving ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Saving...</span>
                          </>
                        ) : (
                          <>
                            <Check size={16} />
                            <span>Save Changes</span>
                          </>
                        )}
                      </button>
                      
                      <button
                        onClick={() => {
                          setIsEditingUsername(false);
                          setUsername(userProfile?.username || '');
                          setBio(userProfile?.bio || '');
                        }}
                        className="px-6 py-2.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
          
          {activeTab === 'creator' && (
            <motion.div
              key="creator"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              {/* Creator Status */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-violet-500/10 border border-purple-500/20">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                    <Trophy className="text-purple-400" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">Creator Status</h3>
                    <p className="text-sm text-white/60">
                      {creatorStats?.isCreator ? 'Active Creator' : 'Not a Creator'}
                    </p>
                  </div>
                </div>
                
                {creatorStats?.isCreator ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <div className="text-2xl font-bold text-purple-400 mb-1">
                        {creatorStats.imagesGenerated || 0}/60
                      </div>
                      <div className="text-sm text-white/60">Images generated</div>
                    </div>
                    
                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                      <div className="text-2xl font-bold text-purple-400 mb-1">
                        {creatorStats.postsPublished || 0}/5
                      </div>
                      <div className="text-sm text-white/60">Posts published</div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10">
                    <p className="text-white/80 mb-2">Want to become a Creator?</p>
                    <ul className="space-y-2 text-sm text-white/60">
                      <li className="flex items-center gap-2">
                        <Check size={14} className="text-purple-400" />
                        <span>Generate 60 creations per month</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check size={14} className="text-purple-400" />
                        <span>Publish 5 posts with 5+ likes each</span>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
              
              {/* Creator Benefits */}
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Sparkles className="text-purple-400" size={20} />
                  <span>Creator Benefits</span>
                </h3>
                
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
                    <Sparkles className="text-purple-400 mt-0.5" size={18} />
                    <div>
                      <div className="font-medium text-white mb-1">3 Coconut Generations/Month</div>
                      <div className="text-sm text-white/60">Image & Video modes only (no Campaign mode)</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
                    <TrendingUp className="text-green-400 mt-0.5" size={18} />
                    <div>
                      <div className="font-medium text-white mb-1">10-15% Monthly Commissions</div>
                      <div className="text-sm text-white/60">On all referral purchases this month</div>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5">
                    <Award className="text-blue-400 mt-0.5" size={18} />
                    <div>
                      <div className="font-medium text-white mb-1">Watermark-Free Downloads</div>
                      <div className="text-sm text-white/60">Download your creations and feed content without watermarks</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
          
          {activeTab === 'notifications' && (
            <motion.div
              key="notifications"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <h3 className="text-lg font-semibold mb-4">Notification Preferences</h3>
                
                <div className="space-y-4">
                  {[
                    { label: 'Likes & Comments', desc: 'When someone interacts with your posts' },
                    { label: 'New Followers', desc: 'When someone follows you' },
                    { label: 'Creator Updates', desc: 'Monthly progress towards Creator status' },
                    { label: 'Commissions', desc: 'When you earn referral commissions' },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                      <div>
                        <div className="font-medium text-white mb-1">{item.label}</div>
                        <div className="text-sm text-white/60">{item.desc}</div>
                      </div>
                      
                      <button className="relative w-12 h-6 rounded-full bg-purple-500">
                        <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-white" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
          
          {activeTab === 'account' && (
            <motion.div
              key="account"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-6"
            >
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <h3 className="text-lg font-semibold mb-4">Account Information</h3>
                
                <div className="space-y-3">
                  <div>
                    <div className="text-sm text-white/60 mb-1">Email</div>
                    <div className="text-white">{user?.email || 'Not set'}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-white/60 mb-1">Account Type</div>
                    <div className="text-white capitalize">{user?.accountType || 'Individual'}</div>
                  </div>
                  
                  <div>
                    <div className="text-sm text-white/60 mb-1">Member Since</div>
                    <div className="text-white">
                      {userProfile?.createdAt 
                        ? new Date(userProfile.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })
                        : 'Recently joined'
                      }
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Logout */}
              <button
                onClick={logout}
                className="w-full p-4 rounded-2xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2 text-red-400"
              >
                <LogOut size={20} />
                <span className="font-medium">Log Out</span>
              </button>
              
              {/* Delete Account */}
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full p-4 rounded-2xl bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2 text-red-400"
              >
                <Trash2 size={20} />
                <span className="font-medium">Delete Account</span>
              </button>
              
              {/* Delete Confirmation */}
              {showDeleteConfirm && (
                <div className="fixed top-0 left-0 w-full h-full bg-black/50 flex items-center justify-center">
                  <div className="bg-white/5 border border-white/10 p-6 rounded-2xl text-white max-w-sm">
                    <h3 className="text-lg font-semibold mb-4">Confirm Account Deletion</h3>
                    
                    <p className="text-sm text-white/60 mb-4">
                      Are you sure you want to delete your account? This action is irreversible.
                    </p>
                    
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        className="px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                      >
                        Cancel
                      </button>
                      
                      <button
                        onClick={handleDeleteAccount}
                        disabled={isDeleting}
                        className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {isDeleting ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            <span>Deleting...</span>
                          </>
                        ) : (
                          <>
                            <Trash2 size={16} />
                            <span>Delete Account</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}