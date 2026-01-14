import { useState, useEffect } from 'react';
import { Trash2, RefreshCw, AlertTriangle, Users, Database, Edit2, Save, X, Plus, Minus } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface UserProfile {
  userId: string;
  email: string;
  username: string;
  displayName: string;
  accountType: 'individual' | 'enterprise' | 'developer';
  onboardingComplete?: boolean;
  referralCode: string;
  freeCredits: number;
  paidCredits: number;
  createdAt: string;
  lastLoginAt: string;
  expiresAt?: string | null; // ✅ Add expiration field
}

export function AdminPanel() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
  const [editForm, setEditForm] = useState({
    displayName: '',
    username: '',
    email: '',
    accountType: 'individual' as 'individual' | 'enterprise' | 'developer',
    freeCredits: 0,
    paidCredits: 0,
    expiresAt: null as string | null,
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
      freeCredits: user.freeCredits,
      paidCredits: user.paidCredits,
      expiresAt: user.expiresAt || null,
    });
  };

  const cancelEdit = () => {
    setEditingUser(null);
    setEditForm({
      displayName: '',
      username: '',
      email: '',
      accountType: 'individual' as 'individual' | 'enterprise' | 'developer',
      freeCredits: 0,
      paidCredits: 0,
      expiresAt: null,
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
                      <div className="text-sm text-white">
                        {user.freeCredits + user.paidCredits}
                      </div>
                      <div className="text-xs text-neutral-500">
                        {user.freeCredits} free / {user.paidCredits} paid
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-neutral-400">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center gap-2 justify-end">
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-8 z-50">
          <div className="bg-gradient-to-br from-neutral-900 to-black rounded-2xl border border-white/10 shadow-2xl max-w-2xl w-full p-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white">Edit User</h2>
                <p className="text-sm text-neutral-400 font-mono mt-1">{editingUser.userId}</p>
              </div>
              <button
                onClick={cancelEdit}
                className="w-10 h-10 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5 text-neutral-400" />
              </button>
            </div>

            {/* Edit Form */}
            <div className="space-y-4">
              {/* Profile Info */}
              <div className="grid grid-cols-2 gap-4">
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

              {/* Credits Management */}
              <div className="border-t border-white/10 pt-4 mt-6">
                <h3 className="text-lg font-semibold text-white mb-4">Credits Management</h3>
                
                {/* Enterprise Warning */}
                {editForm.accountType === 'enterprise' && (
                  <div className="mb-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
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
                
                <div className="grid grid-cols-2 gap-4">
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
    </div>
  );
}