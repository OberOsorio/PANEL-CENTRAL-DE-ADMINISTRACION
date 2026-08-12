import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  CheckCircle2,
  Building2,
  UserCheck,
  Layers,
  KeyRound,
  Calendar,
  Sliders,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Check,
  Clock,
  AlertTriangle,
  Lock,
  Eye,
  EyeOff,
  RefreshCw,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react';
import { COLOMBIA_DEPARTMENTS } from '../../data/colombiaData';

interface NewClientWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

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

export const NewClientWizard: React.FC<NewClientWizardProps> = ({ isOpen, onClose }) => {
  const { plans, modules, addClientWithLicense } = useApp();

  const [step, setStep] = useState<number>(1);

  // Step 1: Organization Info
  const [organizationName, setOrganizationName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [country, setCountry] = useState('Colombia');
  const [aspiration, setAspiration] = useState<'Gobernación' | 'Asamblea' | 'Alcaldía' | 'Concejo'>('Alcaldía');
  const [department, setDepartment] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');

  // Validation errors state
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep1 = () => {
    const errs: Record<string, string> = {};
    
    if (!organizationName.trim()) {
      errs.organizationName = 'El nombre de la organización es obligatorio.';
    } else if (organizationName.trim().length < 3) {
      errs.organizationName = 'Debe tener al menos 3 caracteres.';
    }
    
    // Identification / NIT regex allowing numbers, hyphens, dots
    const nitRegex = /^\d[\d.,-]*\d$/;
    if (!taxId.trim()) {
      errs.taxId = 'El Documento de Identificación / NIT es obligatorio.';
    } else if (taxId.trim().length < 5) {
      errs.taxId = 'El NIT debe tener al menos 5 caracteres.';
    } else if (!nitRegex.test(taxId.trim())) {
      errs.taxId = 'Formato de NIT no válido (solo números, puntos, comas o guiones).';
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      errs.email = 'El correo electrónico institucional es obligatorio.';
    } else if (!emailRegex.test(email.trim())) {
      errs.email = 'Formato de correo electrónico no válido.';
    }
    
    // Phone regex
    const phoneRegex = /^\+?[\d\s-]{7,15}$/;
    if (!phone.trim()) {
      errs.phone = 'El teléfono de contacto es obligatorio.';
    } else if (!phoneRegex.test(phone.trim())) {
      errs.phone = 'Número de teléfono no válido (7 a 15 dígitos).';
    }
    
    if (!country.trim()) {
      errs.country = 'El país es obligatorio.';
    } else if (country.trim().length < 3) {
      errs.country = 'Nombre de país demasiado corto.';
    }
    
    if (!department.trim()) {
      errs.department = 'El departamento/estado es obligatorio.';
    } else if (department.trim().length < 2) {
      errs.department = 'Nombre de departamento demasiado corto.';
    }
    
    if (aspiration === 'Alcaldía' || aspiration === 'Concejo') {
      if (!city.trim()) {
        errs.city = 'El municipio/ciudad es obligatorio.';
      } else if (city.trim().length < 2) {
        errs.city = 'Nombre de municipio demasiado corto.';
      }
    }
    
    if (!notes.trim()) {
      errs.notes = 'Las notas de la organización son obligatorias.';
    } else if (notes.trim().length < 5) {
      errs.notes = 'Debe escribir notas descriptivas (mínimo 5 caracteres).';
    }
    
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateStep2 = () => {
    const errs: Record<string, string> = {};
    
    if (!adminName.trim()) {
      errs.adminName = 'El nombre completo del responsable es obligatorio.';
    } else if (adminName.trim().length < 3) {
      errs.adminName = 'Debe tener al menos 3 caracteres.';
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!adminEmail.trim()) {
      errs.adminEmail = 'El correo del administrador es obligatorio.';
    } else if (!emailRegex.test(adminEmail.trim())) {
      errs.adminEmail = 'Formato de correo electrónico no válido.';
    }
    
    if (!adminPassword) {
      errs.adminPassword = 'La contraseña es obligatoria.';
    } else if (adminPassword.length < 8) {
      errs.adminPassword = 'La contraseña debe tener al menos 8 caracteres.';
    } else {
      const hasUpper = /[A-Z]/.test(adminPassword);
      const hasLower = /[a-z]/.test(adminPassword);
      const hasDigit = /\d/.test(adminPassword);
      const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(adminPassword);
      
      if (!hasUpper || !hasLower || !hasDigit || !hasSpecial) {
        errs.adminPassword = 'La contraseña debe incluir mayúsculas, minúsculas, números y un carácter especial.';
      }
    }
    
    if (adminPassword !== confirmPassword) {
      errs.confirmPassword = 'Las contraseñas no coinciden.';
    }
    
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNextStep = () => {
    if (step === 1) {
      if (!validateStep1()) return;
    } else if (step === 2) {
      if (!validateStep2()) return;
    }
    setStep(step + 1);
  };

  // Step 2: Responsible Admin Info & Password
  const [adminName, setAdminName] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('Campaña2026!');
  const [confirmPassword, setConfirmPassword] = useState('Campaña2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Auto-generate strong password
  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let newPass = 'CG2026!';
    for (let i = 0; i < 6; i++) {
      newPass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setAdminPassword(newPass);
    setConfirmPassword(newPass);
    setShowPassword(true);
  };

  // Step 3: Plan Selection
  const [selectedPlanId, setSelectedPlanId] = useState<string>('plan-pro');

  // Step 4: License configuration
  const [licenseType, setLicenseType] = useState<string>('Anual');

  // Step 5: Duration in months or demo days
  const [durationMonths, setDurationMonths] = useState<number>(12);
  const [demoDurationDays, setDemoDurationDays] = useState<number>(3);

  // Step 6: Limits & Modules
  const selectedPlan = plans.find((p) => p.id === selectedPlanId) || plans[1];
  const [enabledModules, setEnabledModules] = useState<string[]>(selectedPlan.allowedModuleCodes);

  // Sync admin email when org email changes if empty
  const handleOrgEmailChange = (val: string) => {
    setEmail(val);
    if (!adminEmail) setAdminEmail(val);
  };

  if (!isOpen) return null;

  const handleToggleModule = (code: string) => {
    if (enabledModules.includes(code)) {
      setEnabledModules(enabledModules.filter((m) => m !== code));
    } else {
      setEnabledModules([...enabledModules, code]);
    }
  };

  const handleSelectPlan = (planId: string) => {
    setSelectedPlanId(planId);
    const p = plans.find((pl) => pl.id === planId);
    if (p) {
      setEnabledModules(p.allowedModuleCodes);
      if (p.code === 'DEMO') {
        setLicenseType('Especial Demo');
      }
    }
  };

  const handleCompleteWizard = () => {
    addClientWithLicense(
      {
        organizationName,
        responsibleName: adminName || 'Administrador',
        taxId,
        email,
        phone,
        country,
        department,
        city: (aspiration === 'Gobernación' || aspiration === 'Asamblea') ? '' : city,
        aspiration,
        planId: selectedPlan.id,
        planName: selectedPlan.name,
        maxUsersAllowed: selectedPlan.maxUsers,
        notes,
      },
      durationMonths,
      enabledModules,
      adminEmail || email,
      adminName || 'Admin',
      licenseType,
      demoDurationDays,
      adminPassword
    );
    onClose();
  };

  const stepsHeader = [
    { num: 1, label: 'Organización', icon: Building2 },
    { num: 2, label: 'Administrador', icon: UserCheck },
    { num: 3, label: 'Plan', icon: Layers },
    { num: 4, label: 'Licencia', icon: KeyRound },
    { num: 5, label: 'Vigencia', icon: Calendar },
    { num: 6, label: 'Límites & Módulos', icon: Sliders },
    { num: 7, label: 'Confirmación', icon: CheckCircle2 },
  ];

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in overflow-y-auto"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-6xl rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden my-4"
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 z-10 rounded-lg p-2 text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-800"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Step Indicator Bar */}
        <div className="border-b border-slate-100 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-950/40 px-4 py-3 overflow-x-auto">
          <div className="flex items-center justify-between min-w-[600px] gap-2">
            {stepsHeader.map((s) => {
              const Icon = s.icon;
              const isDone = step > s.num;
              const isCurrent = step === s.num;
              return (
                <div key={s.num} className="flex items-center gap-2">
                  <div
                    className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold transition-all ${
                      isDone
                        ? 'bg-emerald-600 text-white'
                        : isCurrent
                        ? 'bg-purple-600 text-white shadow-md ring-2 ring-purple-400/50'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                    }`}
                  >
                    {isDone ? <Check className="h-3.5 w-3.5" /> : s.num}
                  </div>
                  <span
                    className={`text-xs font-medium ${
                      isCurrent
                        ? 'text-purple-600 dark:text-purple-400 font-bold'
                        : 'text-slate-500 dark:text-slate-400'
                    }`}
                  >
                    {s.label}
                  </span>
                  {s.num < 7 && <div className="h-px w-4 bg-slate-300 dark:bg-slate-800" />}
                </div>
              );
            })}
          </div>
        </div>

        {/* Wizard Step Content Body */}
        <div className="p-6 max-h-[82vh] overflow-y-auto">
          {/* PASO 1: Información de la organización */}
          {step === 1 && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                PASO 1: Datos Generales de la Organización / Cliente
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nombre de la Organización *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Movimiento Departamental Santander 2026"
                    value={organizationName}
                    onChange={(e) => {
                      setOrganizationName(e.target.value);
                      if (errors.organizationName) setErrors(prev => ({ ...prev, organizationName: '' }));
                    }}
                    className={`w-full rounded-xl border bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white transition-all ${
                      errors.organizationName
                        ? 'border-red-500 focus:ring-1 focus:ring-red-400 focus:border-red-500'
                        : 'border-slate-200 dark:border-slate-700 focus:ring-1 focus:ring-purple-500 focus:border-purple-500'
                    }`}
                  />
                  {errors.organizationName && (
                    <span className="text-red-500 text-[10px] mt-1 block font-medium">{errors.organizationName}</span>
                  )}
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Documento de Identificación / NIT *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. 901.882.109-4"
                    value={taxId}
                    onChange={(e) => {
                      setTaxId(e.target.value);
                      if (errors.taxId) setErrors(prev => ({ ...prev, taxId: '' }));
                    }}
                    className={`w-full rounded-xl border bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white transition-all ${
                      errors.taxId
                        ? 'border-red-500 focus:ring-1 focus:ring-red-400 focus:border-red-500'
                        : 'border-slate-200 dark:border-slate-700 focus:ring-1 focus:ring-purple-500 focus:border-purple-500'
                    }`}
                  />
                  {errors.taxId && (
                    <span className="text-red-500 text-[10px] mt-1 block font-medium">{errors.taxId}</span>
                  )}
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Correo Electrónico Institucional *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="contacto@campana.org"
                    value={email}
                    onChange={(e) => {
                      handleOrgEmailChange(e.target.value);
                      if (errors.email) setErrors(prev => ({ ...prev, email: '' }));
                    }}
                    className={`w-full rounded-xl border bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white transition-all ${
                      errors.email
                        ? 'border-red-500 focus:ring-1 focus:ring-red-400 focus:border-red-500'
                        : 'border-slate-200 dark:border-slate-700 focus:ring-1 focus:ring-purple-500 focus:border-purple-500'
                    }`}
                  />
                  {errors.email && (
                    <span className="text-red-500 text-[10px] mt-1 block font-medium">{errors.email}</span>
                  )}
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Teléfono de Contacto *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="+57 300 000 0000"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value);
                      if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
                    }}
                    className={`w-full rounded-xl border bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white transition-all ${
                      errors.phone
                        ? 'border-red-500 focus:ring-1 focus:ring-red-400 focus:border-red-500'
                        : 'border-slate-200 dark:border-slate-700 focus:ring-1 focus:ring-purple-500 focus:border-purple-500'
                    }`}
                  />
                  {errors.phone && (
                    <span className="text-red-500 text-[10px] mt-1 block font-medium">{errors.phone}</span>
                  )}
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">País *</label>
                  <input
                    type="text"
                    required
                    disabled
                    value={country}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 p-2.5 text-slate-500 dark:text-slate-400 cursor-not-allowed opacity-75"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Aspiración Política *
                  </label>
                  <select
                    value={aspiration}
                    onChange={(e) => {
                      const val = e.target.value as any;
                      setAspiration(val);
                      if (val === 'Gobernación' || val === 'Asamblea') {
                        setCity('');
                      }
                      if (errors.city) setErrors(prev => ({ ...prev, city: '' }));
                    }}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white transition-all focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                  >
                    <option value="Gobernación">Gobernación</option>
                    <option value="Asamblea">Asamblea</option>
                    <option value="Alcaldía">Alcaldía</option>
                    <option value="Concejo">Concejo</option>
                  </select>
                </div>
                <SearchableDropdown
                  label="Departamento / Estado *"
                  placeholder="Selecciona un departamento"
                  options={COLOMBIA_DEPARTMENTS.map((d) => d.name)}
                  value={department}
                  onChange={(val) => {
                    setDepartment(val);
                    setCity('');
                    if (errors.department) setErrors((prev) => ({ ...prev, department: '' }));
                    if (errors.city) setErrors((prev) => ({ ...prev, city: '' }));
                  }}
                  error={errors.department}
                />
                {(aspiration === 'Alcaldía' || aspiration === 'Concejo') && (
                  <SearchableDropdown
                    label="Municipio / Ciudad *"
                    placeholder={department ? "Selecciona un municipio" : "Selecciona primero un departamento"}
                    options={
                      COLOMBIA_DEPARTMENTS.find((d) => d.name === department)?.municipalities || []
                    }
                    value={city}
                    onChange={(val) => {
                      setCity(val);
                      if (errors.city) setErrors((prev) => ({ ...prev, city: '' }));
                    }}
                    error={errors.city}
                  />
                )}
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Notas Internas *</label>
                  <input
                    type="text"
                    required
                    placeholder="Detalles sobre el contrato o representante"
                    value={notes}
                    onChange={(e) => {
                      setNotes(e.target.value);
                      if (errors.notes) setErrors(prev => ({ ...prev, notes: '' }));
                    }}
                    className={`w-full rounded-xl border bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white transition-all ${
                      errors.notes
                        ? 'border-red-500 focus:ring-1 focus:ring-red-400 focus:border-red-500'
                        : 'border-slate-200 dark:border-slate-700 focus:ring-1 focus:ring-purple-500 focus:border-purple-500'
                    }`}
                  />
                  {errors.notes && (
                    <span className="text-red-500 text-[10px] mt-1 block font-medium">{errors.notes}</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* PASO 2: Administrador del Cliente y Contraseña */}
          {step === 2 && (
            <div className="space-y-5">
              <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  PASO 2: Datos del Administrador y Contraseña de Acceso
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Se creará automáticamente la cuenta de usuario principal con rol "Administrador del Cliente" y sus credenciales de acceso.
                </p>
              </div>

              {/* Admin basic data */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Nombre Completo del Responsable *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Carlos Eduardo Mendoza"
                    value={adminName}
                    onChange={(e) => {
                      setAdminName(e.target.value);
                      if (errors.adminName) setErrors(prev => ({ ...prev, adminName: '' }));
                    }}
                    className={`w-full rounded-xl border bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white transition-all ${
                      errors.adminName
                        ? 'border-red-500 focus:ring-1 focus:ring-red-400 focus:border-red-500'
                        : 'border-slate-200 dark:border-slate-700 focus:ring-1 focus:ring-purple-500 focus:border-purple-500'
                    }`}
                  />
                  {errors.adminName && (
                    <span className="text-red-500 text-[10px] mt-1 block font-medium">{errors.adminName}</span>
                  )}
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Correo del Administrador (Usuario de Acceso) *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="admin@campana.org"
                    value={adminEmail}
                    onChange={(e) => {
                      setAdminEmail(e.target.value);
                      if (errors.adminEmail) setErrors(prev => ({ ...prev, adminEmail: '' }));
                    }}
                    className={`w-full rounded-xl border bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white transition-all ${
                      errors.adminEmail
                        ? 'border-red-500 focus:ring-1 focus:ring-red-400 focus:border-red-500'
                        : 'border-slate-200 dark:border-slate-700 focus:ring-1 focus:ring-purple-500 focus:border-purple-500'
                    }`}
                  />
                  {errors.adminEmail && (
                    <span className="text-red-500 text-[10px] mt-1 block font-medium">{errors.adminEmail}</span>
                  )}
                </div>
              </div>

              {/* Password Creation Section Card */}
              <div className="rounded-2xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/50 dark:bg-purple-950/20 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-purple-600 text-white">
                      <Lock className="h-4 w-4" />
                    </div>
                    <div>
                      <h5 className="text-xs font-black text-purple-950 dark:text-purple-200">
                        Crear Contraseña de Acceso Inicial *
                      </h5>
                      <p className="text-[10px] text-purple-700 dark:text-purple-300">
                        Clave secreta con la que el cliente iniciará sesión en el panel del Software Electoral.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGeneratePassword}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 text-white text-[11px] font-bold hover:bg-purple-500 transition-colors shadow-sm"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Generar Segura
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                  {/* Password Input */}
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Contraseña de Acceso *
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Mínimo 8 caracteres"
                        value={adminPassword}
                        onChange={(e) => {
                          setAdminPassword(e.target.value);
                          if (errors.adminPassword) setErrors(prev => ({ ...prev, adminPassword: '' }));
                        }}
                        className={`w-full rounded-xl border bg-white dark:bg-slate-900 p-2.5 pr-10 text-slate-900 dark:text-white font-mono text-xs transition-all ${
                          errors.adminPassword
                            ? 'border-red-500 focus:ring-1 focus:ring-red-400'
                            : 'border-slate-200 dark:border-slate-700 focus:ring-1 focus:ring-purple-500'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.adminPassword && (
                      <span className="text-red-500 text-[10px] mt-1 block font-medium">{errors.adminPassword}</span>
                    )}
                  </div>

                  {/* Confirm Password Input */}
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Confirmar Contraseña *
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        placeholder="Repite la contraseña"
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value);
                          if (errors.confirmPassword) setErrors(prev => ({ ...prev, confirmPassword: '' }));
                        }}
                        className={`w-full rounded-xl border bg-white dark:bg-slate-900 p-2.5 pr-10 text-slate-900 dark:text-white font-mono text-xs transition-all ${
                          errors.confirmPassword
                            ? 'border-red-500 focus:ring-1 focus:ring-red-400'
                            : 'border-slate-200 dark:border-slate-700 focus:ring-1 focus:ring-purple-500'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <span className="text-red-500 text-[10px] mt-1 block font-medium">{errors.confirmPassword}</span>
                    )}
                  </div>
                </div>

                {/* Password validation indicators */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-purple-200/60 dark:border-purple-900/40 text-[11px]">
                  <div className="flex items-center gap-2">
                    {adminPassword.length >= 6 ? (
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                        <Check className="h-3.5 w-3.5" />
                        Longitud suficiente (≥6)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-rose-600 dark:text-rose-400 font-bold">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Mínimo 6 caracteres
                      </span>
                    )}
                  </div>

                  <div>
                    {adminPassword && confirmPassword && adminPassword === confirmPassword ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-extrabold text-[10px]">
                        <ShieldCheck className="h-3.5 w-3.5" />
                        ¡Las contraseñas coinciden!
                      </span>
                    ) : adminPassword && confirmPassword ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 font-extrabold text-[10px]">
                        <AlertTriangle className="h-3.5 w-3.5" />
                        Las contraseñas NO coinciden
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PASO 3: Selección de Plan */}
          {step === 3 && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                PASO 3: Selección del Plan Comercial
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {plans.map((p) => {
                  const isSelected = selectedPlanId === p.id;
                  return (
                    <div
                      key={p.id}
                      onClick={() => handleSelectPlan(p.id)}
                      className={`cursor-pointer rounded-2xl p-4 border transition-all ${
                        isSelected
                          ? 'border-purple-600 bg-purple-50/80 dark:bg-purple-950/40 ring-2 ring-purple-600'
                          : 'border-slate-200 dark:border-slate-800 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-black text-slate-900 dark:text-white">{p.name}</span>
                        {isSelected && <CheckCircle2 className="h-4 w-4 text-purple-600" />}
                      </div>
                      <p className="text-xs text-slate-500 mt-1 leading-snug">{p.description}</p>
                      <div className="mt-3 pt-2 border-t border-slate-200/60 dark:border-slate-800 text-xs font-bold text-purple-700 dark:text-purple-300">
                        ${p.monthlyPrice} USD / mes • ${p.annualPrice} USD / año
                      </div>
                      <div className="mt-2 text-[11px] text-slate-500">
                        • {p.maxUsers === -1 ? 'Usuarios Ilimitados' : `Hasta ${p.maxUsers} usuarios`}
                        <br />• {p.maxCampaigns} Campaña(s) incluidas
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* PASO 4: Tipo de Licencia */}
          {step === 4 && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                PASO 4: Configuración de Licencia de Software
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Tipo de Licencia
                  </label>
                  <select
                    value={licenseType}
                    onChange={(e) => setLicenseType(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white"
                  >
                    <option value="Anual">Anual (12 Meses - Recomendado)</option>
                    <option value="Semestral">Semestral (6 Meses)</option>
                    <option value="Trimestral">Trimestral (3 Meses)</option>
                    <option value="Mensual">Mensual (1 Mes)</option>
                    <option value="Especial Demo">Especial Demo / Prueba</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Clave de Licencia Generada
                  </label>
                  <input
                    type="text"
                    disabled
                    value={`CG-${selectedPlan.code}-2026-AUTO-GEN`}
                    className="w-full font-mono rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-200 dark:bg-slate-800 p-2.5 text-slate-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* PASO 5: Duración y Fechas */}
          {step === 5 && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                PASO 5: Duración de la Licencia
              </h4>

              {licenseType === 'Especial Demo' || selectedPlan.code === 'DEMO' ? (
                <div className="space-y-4 text-xs">
                  <div className="p-4 rounded-2xl border border-amber-300 dark:border-amber-800/80 bg-amber-50/90 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 space-y-2 shadow-sm">
                    <div className="flex items-center gap-2 font-extrabold text-xs">
                      <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                      <span>Vigencia para Cuentas Demo: Máximo 3 Días</span>
                    </div>
                    <p className="text-[11px] leading-relaxed opacity-90">
                      Las licencias en modo <strong>Especial Demo</strong> tienen un periodo de prueba límite de <strong>máximo 3 días</strong>.
                      Al expirar los 3 días, la cuenta vencerá automáticamente y se le mostrará al usuario una pantalla emergente obligatoria indicando que debe pasar a un plan comercial de pago (Básico, Profesional o Enterprise) para continuar utilizando el servicio.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="block font-bold text-slate-700 dark:text-slate-300">
                      Seleccionar Duración Demo (Máximo 3 Días):
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                      {[1, 2, 3].map((d) => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setDemoDurationDays(d)}
                          className={`p-3.5 rounded-xl border font-bold text-xs transition-all flex flex-col items-center justify-center gap-1 ${
                            demoDurationDays === d
                              ? 'border-amber-500 bg-amber-500 text-white shadow-md'
                              : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/50 hover:border-amber-300'
                          }`}
                        >
                          <span className="text-sm font-black">{d} {d === 1 ? 'Día' : 'Días'}</span>
                          <span className="text-[10px] opacity-80 font-medium">
                            {d === 3 ? 'Límite Máximo' : `Expira en ${d} ${d === 1 ? 'día' : 'días'}`}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 text-xs">
                  <label className="block font-bold text-slate-700 dark:text-slate-300">
                    Seleccionar Meses de Duración Inicial:
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {[1, 3, 6, 12, 24].map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setDurationMonths(m)}
                        className={`p-3 rounded-xl border font-bold text-xs transition-all ${
                          durationMonths === m
                            ? 'border-purple-600 bg-purple-600 text-white shadow-md'
                            : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {m} {m === 1 ? 'Mes' : 'Meses'}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* PASO 6: Límites & Módulos */}
          {step === 6 && (
            <div className="space-y-4">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-2">
                PASO 6: Personalización de Módulos Habilitados
              </h4>
              <p className="text-xs text-slate-500">
                Los módulos seleccionados estarán disponibles para este cliente en el Software Electoral.
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-52 overflow-y-auto pr-1">
                {modules.map((m) => {
                  const isChecked = enabledModules.includes(m.code);
                  return (
                    <div
                      key={m.id}
                      onClick={() => handleToggleModule(m.code)}
                      className={`cursor-pointer rounded-xl p-3 border text-xs flex items-center justify-between transition-all ${
                        isChecked
                          ? 'border-purple-600 bg-purple-50/80 dark:bg-purple-950/40 text-purple-900 dark:text-purple-200 font-bold'
                          : 'border-slate-200 dark:border-slate-800 text-slate-500'
                      }`}
                    >
                      <span>{m.name}</span>
                      <div
                        className={`h-4 w-4 rounded flex items-center justify-center border ${
                          isChecked ? 'bg-purple-600 border-purple-600 text-white' : 'border-slate-300'
                        }`}
                      >
                        {isChecked && <Check className="h-3 w-3" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* PASO 7: Confirmación */}
          {step === 7 && (
            <div className="space-y-4">
              <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-4 text-center">
                <CheckCircle2 className="h-10 w-10 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
                <h4 className="text-base font-bold text-emerald-900 dark:text-emerald-200">
                  ¡Todo Listo para Generar el Cliente!
                </h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">
                  Revisa el resumen final antes de activar la cuenta y crear las credenciales iniciales.
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-slate-800 p-4 bg-slate-50 dark:bg-slate-800/50 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Organización:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{organizationName || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">NIT / Documento:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{taxId || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Aspiración Política:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{aspiration}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Departamento:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{department || 'N/A'}</span>
                </div>
                {(aspiration === 'Alcaldía' || aspiration === 'Concejo') && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Municipio:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{city || 'N/A'}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Administrador:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{adminName} ({adminEmail})</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Contraseña de Acceso:</span>
                  <span className="font-mono font-bold text-purple-700 dark:text-purple-300 bg-purple-100 dark:bg-purple-950/80 px-2 py-0.5 rounded">
                    {showPassword ? adminPassword : '••••••••••••'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Plan Seleccionado:</span>
                  <span className="font-bold text-purple-600">{selectedPlan.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Vigencia:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{durationMonths} Meses</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Módulos Habilitados:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{enabledModules.length} Módulos</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer Navigation */}
        <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80 px-6 py-4">
          {step > 1 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Anterior
            </button>
          ) : (
            <div />
          )}

          {step < 7 ? (
            <button
              onClick={handleNextStep}
              className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-xs font-bold text-white hover:bg-purple-500 transition-all shadow-md shadow-purple-600/30"
            >
              Siguiente Paso
              <ArrowRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={handleCompleteWizard}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-emerald-600/30 hover:from-emerald-500 hover:to-teal-500 transition-all"
            >
              Confirmar y Activar Cliente
              <CheckCircle2 className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
