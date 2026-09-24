"use client";

import React, { useState, useMemo } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { KPICard } from '@/components/ui/KPICard';
import { AdminBreadcrumbs } from '@/components/admin/AdminBreadcrumbs';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  KeyRound, 
  UserX, 
  UserCheck, 
  ShieldCheck, 
  Eye, 
  X, 
  CheckCircle2, 
  AlertTriangle,
  Mail,
  Building2,
  Lock,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: 'MP' | 'DISTRICT_AUTHORITY' | 'IMPLEMENTING_AGENCY' | 'MONITORING_OFFICER' | 'ADMIN';
  jurisdiction: string;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  lastLogin: string;
}

const INITIAL_USERS: SystemUser[] = [
  { id: 'usr-admin-01', name: 'Shri System Admin', email: 'admin@rakshakavach.gov.in', role: 'ADMIN', jurisdiction: 'Platform Operations', status: 'ACTIVE', lastLogin: '2026-09-24 14:10' },
  { id: 'usr-mp-013', name: 'Hon\'ble Demo MP 013', email: 'mp.demo013@sansad.in', role: 'MP', jurisdiction: 'Pune Parliamentary Constituency', status: 'ACTIVE', lastLogin: '2026-09-24 12:45' },
  { id: 'usr-da-official', name: 'Dr. A. K. Sharma (District Collector)', email: 'collector.pune@maharashtra.gov.in', role: 'DISTRICT_AUTHORITY', jurisdiction: 'Pune District (D001)', status: 'ACTIVE', lastLogin: '2026-09-24 13:30' },
  { id: 'usr-mo-official', name: 'Shri S. R. Patil (Monitoring Officer)', email: 'mo.patil@pune.gov.in', role: 'MONITORING_OFFICER', jurisdiction: 'Pune District Field Unit', status: 'ACTIVE', lastLogin: '2026-09-24 11:20' },
  { id: 'usr-ia-pwd', name: 'Public Works Department (PWD Cell)', email: 'ia.pwd@pune.gov.in', role: 'IMPLEMENTING_AGENCY', jurisdiction: 'Agency ID: IA011', status: 'ACTIVE', lastLogin: '2026-09-24 10:15' },
  { id: 'usr-ia-drda', name: 'District Rural Development Agency', email: 'ia.drda@pune.gov.in', role: 'IMPLEMENTING_AGENCY', jurisdiction: 'Agency ID: IA002', status: 'ACTIVE', lastLogin: '2026-09-23 16:50' },
  { id: 'usr-mo-secondary', name: 'Smt. R. V. Kulkarni (Field Officer)', email: 'mo.kulkarni@pune.gov.in', role: 'MONITORING_OFFICER', jurisdiction: 'Haveli Sub-division', status: 'INACTIVE', lastLogin: '2026-09-18 09:30' },
  { id: 'usr-suspended-test', name: 'Test Agency Account', email: 'test.agency@temp.in', role: 'IMPLEMENTING_AGENCY', jurisdiction: 'Unverified Agency', status: 'SUSPENDED', lastLogin: '2026-08-12 14:00' },
];

