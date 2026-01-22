import { useState, useEffect } from 'react';
import { Trash2, RefreshCw, AlertTriangle, Users, Database, Edit2, Save, X, Plus, Minus, Crown, TestTube } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { ReferralSystemTester } from './ReferralSystemTester';

interface UserProfile {
  userId: string;
  email: string;
  username: string;
  displayName: string;
  accountType: 'individual' | 'enterprise' | 'developer';
  onboardingComplete?: boolean;
  referralCode: string;
  referralLink?: string; // ✅ Add referral link
  freeCredits: number;
  paidCredits: number;
  // ✅ Enterprise credit details
  isEnterprise?: boolean;
  enterpriseMonthly?: number;
  enterpriseAddon?: number;
  enterpriseTotal?: number;
  nextResetDate?: string;
  createdAt: string;
  lastLoginAt: string;
  expiresAt?: string | null; // ✅ Add expiration field
  // 👑 Creator Stats
  isCreator?: boolean;
  generationsThisMonth?: number;
  publishedThisMonth?: number;
  publishedWithLikesThisMonth?: number;
}

export function AdminPanel() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [showReferralTester, setShowReferralTester] = useState(false);
  const [testUserId, setTestUserId] = useState<string>('');
  const [editForm, setEditForm] = useState({
    displayName: '',
    username: '',
    email: '',
    accountType: 'individual' as 'individual' | 'enterprise' | 'developer',
    referralCode: '', // ✅ Add referral code
    freeCredits: 0,
    paidCredits: 0,
    expiresAt: null as string | null,
    // ✅ Enterprise credit details
    isEnterprise: false,
    enterpriseMonthly: 0,
    enterpriseAddon: 0,
    enterpriseTotal: 0,
    nextResetDate: '',
    // 👑 Creator Stats
    isCreator: false,
    generationsThisMonth: 0,
    publishedThisMonth: 0,
    publishedWithLikesThisMonth: 0,
  });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214/users/admin/list-all`,
        {
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch users');
      }

      const data = await response.json();
      console.log('📋 Admin: Fetched users', data);
      setUsers(data.users || []);
      toast.success(`Loaded ${data.count} users`);
    } catch (error) {
      console.error('❌ Admin: Fetch error', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm(`⚠️ Delete user ${userId}?\n\nThis will permanently remove all data!`)) {
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214/users/admin/hard-delete/${userId}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      const data = await response.json();
      console.log('🗑️ Admin: User deleted', data);
      toast.success(`User ${userId} deleted`);
      
      // Refresh list
      fetchUsers();
    } catch (error) {
      console.error('❌ Admin: Delete error', error);
      toast.error('Failed to delete user');
    }
  };

  const clearAllUsers = async () => {
    if (!confirm('⚠️⚠️⚠️ DELETE ALL USERS? ⚠️⚠️⚠️\n\nThis is IRREVERSIBLE and will clear the entire KV store!')) {
      return;
    }

    if (!confirm('Are you ABSOLUTELY SURE? Type "DELETE" to confirm.')) {
      return;
    }

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214/users/admin/clear-all`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to clear users');
      }

      const data = await response.json();
      console.log('🗑️ Admin: All users cleared', data);
      toast.success(`Cleared ${data.deletedCount} users`);
      
      // Refresh list
      setUsers([]);
    } catch (error) {
      console.error('❌ Admin: Clear all error', error);
      toast.error('Failed to clear users');
    }
  };

  const startEdit = (user: UserProfile) => {
    setEditingUser(user);
    setEditForm({
      displayName: user.displayName,
      username: user.username,
      email: user.email,
      accountType: user.accountType,
      referralCode: user.referralCode, // ✅ Add referral code
      freeCredits: user.freeCredits,
      paidCredits: user.paidCredits,
      expiresAt: user.expiresAt || null,
      // ✅ Enterprise credit details
      isEnterprise: user.isEnterprise || false,
      enterpriseMonthly: user.enterpriseMonthly || 0,
      enterpriseAddon: user.enterpriseAddon || 0,
      enterpriseTotal: user.enterpriseTotal || 0,
      nextResetDate: user.nextResetDate || '',
      // 👑 Creator Stats
      isCreator: user.isCreator || false,
      generationsThisMonth: user.generationsThisMonth || 0,
      publishedThisMonth: user.publishedThisMonth || 0,
      publishedWithLikesThisMonth: user.publishedWithLikesThisMonth || 0,
    });
  };

  const cancelEdit = () => {
    setEditingUser(null);
    setEditForm({
      displayName: '',
      username: '',
      email: '',
      accountType: 'individual' as 'individual' | 'enterprise' | 'developer',
      referralCode: '', // ✅ Add referral code
      freeCredits: 0,
      paidCredits: 0,
      expiresAt: null,
      // ✅ Enterprise credit details
      isEnterprise: false,
      enterpriseMonthly: 0,
      enterpriseAddon: 0,
      enterpriseTotal: 0,
      nextResetDate: '',
      // 👑 Creator Stats
      isCreator: false,
      generationsThisMonth: 0,
      publishedThisMonth: 0,
      publishedWithLikesThisMonth: 0,
    });
  };

  const saveEdit = async () => {
    if (!editingUser) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-e55aa214/users/admin/update/${editingUser.userId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${publicAnonKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(editForm),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update user');
      }

      const data = await response.json();
      console.log('📝 Admin: User updated', data);
      toast.success(`User ${editingUser.userId} updated`);
      
      // Refresh list
      fetchUsers();
      cancelEdit();
    } catch (error) {
      console.error('❌ Admin: Update error', error);
      toast.error('Failed to update user');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-neutral-950 to-black p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
              <Database className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">KV Store Admin</h1>
              <p className="text-sm text-neutral-400">User Management & Database</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchUsers}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center gap-2 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <button
              onClick={clearAllUsers}
              className="px-4 py-2 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 flex items-center gap-2 transition-colors"
            >
              <AlertTriangle className="w-4 h-4" />
              Clear All
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-neutral-400">Total Users</span>
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div className="text-3xl font-bold text-white">{users.length}</div>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-neutral-400">Individuals</span>
              <Users className="w-5 h-5 text-green-400" />
            </div>
            <div className="text-3xl font-bold text-white">
              {users.filter(u => u.accountType === 'individual').length}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-neutral-400">Enterprises</span>
              <Users className="w-5 h-5 text-purple-400" />
            </div>
            <div className="text-3xl font-bold text-white">
              {users.filter(u => u.accountType === 'enterprise').length}
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-neutral-400">Developers</span>
              <Users className="w-5 h-5 text-orange-400" />
            </div>
            <div className="text-3xl font-bold text-white">
              {users.filter(u => u.accountType === 'developer').length}
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden">
          <div className="p-6 border-b border-white/10">
            <h2 className="text-lg font-semibold text-white">All Users</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                    User ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                    Onboarding
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                    Credits
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-neutral-400 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-neutral-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((user) => (
                  <tr key={user.userId} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono text-white/80 truncate max-w-[200px]">
                        {user.userId}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">{user.email}</div>
                      <div className="text-xs text-neutral-500">@{user.username}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          user.accountType === 'individual'
                            ? 'bg-green-500/20 text-green-400'
                            : user.accountType === 'enterprise'
                            ? 'bg-purple-500/20 text-purple-400'
                            : 'bg-orange-500/20 text-orange-400'
                        }`}
                      >
                        {user.accountType}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${
                          user.onboardingComplete
                            ? 'bg-blue-500/20 text-blue-400'
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}
                      >
                        {user.onboardingComplete ? 'Complete' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.isEnterprise ? (
                        // ✅ Enterprise credits display
                        <div>
                          <div className="text-sm text-purple-400 font-semibold">
                            {user.enterpriseTotal?.toLocaleString() || 0} 💎
                          </div>
                          <div className="text-xs text-neutral-500 space-y-0.5">
                            <div className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                              {user.enterpriseMonthly?.toLocaleString() || 0} monthly
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                              {user.enterpriseAddon?.toLocaleString() || 0} add-on
                            </div>
                          </div>
                          {user.nextResetDate && (
                            <div className="text-xs text-neutral-600 mt-1">
                              Reset: {new Date(user.nextResetDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </div>
                          )}
                        </div>
                      ) : (
                        // ✅ Individual/Developer credits display
                        <div>
                          <div className="text-sm text-white">
                            {user.freeCredits + user.paidCredits}
                          </div>
                          <div className="text-xs text-neutral-500">
                            {user.freeCredits} free / {user.paidCredits} paid
                          </div>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-neutral-400">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          onClick={() => {
                            setTestUserId(user.userId);
                            setShowReferralTester(true);
                          }}
                          className="px-3 py-1 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 text-sm flex items-center gap-2 transition-colors"
                        >
                          <TestTube className="w-3 h-3" />
                          Test
                        </button>
                        <button
                          onClick={() => startEdit(user)}
                          className="px-3 py-1 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-sm flex items-center gap-2 transition-colors"
                        >
                          <Edit2 className="w-3 h-3" />
                          Edit
                        </button>
                        <button
                          onClick={() => deleteUser(user.userId)}
                          className="px-3 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 text-sm flex items-center gap-2 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {users.length === 0 && !loading && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="text-neutral-500">No users found</div>
                    </td>
                  </tr>
                )}

                {loading && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="text-neutral-500">Loading...</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editingUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 z-50 overflow-y-auto">
          <div className="bg-gradient-to-br from-neutral-900 to-black rounded-2xl border border-white/10 shadow-2xl max-w-2xl w-full p-4 md:p-8 my-4">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-white">Edit User</h2>
                <p className="text-xs md:text-sm text-neutral-400 font-mono mt-1 truncate max-w-[200px] md:max-w-none">{editingUser.userId}</p>
              </div>
              <button
                onClick={cancelEdit}
                className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors flex-shrink-0"
              >
                <X className="w-5 h-5 text-neutral-400" />
              </button>
            </div>

            {/* Edit Form */}
            <div className="space-y-4 max-h-[60vh] md:max-h-none overflow-y-auto pr-2">
              {/* Profile Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-2">Display Name</label>
                  <input
                    type="text"
                    value={editForm.displayName}
                    onChange={(e) => setEditForm({ ...editForm, displayName: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                    placeholder="Display name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-2">Username</label>
                  <input
                    type="text"
                    value={editForm.username}
                    onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                    placeholder="@username"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-400 mb-2">Account Type</label>
                <select
                  value={editForm.accountType}
                  onChange={(e) => {
                    const newType = e.target.value as 'individual' | 'enterprise' | 'developer';
                    // 🏢 Auto-reset free credits to 0 when switching to enterprise
                    if (newType === 'enterprise') {
                      setEditForm({ ...editForm, accountType: newType, freeCredits: 0 });
                    } else {
                      setEditForm({ ...editForm, accountType: newType });
                    }
                  }}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                >
                  <option value="individual">Individual</option>
                  <option value="enterprise">Enterprise</option>
                  <option value="developer">Developer</option>
                </select>
              </div>

              {/* ✅ Referral Code & Link Section */}
              <div className="border-t border-white/10 pt-4 mt-4">
                <h3 className="text-base md:text-lg font-semibold text-white mb-4">Referral System</h3>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-400 mb-2">
                    Referral Code
                  </label>
                  <input
                    type="text"
                    value={editForm.referralCode}
                    onChange={(e) => setEditForm({ ...editForm, referralCode: e.target.value.toUpperCase() })}
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-mono placeholder:text-neutral-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 uppercase"
                    placeholder="ABC123"
                    maxLength={10}
                  />
                  <p className="text-xs text-neutral-500 mt-1">
                    This code can be shared with others to refer new users
                  </p>
                </div>

                {/* Display Referral Link */}
                {editingUser && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-neutral-400 mb-2">
                      Referral Link
                    </label>
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                      <input
                        type="text"
                        value={`${window.location.origin}/?ref=${editForm.referralCode}`}
                        readOnly
                        className="flex-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-neutral-400 font-mono text-xs md:text-sm focus:outline-none select-all"
                      />
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/?ref=${editForm.referralCode}`);
                          toast.success('Referral link copied!');
                        }}
                        className="px-4 py-2 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-sm transition-colors whitespace-nowrap"
                      >
                        Copy Link
                      </button>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Credits Management */}
              <div className="border-t border-white/10 pt-4 mt-6">
                <h3 className="text-base md:text-lg font-semibold text-white mb-4">Credits Management</h3>
                
                {/* Enterprise Warning */}
                {editForm.accountType === 'enterprise' && (
                  <div className="mb-4 p-3 md:p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-amber-400 mb-1">Enterprise Account Rules</p>
                        <ul className="text-xs text-amber-300/80 space-y-1">
                          <li>• ❌ No free credits (always 0)</li>
                          <li>• 💰 Minimum: 10,000 paid credits/month</li>
                          <li>• ⏰ Credits expire after 1 month</li>
                          <li>• 📦 Additional credits sold in batches of 1,000</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Free Credits */}
                  <div>
                    <label className="block text-sm font-medium text-green-400 mb-2">
                      Free Credits
                      {editForm.accountType === 'enterprise' && (
                        <span className="ml-2 text-xs text-neutral-500">(disabled)</span>
                      )}
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditForm({ ...editForm, freeCredits: Math.max(0, editForm.freeCredits - 10) })}
                        disabled={editForm.accountType === 'enterprise'}
                        className="w-10 h-10 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <input
                        type="number"
                        value={editForm.freeCredits}
                        onChange={(e) => setEditForm({ ...editForm, freeCredits: Math.max(0, parseInt(e.target.value) || 0) })}
                        disabled={editForm.accountType === 'enterprise'}
                        className="flex-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-center font-mono focus:outline-none focus:ring-2 focus:ring-green-500/50 disabled:opacity-30 disabled:cursor-not-allowed"
                      />
                      <button
                        onClick={() => setEditForm({ ...editForm, freeCredits: editForm.freeCredits + 10 })}
                        disabled={editForm.accountType === 'enterprise'}
                        className="w-10 h-10 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 flex items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Paid Credits */}
                  <div>
                    <label className="block text-sm font-medium text-amber-400 mb-2">
                      Paid Credits
                      {editForm.accountType === 'enterprise' && (
                        <span className="ml-2 text-xs text-neutral-500">(min: 10,000)</span>
                      )}
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          const decrement = editForm.accountType === 'enterprise' ? 1000 : 10;
                          const minimum = editForm.accountType === 'enterprise' ? 0 : 0;
                          setEditForm({ ...editForm, paidCredits: Math.max(minimum, editForm.paidCredits - decrement) });
                        }}
                        className="w-10 h-10 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 flex items-center justify-center transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <input
                        type="number"
                        value={editForm.paidCredits}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0;
                          setEditForm({ ...editForm, paidCredits: Math.max(0, value) });
                        }}
                        className="flex-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-center font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                      />
                      <button
                        onClick={() => {
                          const increment = editForm.accountType === 'enterprise' ? 1000 : 10;
                          setEditForm({ ...editForm, paidCredits: editForm.paidCredits + increment });
                        }}
                        className="w-10 h-10 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 flex items-center justify-center transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    {editForm.accountType === 'enterprise' && (
                      <p className="text-xs text-neutral-500 mt-1 text-center">
                        ± 1,000 credits per click
                      </p>
                    )}
                  </div>
                </div>

                {/* Total Credits Display */}
                <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-green-500/10 to-amber-500/10 border border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-400">Total Credits</span>
                    <span className="text-2xl font-bold bg-gradient-to-r from-green-400 to-amber-400 bg-clip-text text-transparent">
                      {editForm.freeCredits + editForm.paidCredits}
                    </span>
                  </div>
                </div>

                {/* Expiration Management (Enterprise only) */}
                {editForm.accountType === 'enterprise' && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-neutral-400 mb-2">
                      Expiration Date
                    </label>
                    <input
                      type="date"
                      value={editForm.expiresAt ? new Date(editForm.expiresAt).toISOString().split('T')[0] : ''}
                      onChange={(e) => {
                        if (e.target.value) {
                          const date = new Date(e.target.value);
                          date.setHours(23, 59, 59, 999); // End of day
                          setEditForm({ ...editForm, expiresAt: date.toISOString() });
                        } else {
                          setEditForm({ ...editForm, expiresAt: null });
                        }
                      }}
                      className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                    />
                    <div className="mt-2 flex gap-2">
                      <button
                        onClick={() => {
                          const date = new Date();
                          date.setMonth(date.getMonth() + 1);
                          setEditForm({ ...editForm, expiresAt: date.toISOString() });
                        }}
                        className="px-3 py-1 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-xs transition-colors"
                      >
                        +1 Month
                      </button>
                      <button
                        onClick={() => setEditForm({ ...editForm, expiresAt: null })}
                        className="px-3 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 text-xs transition-colors"
                      >
                        Clear
                      </button>
                    </div>
                    {editForm.expiresAt && (
                      <p className="text-xs text-neutral-500 mt-2">
                        Expires: {new Date(editForm.expiresAt).toLocaleDateString('en-US', { 
                          month: 'long', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* 👑 Creator Stats Management (Individual only) */}
              {editForm.accountType === 'individual' && (
                <div className="border-t border-white/10 pt-4 mt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Crown className="w-5 h-5 text-yellow-400" />
                    <h3 className="text-base md:text-lg font-semibold text-white">Creator Stats</h3>
                  </div>
                  
                  {/* Creator Status Toggle */}
                  <div className="mb-4 p-4 rounded-xl bg-gradient-to-r from-yellow-500/10 to-amber-500/10 border border-yellow-500/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-yellow-400">Creator Status</p>
                        <p className="text-xs text-neutral-400 mt-1">
                          Creators get 3 Coconut generations/month, watermark-free downloads, and commissions
                        </p>
                      </div>
                      <button
                        onClick={() => setEditForm({ ...editForm, isCreator: !editForm.isCreator })}
                        className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                          editForm.isCreator ? 'bg-yellow-500' : 'bg-neutral-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                            editForm.isCreator ? 'translate-x-7' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Generations This Month */}
                    <div>
                      <label className="block text-sm font-medium text-blue-400 mb-2">
                        Generations (Month)
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditForm({ ...editForm, generationsThisMonth: Math.max(0, editForm.generationsThisMonth - 1) })}
                          className="w-10 h-10 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 flex items-center justify-center transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <input
                          type="number"
                          value={editForm.generationsThisMonth}
                          onChange={(e) => setEditForm({ ...editForm, generationsThisMonth: Math.max(0, parseInt(e.target.value) || 0) })}
                          className="flex-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-center font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        />
                        <button
                          onClick={() => setEditForm({ ...editForm, generationsThisMonth: editForm.generationsThisMonth + 1 })}
                          className="w-10 h-10 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 flex items-center justify-center transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Published This Month */}
                    <div>
                      <label className="block text-sm font-medium text-green-400 mb-2">
                        Published (Month)
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditForm({ ...editForm, publishedThisMonth: Math.max(0, editForm.publishedThisMonth - 1) })}
                          className="w-10 h-10 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 flex items-center justify-center transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <input
                          type="number"
                          value={editForm.publishedThisMonth}
                          onChange={(e) => setEditForm({ ...editForm, publishedThisMonth: Math.max(0, parseInt(e.target.value) || 0) })}
                          className="flex-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-center font-mono focus:outline-none focus:ring-2 focus:ring-green-500/50"
                        />
                        <button
                          onClick={() => setEditForm({ ...editForm, publishedThisMonth: editForm.publishedThisMonth + 1 })}
                          className="w-10 h-10 rounded-lg bg-green-500/20 hover:bg-green-500/30 text-green-400 flex items-center justify-center transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Published with Likes This Month */}
                    <div>
                      <label className="block text-sm font-medium text-pink-400 mb-2">
                        Liked Posts (Month)
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditForm({ ...editForm, publishedWithLikesThisMonth: Math.max(0, editForm.publishedWithLikesThisMonth - 1) })}
                          className="w-10 h-10 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-400 flex items-center justify-center transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <input
                          type="number"
                          value={editForm.publishedWithLikesThisMonth}
                          onChange={(e) => setEditForm({ ...editForm, publishedWithLikesThisMonth: Math.max(0, parseInt(e.target.value) || 0) })}
                          className="flex-1 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white text-center font-mono focus:outline-none focus:ring-2 focus:ring-pink-500/50"
                        />
                        <button
                          onClick={() => setEditForm({ ...editForm, publishedWithLikesThisMonth: editForm.publishedWithLikesThisMonth + 1 })}
                          className="w-10 h-10 rounded-lg bg-pink-500/20 hover:bg-pink-500/30 text-pink-400 flex items-center justify-center transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Info Note */}
                  <div className="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                    <p className="text-xs text-blue-300">
                      💡 These stats reset monthly. Creator commissions (10-15%) are based on consecutive months of Creator status.
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 mt-8">
              <button
                onClick={cancelEdit}
                className="flex-1 px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 text-white font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Referral Tester Modal */}
      {showReferralTester && testUserId && (
        <ReferralSystemTester
          userId={testUserId}
          onClose={() => setShowReferralTester(false)}
        />
      )}
    </div>
  );
}