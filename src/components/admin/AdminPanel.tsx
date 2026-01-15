import { useState } from 'react';
import { X, Users, Building2, Shield, UserCog } from 'lucide-react';
import { useUsers, UserRole } from '../../hooks/useUsers';
import { useCompanies } from '../../hooks/useCompanies';
import { useCompanyAccess } from '../../hooks/useCompanyAccess';
import { useToast } from '../../contexts/ToastContext';
import { Company } from '../../types/database';

interface AdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  adminUserId: string;
}

export function AdminPanel({ isOpen, onClose, adminUserId }: AdminPanelProps) {
  const { users, loading: usersLoading, setUserRole } = useUsers();
  const { companies } = useCompanies(adminUserId);
  const { addToast } = useToast();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'users' | 'access'>('users');

  if (!isOpen) return null;

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    const { error } = await setUserRole(userId, newRole);
    if (error) {
      addToast(error, 'error');
    } else {
      addToast(`Role updated successfully`, 'success');
    }
  };

  const selectedUser = users.find(u => u.id === selectedUserId);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Admin Panel</h2>
              <p className="text-sm text-slate-500">Manage users and company access</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'users'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Users className="w-4 h-4" />
            Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('access')}
            className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'access'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Building2 className="w-4 h-4" />
            Company Access
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {usersLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          ) : activeTab === 'users' ? (
            <UsersTab
              users={users}
              onRoleChange={handleRoleChange}
              onSelectUser={setSelectedUserId}
              selectedUserId={selectedUserId}
            />
          ) : (
            <AccessTab
              users={users}
              companies={companies}
              selectedUser={selectedUser}
              onSelectUser={setSelectedUserId}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Users Tab Component
interface UsersTabProps {
  users: Array<{
    id: string;
    email: string;
    name: string;
    role: string | null;
    created_at: string;
  }>;
  onRoleChange: (userId: string, role: UserRole) => void;
  onSelectUser: (userId: string | null) => void;
  selectedUserId: string | null;
}

function UsersTab({ users, onRoleChange, onSelectUser, selectedUserId }: UsersTabProps) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-3">
        {users.map(user => (
          <div
            key={user.id}
            className={`p-4 rounded-xl border transition-colors cursor-pointer ${
              selectedUserId === user.id
                ? 'border-indigo-300 bg-indigo-50'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
            onClick={() => onSelectUser(selectedUserId === user.id ? null : user.id)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                  <UserCog className="w-5 h-5 text-slate-500" />
                </div>
                <div>
                  <div className="font-medium text-slate-900">{user.name}</div>
                  <div className="text-sm text-slate-500">{user.email}</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={user.role || 'Analyst'}
                  onChange={(e) => {
                    e.stopPropagation();
                    onRoleChange(user.id, e.target.value as UserRole);
                  }}
                  onClick={(e) => e.stopPropagation()}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                    user.role === 'admin'
                      ? 'bg-indigo-100 text-indigo-700 border-indigo-200'
                      : user.role === 'client'
                      ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                      : 'bg-slate-100 text-slate-600 border-slate-200'
                  }`}
                >
                  <option value="admin">Admin</option>
                  <option value="client">Client</option>
                  <option value="Analyst">Analyst</option>
                </select>
              </div>
            </div>
            <div className="mt-2 text-xs text-slate-400">
              Joined {new Date(user.created_at).toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
      {users.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          No users found
        </div>
      )}
    </div>
  );
}

// Access Tab Component
interface AccessTabProps {
  users: Array<{
    id: string;
    email: string;
    name: string;
    role: string | null;
    company_access?: Array<{
      company_id: string;
      company: { id: string; name: string; color: string };
    }>;
  }>;
  companies: Company[];
  selectedUser?: {
    id: string;
    email: string;
    name: string;
    role: string | null;
    company_access?: Array<{
      company_id: string;
      company: { id: string; name: string; color: string };
    }>;
  } | null;
  onSelectUser: (userId: string | null) => void;
}

function AccessTab({ users, companies, selectedUser, onSelectUser }: AccessTabProps) {
  const { grantAccess, revokeAccess } = useCompanyAccess();
  const { addToast } = useToast();
  const [savingCompanyId, setSavingCompanyId] = useState<string | null>(null);

  // Filter to only show clients
  const clientUsers = users.filter(u => u.role === 'client');

  const handleToggleAccess = async (companyId: string, hasAccess: boolean) => {
    if (!selectedUser) return;

    setSavingCompanyId(companyId);
    const { error } = hasAccess
      ? await revokeAccess(selectedUser.id, companyId)
      : await grantAccess(selectedUser.id, companyId);

    setSavingCompanyId(null);

    if (error) {
      addToast(error, 'error');
    } else {
      addToast(hasAccess ? 'Access revoked' : 'Access granted', 'success');
    }
  };

  const userAccessIds = selectedUser?.company_access?.map(a => a.company_id) || [];

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Client List */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Select a Client</h3>
        <div className="space-y-2">
          {clientUsers.map(user => (
            <button
              key={user.id}
              onClick={() => onSelectUser(selectedUser?.id === user.id ? null : user.id)}
              className={`w-full p-3 rounded-lg border text-left transition-colors ${
                selectedUser?.id === user.id
                  ? 'border-indigo-300 bg-indigo-50'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="font-medium text-slate-900">{user.name}</div>
              <div className="text-sm text-slate-500">{user.email}</div>
              {user.company_access && user.company_access.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {user.company_access.map(access => (
                    <span
                      key={access.company_id}
                      className="px-2 py-0.5 rounded text-xs font-medium"
                      style={{
                        backgroundColor: `${access.company.color}20`,
                        color: access.company.color,
                      }}
                    >
                      {access.company.name}
                    </span>
                  ))}
                </div>
              )}
            </button>
          ))}
          {clientUsers.length === 0 && (
            <div className="text-center py-8 text-slate-500 text-sm">
              No clients yet. Change a user's role to "Client" first.
            </div>
          )}
        </div>
      </div>

      {/* Company Access */}
      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-3">
          {selectedUser ? `Companies for ${selectedUser.name}` : 'Select a client'}
        </h3>
        {selectedUser ? (
          <div className="space-y-2">
            {companies.map(company => {
              const hasAccess = userAccessIds.includes(company.id);
              const isSaving = savingCompanyId === company.id;

              return (
                <div
                  key={company.id}
                  className={`p-3 rounded-lg border flex items-center justify-between transition-colors ${
                    hasAccess ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: company.color }}
                    />
                    <span className="font-medium text-slate-900">{company.name}</span>
                  </div>
                  <button
                    onClick={() => handleToggleAccess(company.id, hasAccess)}
                    disabled={isSaving}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      hasAccess
                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                        : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                    } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {isSaving ? '...' : hasAccess ? 'Revoke' : 'Grant'}
                  </button>
                </div>
              );
            })}
            {companies.length === 0 && (
              <div className="text-center py-8 text-slate-500 text-sm">
                No companies created yet.
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-400 text-sm border border-dashed border-slate-200 rounded-lg">
            Select a client from the left to manage their company access
          </div>
        )}
      </div>
    </div>
  );
}
