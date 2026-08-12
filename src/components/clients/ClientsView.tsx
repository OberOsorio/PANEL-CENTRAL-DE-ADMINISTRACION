import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Client, ClientStatus } from '../../types';
import { NewClientWizard } from './NewClientWizard';
import { ClientDetailModal } from './ClientDetailModal';
import {
  Plus,
  Search,
  Filter,
  ShieldCheck,
  ShieldAlert,
  Clock,
  Eye,
  KeyRound,
  MoreVertical,
  ChevronRight,
  UserCheck,
  AlertTriangle,
  Bell,
  Edit,
  Trash2,
  X,
  ChevronDown,
  Check,
} from 'lucide-react';
import { COLOMBIA_DEPARTMENTS } from '../../data/colombiaData';

interface SearchableDropdownProps {
  label: string;
  placeholder: string;
  options: string[];
  value: string;
  onChange: (val: string) => void;
  error?: string;
}

const SearchableDropdown: React.FC<SearchableDropdownProps> = ({
  label,
  placeholder,
  options,
  value,
  onChange,
  error,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  
  const filteredOptions = options.filter(opt =>
    opt.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative text-xs">
      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`w-full flex items-center justify-between rounded-xl border bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white transition-all text-left focus:ring-1 focus:ring-purple-500 focus:border-purple-500 ${
          error ? 'border-red-500' : 'border-slate-200 dark:border-slate-700'
        }`}
      >
        <span className={value ? 'text-slate-900 dark:text-white' : 'text-slate-400'}>
          {value || placeholder}
        </span>
        <ChevronDown className="h-4 w-4 text-slate-400" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="fixed inset-0" onClick={() => setIsOpen(false)} />
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden flex flex-col max-h-[80vh] z-10 animate-in zoom-in-95 duration-150">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">{label.replace(' *', '')}</h3>
              <button 
                type="button" 
                onClick={() => setIsOpen(false)} 
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-3 bg-slate-50/50 dark:bg-slate-950/20 border-b border-slate-100 dark:border-slate-800">
              <input
                type="text"
                autoFocus
                placeholder="Buscar..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div className="overflow-y-auto flex-1 p-2">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      onChange(opt);
                      setIsOpen(false);
                      setSearch('');
                    }}
                    className={`w-full text-left p-3 text-xs rounded-xl hover:bg-purple-50 dark:hover:bg-purple-950/40 hover:text-purple-600 dark:hover:text-purple-400 transition-all flex items-center justify-between mb-1 ${
                      value === opt ? 'bg-purple-50/60 dark:bg-purple-950/30 text-purple-600 font-bold' : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>{opt}</span>
                    {value === opt && <Check className="h-4 w-4 text-purple-600" />}
                  </button>
                ))
              ) : (
                <div className="p-8 text-center text-xs text-slate-400">
                  No se encontraron resultados para "{search}"
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      {error && <span className="text-red-500 text-[10px] mt-1 block font-medium">{error}</span>}
    </div>
  );
};

export const ClientsView: React.FC = () => {
  const { clients, licenses, plans, updateClient, deleteClient, toggleClientStatus, triggerExpiredDemoModal } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('TODOS');
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [selectedClientForDetail, setSelectedClientForDetail] = useState<Client | null>(null);

  // Edit Client Modal State
  const [isEditClientModalOpen, setIsEditClientModalOpen] = useState(false);
  const [selectedClientToEdit, setSelectedClientToEdit] = useState<Client | null>(null);

  // Edit Client Form State
  const [editOrgName, setEditOrgName] = useState('');
  const [editTaxId, setEditTaxId] = useState('');
  const [editResponsibleName, setEditResponsibleName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editCountry, setEditCountry] = useState('Colombia');
  const [editAspiration, setEditAspiration] = useState<'Gobernación' | 'Asamblea' | 'Alcaldía' | 'Concejo'>('Alcaldía');
  const [editDepartment, setEditDepartment] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editPlanId, setEditPlanId] = useState('');
  const [editStatus, setEditStatus] = useState<ClientStatus>('Activo');
  const [editNotes, setEditNotes] = useState('');

  const handleOpenEdit = (client: Client) => {
    setSelectedClientToEdit(client);
    setEditOrgName(client.organizationName);
    setEditTaxId(client.taxId);
    setEditResponsibleName(client.responsibleName);
    setEditEmail(client.email);
    setEditPhone(client.phone);
    setEditCountry(client.country);
    setEditAspiration(client.aspiration || 'Alcaldía');
    setEditDepartment(client.department);
    setEditCity(client.city);
    setEditPlanId(client.planId);
    setEditStatus(client.status);
    setEditNotes(client.notes || '');
    setIsEditClientModalOpen(true);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientToEdit) return;

    const plan = plans.find((p) => p.id === editPlanId);

    updateClient(selectedClientToEdit.id, {
      organizationName: editOrgName,
      taxId: editTaxId,
      responsibleName: editResponsibleName,
      email: editEmail,
      phone: editPhone,
      country: editCountry,
      department: editDepartment,
      city: (editAspiration === 'Gobernación' || editAspiration === 'Asamblea') ? '' : editCity,
      aspiration: editAspiration,
      planId: editPlanId,
      planName: plan ? plan.name : selectedClientToEdit.planName,
      status: editStatus,
      notes: editNotes,
    });

    setIsEditClientModalOpen(false);
    setSelectedClientToEdit(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este cliente y todos sus datos relacionados (licencias, campañas, usuarios, suscripciones y facturas)? Esta acción no se puede deshacer.')) {
      deleteClient(id);
    }
  };

  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      c.organizationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.responsibleName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.taxId.includes(searchQuery) ||
      c.city.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = selectedStatus === 'TODOS' || c.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Title & Onboarding CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div />

        <button
          onClick={() => setIsWizardOpen(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-lg shadow-purple-600/30 hover:from-purple-500 hover:to-indigo-500 transition-all shrink-0"
        >
          <Plus className="h-4 w-4" />
          Crear Nuevo Cliente
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por organización, NIT, responsable, ciudad..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
          {['TODOS', 'Activo', 'Próximo a vencer', 'Vencido', 'Suspendido'].map((st) => (
            <button
              key={st}
              onClick={() => setSelectedStatus(st)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all whitespace-nowrap ${
                selectedStatus === st
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Clients Table / Grid */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Organización / NIT</th>
                <th className="py-3 px-4">Responsable</th>
                <th className="py-3 px-4">Plan</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4">Ubicación</th>
                <th className="py-3 px-4">Usuarios</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredClients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    No se encontraron clientes con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredClients.map((client) => (
                  <tr key={client.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        {client.organizationName}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {client.id} • NIT: {client.taxId}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">{client.responsibleName}</div>
                      <div className="text-[10px] text-slate-400">{client.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-purple-600 dark:text-purple-400">{client.planName}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          client.status === 'Activo'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                            : client.status === 'Próximo a vencer'
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800 animate-pulse'
                            : client.status === 'Vencido'
                            ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {client.status === 'Próximo a vencer' && <Bell className="h-3 w-3 text-amber-600 dark:text-amber-400" />}
                        {client.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                      {client.city}, {client.department}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                      {client.activeUsersCount} / {client.maxUsersAllowed === -1 ? '∞' : client.maxUsersAllowed}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {(client.planId === 'plan-demo' ||
                          licenses.find((l) => l.clientId === client.id)?.licenseType === 'Especial Demo') && (
                          <button
                            onClick={() => triggerExpiredDemoModal(client.organizationName, 'Vencida')}
                            className="inline-flex items-center gap-1 rounded-lg bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 px-2 py-1 text-[11px] font-extrabold text-rose-700 dark:text-rose-300 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors"
                            title="Ver pantalla emergente de Demo Vencida"
                          >
                            <AlertTriangle className="h-3.5 w-3.5 text-rose-600 dark:text-rose-400" />
                            Alerta Demo
                          </button>
                        )}
                        <button
                          onClick={() => setSelectedClientForDetail(client)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 px-2.5 py-1 text-[11px] font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                        >
                          <Eye className="h-3.5 w-3.5 text-purple-600" />
                          Perfil Completo
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenEdit(client)}
                          className="p-1 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors"
                          title="Modificar"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDelete(client.id)}
                          className="p-1 rounded-lg border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-rose-600 dark:text-rose-400 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Client Onboarding Wizard */}
      <NewClientWizard isOpen={isWizardOpen} onClose={() => setIsWizardOpen(false)} />

      {/* Client Full Detail Drawer / Modal */}
      <ClientDetailModal
        client={selectedClientForDetail}
        onClose={() => setSelectedClientForDetail(null)}
      />

      {/* Edit Client Modal */}
      {isEditClientModalOpen && selectedClientToEdit && (
        <div
          onClick={() => setIsEditClientModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in"
        >
          <form
            onClick={(e) => e.stopPropagation()}
            onSubmit={handleUpdate}
            className="relative w-full max-w-2xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Modificar Datos del Cliente (Organización)
              </h3>
              <button
                type="button"
                onClick={() => setIsEditClientModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold mb-1">Nombre de Organización</label>
                <input
                  type="text"
                  required
                  value={editOrgName}
                  onChange={(e) => setEditOrgName(e.target.value)}
                  className="w-full rounded-xl border p-2.5 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">NIT / Tax ID</label>
                <input
                  type="text"
                  required
                  value={editTaxId}
                  onChange={(e) => setEditTaxId(e.target.value)}
                  className="w-full rounded-xl border p-2.5 bg-slate-50 dark:bg-slate-800 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Nombre del Responsable</label>
                <input
                  type="text"
                  required
                  value={editResponsibleName}
                  onChange={(e) => setEditResponsibleName(e.target.value)}
                  className="w-full rounded-xl border p-2.5 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full rounded-xl border p-2.5 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Teléfono</label>
                <input
                  type="text"
                  required
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  className="w-full rounded-xl border p-2.5 bg-slate-50 dark:bg-slate-800 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">País</label>
                <input
                  type="text"
                  required
                  value={editCountry}
                  onChange={(e) => setEditCountry(e.target.value)}
                  className="w-full rounded-xl border p-2.5 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Aspiración Política</label>
                <select
                  value={editAspiration}
                  onChange={(e) => {
                    const val = e.target.value as any;
                    setEditAspiration(val);
                    if (val === 'Gobernación' || val === 'Asamblea') {
                      setEditCity('');
                    }
                  }}
                  className="w-full rounded-xl border p-2.5 bg-slate-50 dark:bg-slate-800"
                >
                  <option value="Gobernación">Gobernación</option>
                  <option value="Asamblea">Asamblea</option>
                  <option value="Alcaldía">Alcaldía</option>
                  <option value="Concejo">Concejo</option>
                </select>
              </div>

              <SearchableDropdown
                label="Departamento / Estado"
                placeholder="Selecciona un departamento"
                options={COLOMBIA_DEPARTMENTS.map((d) => d.name)}
                value={editDepartment}
                onChange={(val) => {
                  setEditDepartment(val);
                  setEditCity('');
                }}
              />

              {(editAspiration === 'Alcaldía' || editAspiration === 'Concejo') ? (
                <SearchableDropdown
                  label="Municipio / Ciudad"
                  placeholder={editDepartment ? "Selecciona un municipio" : "Selecciona primero un departamento"}
                  options={
                    COLOMBIA_DEPARTMENTS.find((d) => d.name === editDepartment)?.municipalities || []
                  }
                  value={editCity}
                  onChange={(val) => setEditCity(val)}
                />
              ) : (
                <div />
              )}

              <div>
                <label className="block font-bold mb-1">Plan Comercial Asignado</label>
                <select
                  value={editPlanId}
                  onChange={(e) => setEditPlanId(e.target.value)}
                  className="w-full rounded-xl border p-2.5 bg-slate-50 dark:bg-slate-800"
                >
                  {plans.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1">Estado del Cliente</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as any)}
                  className="w-full rounded-xl border p-2.5 bg-slate-50 dark:bg-slate-800"
                >
                  <option value="Activo">Activo</option>
                  <option value="Próximo a vencer">Próximo a vencer</option>
                  <option value="Vencido">Vencido</option>
                  <option value="Suspendido">Suspendido</option>
                </select>
              </div>

              <div className="col-span-2">
                <label className="block font-bold mb-1">Notas Administrativas</label>
                <textarea
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  className="w-full rounded-xl border p-2.5 bg-slate-50 dark:bg-slate-800 h-16"
                  placeholder="Notas internas de soporte o condiciones comerciales del cliente..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setIsEditClientModalOpen(false)}
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
