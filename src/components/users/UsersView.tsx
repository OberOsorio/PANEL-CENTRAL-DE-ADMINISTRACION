import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { User } from '../../types';
import {
  Plus,
  Search,
  Mail,
  Shield,
  UserCheck,
  UserX,
  Laptop,
  Globe,
  Trash2,
  X,
  CheckCircle2,
  Send,
  Lock,
  Eye,
  EyeOff,
  Copy,
  Check,
  Edit,
} from 'lucide-react';

export const UsersView: React.FC = () => {
  const {
    users,
    roles,
    clients,
    sessions,
    addUser,
    updateUserStatus,
    updateUser,
    deleteUser,
    terminateSession,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('TODOS');
  const [isNewUserModalOpen, setIsNewUserModalOpen] = useState(false);
  const [isEditUserModalOpen, setIsEditUserModalOpen] = useState(false);
  const [selectedUserToEdit, setSelectedUserToEdit] = useState<User | null>(null);

  // New User Form State
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [userPassword, setUserPassword] = useState('Campaña2026!');
  const [phone, setPhone] = useState('');
  const [clientId, setClientId] = useState(clients[0]?.id || '');
  const [roleId, setRoleId] = useState(roles[1]?.id || '');

  // Edit User Form State
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editClientId, setEditClientId] = useState('');
  const [editRoleId, setEditRoleId] = useState('');

  const [visiblePasswords, setVisiblePasswords] = useState<Record<string, boolean>>({});
  const [copiedUserId, setCopiedUserId] = useState<string | null>(null);

  const togglePasswordVisibility = (userId: string) => {
    setVisiblePasswords((prev) => ({ ...prev, [userId]: !prev[userId] }));
  };

  const handleCopyPassword = (userId: string, pass: string) => {
    navigator.clipboard.writeText(pass);
    setCopiedUserId(userId);
    setTimeout(() => setCopiedUserId(null), 2000);
  };

  const [invitationSuccessMsg, setInvitationSuccessMsg] = useState<string | null>(null);

  const filteredUsers = (Array.isArray(users) ? users : []).filter((u) => {
    if (!u) return false;
    const fullName = `${u.firstName || ''} ${u.lastName || ''}`;
    const email = u.email || '';
    const clientName = u.clientName || '';

    const matchesSearch =
      fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      clientName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesRole = selectedRole === 'TODOS' || u.roleName === selectedRole;

    return matchesSearch && matchesRole;
  });

  const handleOpenEditModal = (user: User) => {
    setSelectedUserToEdit(user);
    setEditFirstName(user.firstName);
    setEditLastName(user.lastName);
    setEditEmail(user.email);
    setEditPassword(user.password || '');
    setEditPhone(user.phone || '');
    setEditClientId(user.clientId);
    setEditRoleId(user.roleId);
    setIsEditUserModalOpen(true);
  };

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserToEdit) return;

    const client = clients.find((c) => c.id === editClientId);
    const role = roles.find((r) => r.id === editRoleId);

    updateUser(selectedUserToEdit.id, {
      firstName: editFirstName,
      lastName: editLastName,
      email: editEmail,
      password: editPassword,
      phone: editPhone,
      clientId: editClientId,
      clientName: client ? client.organizationName : selectedUserToEdit.clientName,
      roleId: editRoleId,
      roleName: role ? role.name : selectedUserToEdit.roleName,
    });

    setIsEditUserModalOpen(false);
    setSelectedUserToEdit(null);
  };

  const handleDeleteUser = (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este usuario de forma permanente?')) {
      deleteUser(id);
    }
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    const client = clients.find((c) => c.id === clientId);
    const role = roles.find((r) => r.id === roleId);

    const newUser = addUser({
      firstName,
      lastName,
      email: email.trim().toLowerCase(),
      password: userPassword || 'Campaña2026!',
      phone,
      clientId,
      clientName: client ? client.organizationName : 'Campaña Ganadora AI',
      roleId,
      roleName: role ? role.name : 'Usuario',
      status: 'Pendiente Invitación',
      ipAddress: '190.158.204.12',
    });

    setInvitationSuccessMsg(`Invitación enviada exitosamente a ${newUser.email}`);
    setIsNewUserModalOpen(false);
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setUserPassword('Campaña2026!');
    setClientId(clients[0]?.id || '');
    setRoleId(roles[1]?.id || '');
    setTimeout(() => setInvitationSuccessMsg(null), 5000);
  };

  const handleOpenNewUserModal = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setUserPassword('Campaña2026!');
    setClientId(clients[0]?.id || '');
    setRoleId(roles[1]?.id || '');
    setIsNewUserModalOpen(false); // Make sure it's closed before opening (optional)
    setIsNewUserModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div />

        <button
          onClick={handleOpenNewUserModal}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-purple-600/30 hover:bg-purple-500 transition-all shrink-0"
        >
          <Plus className="h-4 w-4" />
          Crear Nuevo Usuario
        </button>
      </div>

      {invitationSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2">
          <Send className="h-4 w-4 text-emerald-600" />
          {invitationSuccessMsg}
        </div>
      )}

      {/* Search and Role Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar usuario por nombre, correo, cliente..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['TODOS', 'Super Admin', 'Administrador del Cliente', 'Director de Campaña', 'Coordinador'].map((r) => (
            <button
              key={r}
              onClick={() => setSelectedRole(r)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all whitespace-nowrap ${
                selectedRole === r
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Users List Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Usuario / Correo</th>
                <th className="py-3 px-4">Organización (Cliente)</th>
                <th className="py-3 px-4">Contraseña de Acceso</th>
                <th className="py-3 px-4">Rol Asignado</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4">Último Acceso</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredUsers.map((u) => {
                const pass = u.password || 'Campaña2026!';
                const isVisible = visiblePasswords[u.id] ?? false;
                const isCopied = copiedUserId === u.id;

                return (
                  <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {u.firstName} {u.lastName}
                      </div>
                      <div className="text-[10px] text-slate-400">{u.email}</div>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-700 dark:text-slate-300">
                      {u.clientName}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="inline-flex items-center gap-1.5 bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/80 px-2 py-0.5 rounded-lg">
                        <Lock className="h-3 w-3 text-purple-600 dark:text-purple-400 shrink-0" />
                        <span className="font-mono text-xs font-bold text-purple-900 dark:text-purple-200">
                          {isVisible ? pass : '••••••••••••'}
                        </span>
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility(u.id)}
                          className="text-purple-400 hover:text-purple-700 dark:hover:text-purple-200 ml-1"
                          title={isVisible ? "Ocultar contraseña" : "Mostrar contraseña"}
                        >
                          {isVisible ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleCopyPassword(u.id, pass)}
                          className="text-purple-500 hover:text-purple-800 dark:hover:text-purple-200"
                          title="Copiar contraseña"
                        >
                          {isCopied ? <Check className="h-3 w-3 text-emerald-600" /> : <Copy className="h-3 w-3" />}
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-purple-600 dark:text-purple-400">{u.roleName}</span>
                    </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        u.status === 'Activo'
                          ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : u.status === 'Suspendido'
                          ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300'
                          : 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300'
                      }`}
                    >
                      {u.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-500">{u.lastAccessAt}</td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {u.status === 'Activo' ? (
                        <button
                          type="button"
                          onClick={() => updateUserStatus(u.id, 'Suspendido')}
                          className="rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-950/50 dark:text-rose-300 px-2.5 py-1 text-[11px] font-bold"
                        >
                          Suspender
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => updateUserStatus(u.id, 'Activo')}
                          className="rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300 px-2.5 py-1 text-[11px] font-bold"
                        >
                          Activar
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(u)}
                        className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                        title="Modificar"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteUser(u.id)}
                        className="p-1 rounded-lg border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 20. CONTROL DE SESIONES ACTIVAS */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Laptop className="h-4 w-4 text-purple-600" />
              Monitor de Sesiones Activas en Tiempo Real
            </h3>
            <p className="text-xs text-slate-500">
              Permite al Super Admin cerrar remotamente sesiones activas sospechosas o de usuarios inactivos.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sessions.map((s) => (
            <div
              key={s.id}
              className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 p-4 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white">{s.userName}</span>
                {s.isCurrentSession && (
                  <span className="rounded-full bg-purple-100 text-purple-800 px-2 py-0.5 text-[10px] font-bold">
                    Tu Sesión
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500">{s.clientName} • {s.roleName}</p>
              <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 text-[10px] text-slate-400 space-y-1">
                <p>IP: <span className="font-mono">{s.ipAddress}</span></p>
                <p>Dispositivo: {s.device} ({s.browser})</p>
                <p>Última Actividad: {s.lastActiveAt}</p>
              </div>
              {!s.isCurrentSession && (
                <button
                  onClick={() => terminateSession(s.id)}
                  className="w-full mt-2 rounded-lg bg-rose-600 py-1.5 text-center text-white font-bold text-[11px] hover:bg-rose-500"
                >
                  Cerrar Sesión Remotamente
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* New User Modal */}
      {isNewUserModalOpen && (
        <div
          onClick={() => setIsNewUserModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in"
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleCreateUser}
            className="relative w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Crear e Invitar Nuevo Usuario
              </h3>
              <button
                type="button"
                onClick={() => setIsNewUserModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full rounded-xl border p-2.5 bg-slate-50 dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Apellidos</label>
                <input
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full rounded-xl border p-2.5 bg-slate-50 dark:bg-slate-800"
                />
              </div>
              <div className="col-span-2">
                <label className="block font-bold mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border p-2.5 bg-slate-50 dark:bg-slate-800"
                />
              </div>
              <div className="col-span-2">
                <label className="block font-bold mb-1">Contraseña de Acceso Asignada</label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={userPassword}
                    onChange={(e) => setUserPassword(e.target.value)}
                    className="w-full rounded-xl border p-2.5 bg-purple-50/50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800 font-mono font-bold text-purple-900 dark:text-purple-200"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Contraseña con la que el usuario podrá autenticarse inicialmente.
                </p>
              </div>
              <div className="col-span-2">
                <label className="block font-bold mb-1">Organización / Cliente</label>
                <select
                  value={clientId}
                  onChange={(e) => setClientId(e.target.value)}
                  className="w-full rounded-xl border p-2.5 bg-slate-50 dark:bg-slate-800"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.organizationName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block font-bold mb-1">Rol en el Sistema</label>
                <select
                  value={roleId}
                  onChange={(e) => setRoleId(e.target.value)}
                  className="w-full rounded-xl border p-2.5 bg-slate-50 dark:bg-slate-800"
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsNewUserModalOpen(false)}
                className="rounded-xl border px-4 py-2 text-xs font-bold text-slate-600"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rounded-xl bg-purple-600 px-5 py-2 text-xs font-bold text-white hover:bg-purple-500 shadow"
              >
                Enviar Invitación
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Edit User Modal */}
      {isEditUserModalOpen && selectedUserToEdit && (
        <div
          onClick={() => setIsEditUserModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in"
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleUpdateUser}
            className="relative w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Modificar Datos de Usuario
              </h3>
              <button
                type="button"
                onClick={() => setIsEditUserModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  value={editFirstName}
                  onChange={(e) => setEditFirstName(e.target.value)}
                  className="w-full rounded-xl border p-2.5 bg-slate-50 dark:bg-slate-800"
                />
              </div>
              <div>
                <label className="block font-bold mb-1">Apellidos</label>
                <input
                  type="text"
                  required
                  value={editLastName}
                  onChange={(e) => setEditLastName(e.target.value)}
                  className="w-full rounded-xl border p-2.5 bg-slate-50 dark:bg-slate-800"
                />
              </div>
              <div className="col-span-2">
                <label className="block font-bold mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full rounded-xl border p-2.5 bg-slate-50 dark:bg-slate-800"
                />
              </div>
              <div className="col-span-2">
                <label className="block font-bold mb-1">Contraseña de Acceso</label>
                <input
                  type="text"
                  required
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  className="w-full rounded-xl border p-2.5 bg-purple-50/50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800 font-mono font-bold text-purple-900 dark:text-purple-200"
                />
              </div>
              <div className="col-span-2">
                <label className="block font-bold mb-1">Organización / Cliente</label>
                <select
                  value={editClientId}
                  onChange={(e) => setEditClientId(e.target.value)}
                  className="w-full rounded-xl border p-2.5 bg-slate-50 dark:bg-slate-800"
                >
                  <option value="GLOBAL">PANEL CENTRAL CENTRAL</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.organizationName}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-span-2">
                <label className="block font-bold mb-1">Rol en el Sistema</label>
                <select
                  value={editRoleId}
                  onChange={(e) => setEditRoleId(e.target.value)}
                  className="w-full rounded-xl border p-2.5 bg-slate-50 dark:bg-slate-800"
                >
                  {roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsEditUserModalOpen(false)}
                className="rounded-xl border px-4 py-2 text-xs font-bold text-slate-600"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="rounded-xl bg-purple-600 px-5 py-2 text-xs font-bold text-white hover:bg-purple-500 shadow"
              >
                Guardar Cambios
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