export default function UserManagementPage() {
  const [users, setUsers] = useState<SystemUser[]>(INITIAL_USERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modal / Drawer States
  const [selectedUser, setSelectedUser] = useState<SystemUser | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isResetPasswordOpen, setIsResetPasswordOpen] = useState(false);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // New User Form State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<SystemUser['role']>('MONITORING_OFFICER');
  const [newJurisdiction, setNewJurisdiction] = useState('');

  // Password Reset Form State
  const [newPassword, setNewPassword] = useState('');

  // Filtered Users
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch = searchTerm === '' || 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.id.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
      const matchesStatus = statusFilter === 'ALL' || u.status === statusFilter;

      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, statusFilter]);

  // Actions
  const handleToggleUserStatus = (userId: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const nextStatus = u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
        setActionSuccessMsg(`User ${u.name} status updated to ${nextStatus}.`);
        return { ...u, status: nextStatus };
      }
      return u;
    }));
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    const newId = `usr-${newRole.toLowerCase().replace('_', '-')}-${Math.floor(100 + Math.random() * 900)}`;
    const created: SystemUser = {
      id: newId,
      name: newName,
      email: newEmail,
      role: newRole,
      jurisdiction: newJurisdiction || 'Assigned Jurisdiction',
      status: 'ACTIVE',
      lastLogin: 'Never'
    };
    setUsers(prev => [created, ...prev]);
    setActionSuccessMsg(`User persona ${newName} created successfully with ID ${newId}.`);
    setIsCreateModalOpen(false);
    setNewName('');
    setNewEmail('');
    setNewJurisdiction('');
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setActionSuccessMsg(`Password reset workflow triggered for ${selectedUser.email}. Temporary credentials issued.`);
    setIsResetPasswordOpen(false);
    setNewPassword('');
  };

  const totalUsers = users.length;
  const activeCount = users.filter(u => u.status === 'ACTIVE').length;
  const suspendedCount = users.filter(u => u.status === 'SUSPENDED').length;
  const inactiveCount = users.filter(u => u.status === 'INACTIVE').length;

  return (
    <AppShell>
      <div className="space-y-6">
        <AdminBreadcrumbs currentSection="User Management" />

        {/* Header Banner */}
        <div className="bg-white p-5 rounded-lg border border-govBorder shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-extrabold text-govNavy tracking-tight">
              User Management & Access Control
            </h1>
            <p className="text-xs text-textSecondary mt-0.5">
              Manage platform stakeholders (MP, District Collector, Monitoring Officer, Implementing Agency, Admin), assign jurisdictions, and enforce access policies.
            </p>
          </div>

          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-primaryBlue hover:bg-govNavy text-white font-bold text-xs px-4 py-2 rounded flex items-center gap-1.5 shrink-0 transition-colors shadow-xs"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create New User Persona</span>
          </button>
        </div>

        {/* Action Success Alert */}
        {actionSuccessMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{actionSuccessMsg}</span>
            </div>
            <button onClick={() => setActionSuccessMsg(null)} className="text-emerald-700 hover:text-emerald-900 font-bold text-xs">✕</button>
          </div>
        )}

        {/* KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KPICard title="Total System Users" value={totalUsers.toString()} subtitle="Registered Personas" icon={<Users className="w-5 h-5 text-primaryBlue" />} />
          <KPICard title="Active Accounts" value={activeCount.toString()} subtitle="Authorized Logins" icon={<UserCheck className="w-5 h-5 text-emerald-600" />} />
          <KPICard title="Suspended Users" value={suspendedCount.toString()} subtitle="Revoked Credentials" icon={<UserX className="w-5 h-5 text-red-600" />} accentColor="border-l-red-600" />
          <KPICard title="Inactive Users" value={inactiveCount.toString()} subtitle="Pending Invites" icon={<Lock className="w-5 h-5 text-amber-500" />} accentColor="border-l-amber-500" />
        </div>

        {/* User Table & Filters */}
        <div className="gov-card p-5 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-govBorder pb-3">
            <h3 className="text-sm font-extrabold text-govNavy uppercase tracking-wide flex items-center gap-2">
              <Users className="w-4 h-4 text-primaryBlue" />
              SYSTEM USERS REGISTRY ({filteredUsers.length})
            </h3>

            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-textSecondary absolute left-2.5 top-2.5" />
                <input 
                  type="text" 
                  placeholder="Search user name, email, or ID..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-govBg border border-govBorder rounded text-xs font-medium text-govNavy w-56 focus:outline-none focus:border-primaryBlue"
                />
              </div>

              <select 
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-govBg border border-govBorder rounded text-xs font-semibold text-govNavy focus:outline-none"
              >
                <option value="ALL">All Roles</option>
                <option value="MP">MP</option>
                <option value="DISTRICT_AUTHORITY">District Authority</option>
                <option value="MONITORING_OFFICER">Monitoring Officer</option>
                <option value="IMPLEMENTING_AGENCY">Implementing Agency</option>
                <option value="ADMIN">Admin</option>
              </select>

              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2.5 py-1.5 bg-govBg border border-govBorder rounded text-xs font-semibold text-govNavy focus:outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
                <option value="SUSPENDED">Suspended</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-govBg border-b border-govBorder text-textSecondary font-bold uppercase text-[10px]">
                  <th className="p-3">User ID</th>
                  <th className="p-3">User Name & Email</th>
                  <th className="p-3">Stakeholder Role</th>
                  <th className="p-3">Assigned Jurisdiction</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Last Login</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-govBorder">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-govBg/50">
                    <td className="p-3 font-mono font-bold text-primaryBlue">{u.id}</td>
                    <td className="p-3">
                      <strong className="text-govNavy block">{u.name}</strong>
                      <span className="text-textSecondary text-[11px] font-mono">{u.email}</span>
                    </td>
                    <td className="p-3">
                      <span className="bg-blue-100 text-blue-900 font-extrabold text-[10px] px-2 py-0.5 rounded border border-blue-200">
                        {u.role.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="p-3 font-medium text-govNavy text-[11px]">{u.jurisdiction}</td>
                    <td className="p-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        u.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-800' :
                        u.status === 'SUSPENDED' ? 'bg-red-100 text-red-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="p-3 font-mono text-[11px] text-textSecondary">{u.lastLogin}</td>
                    <td className="p-3 text-right space-x-2">
                      <button 
                        onClick={() => setSelectedUser(u)}
                        className="bg-govBg hover:bg-slate-200 text-govNavy font-bold text-[10px] px-2 py-1 rounded border border-govBorder"
                      >
                        Inspect
                      </button>
                      <button 
                        onClick={() => { setSelectedUser(u); setIsResetPasswordOpen(true); }}
                        className="bg-blue-50 hover:bg-blue-100 text-primaryBlue font-bold text-[10px] px-2 py-1 rounded border border-blue-200"
                      >
                        Reset PW
                      </button>
                      <button 
                        onClick={() => handleToggleUserStatus(u.id)}
                        className={`font-bold text-[10px] px-2 py-1 rounded text-white ${
                          u.status === 'ACTIVE' ? 'bg-red-600 hover:bg-red-700' : 'bg-emerald-600 hover:bg-emerald-700'
                        }`}
                      >
                        {u.status === 'ACTIVE' ? 'Disable' : 'Reactivate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* User Details Drawer Modal */}
        {selectedUser && !isResetPasswordOpen && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
            <div className="bg-white rounded-lg border border-govBorder max-w-lg w-full p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-govBorder pb-3">
                <h3 className="text-sm font-bold text-govNavy flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-primaryBlue" />
                  USER PERSONA PROFILE INSPECTOR
                </h3>
                <button onClick={() => setSelectedUser(null)} className="text-textSecondary hover:text-govNavy font-bold">✕</button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-govBg border border-govBorder rounded space-y-1">
                  <span className="text-[10px] font-bold text-textSecondary uppercase block">USER IDENTIFIER</span>
                  <p className="font-mono font-bold text-primaryBlue text-sm">{selectedUser.id}</p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-[10px] text-textSecondary font-semibold block">Full Name</span>
                    <strong className="text-govNavy">{selectedUser.name}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-textSecondary font-semibold block">Official Email</span>
                    <strong className="text-govNavy font-mono">{selectedUser.email}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-textSecondary font-semibold block">Stakeholder Role</span>
                    <span className="bg-blue-100 text-blue-900 font-bold text-[10px] px-1.5 py-0.5 rounded">
                      {selectedUser.role}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-textSecondary font-semibold block">Account Status</span>
                    <span className="font-bold text-emerald-700">{selectedUser.status}</span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-textSecondary font-semibold block mb-0.5">Assigned Jurisdiction / Scope</span>
                  <p className="p-2 bg-white border border-govBorder rounded text-govNavy font-bold">{selectedUser.jurisdiction}</p>
                </div>
              </div>

              <div className="text-right pt-2 border-t border-govBorder">
                <button onClick={() => setSelectedUser(null)} className="px-4 py-1.5 bg-govNavy text-white font-bold text-xs rounded">Close Profile</button>
              </div>
            </div>
          </div>
        )}

        {/* Create User Modal */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
            <div className="bg-white rounded-lg border border-govBorder max-w-md w-full p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-govBorder pb-3">
                <h3 className="text-sm font-bold text-govNavy flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-primaryBlue" />
                  CREATE NEW SYSTEM PERSONA
                </h3>
                <button onClick={() => setIsCreateModalOpen(false)} className="text-textSecondary hover:text-govNavy font-bold">✕</button>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
                <div>
                  <label className="block font-semibold text-textPrimary mb-1">Full Officer Name *</label>
                  <input 
                    type="text" 
                    value={newName} 
                    onChange={e => setNewName(e.target.value)}
                    className="w-full p-2 bg-white border border-govBorder rounded text-xs font-bold text-govNavy"
                    placeholder="e.g. Smt. A. N. Deshmukh"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-textPrimary mb-1">Official Email Address *</label>
                  <input 
                    type="email" 
                    value={newEmail} 
                    onChange={e => setNewEmail(e.target.value)}
                    className="w-full p-2 bg-white border border-govBorder rounded text-xs font-mono text-govNavy"
                    placeholder="officer@nic.in"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-textPrimary mb-1">Stakeholder Role *</label>
                  <select 
                    value={newRole}
                    onChange={e => setNewRole(e.target.value as any)}
                    className="w-full p-2 bg-white border border-govBorder rounded text-xs font-semibold text-govNavy"
                  >
                    <option value="MONITORING_OFFICER">MONITORING_OFFICER (Field Verification)</option>
                    <option value="IMPLEMENTING_AGENCY">IMPLEMENTING_AGENCY (Execution)</option>
                    <option value="DISTRICT_AUTHORITY">DISTRICT_AUTHORITY (Governance)</option>
                    <option value="MP">MP (Hon'ble Member of Parliament)</option>
                    <option value="ADMIN">ADMIN (System Platform Admin)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-textPrimary mb-1">Assigned Jurisdiction / Agency *</label>
                  <input 
                    type="text" 
                    value={newJurisdiction} 
                    onChange={e => setNewJurisdiction(e.target.value)}
                    className="w-full p-2 bg-white border border-govBorder rounded text-xs text-govNavy"
                    placeholder="e.g. Pune District Field Unit / Agency IA015"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-govBorder">
                  <button type="button" onClick={() => setIsCreateModalOpen(false)} className="px-3 py-1.5 bg-govBg text-govNavy font-bold rounded">Cancel</button>
                  <button type="submit" className="px-4 py-1.5 bg-primaryBlue text-white font-bold rounded">Create User</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Password Reset Modal */}
        {isResetPasswordOpen && selectedUser && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
            <div className="bg-white rounded-lg border border-govBorder max-w-sm w-full p-5 space-y-4 shadow-xl">
              <div className="flex items-center justify-between border-b border-govBorder pb-3">
                <h3 className="text-sm font-bold text-govNavy flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-amber-600" />
                  RESET CREDENTIALS
                </h3>
                <button onClick={() => setIsResetPasswordOpen(false)} className="text-textSecondary hover:text-govNavy font-bold">✕</button>
              </div>

              <form onSubmit={handleResetPassword} className="space-y-3 text-xs">
                <p className="text-textSecondary">
                  Trigger credential reset for <strong>{selectedUser.name}</strong> ({selectedUser.email}).
                </p>

                <div>
                  <label className="block font-semibold text-textPrimary mb-1">New Temporary Password *</label>
                  <input 
                    type="text" 
                    value={newPassword} 
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="Enter temp password..."
                    className="w-full p-2 bg-white border border-govBorder rounded text-xs font-mono"
                    required
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setIsResetPasswordOpen(false)} className="px-3 py-1.5 bg-govBg text-govNavy font-bold rounded">Cancel</button>
                  <button type="submit" className="px-4 py-1.5 bg-amber-600 text-white font-bold rounded">Issue Temp Password</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
