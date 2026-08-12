import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { supabase } from '../../services/supabaseClient';
import { translateError } from '../../utils/errorTranslator';

interface LoginViewProps {
  onLoginSuccess: (user: { name: string; email: string; role: string }) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  
  // Login states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Register states
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmitLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password.trim(),
    });

    if (error) {
      setErrorMsg(translateError(error, 'Credenciales incorrectas. Verifica tus datos o crea una cuenta.'));
      setIsLoading(false);
      return;
    }

    if (data?.user) {
      onLoginSuccess({
        name: data.user.user_metadata?.name || data.user.email?.split('@')[0] || '',
        email: data.user.email || '',
        role: 'Super Admin',
      });
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) {
      setErrorMsg(translateError(error, 'Ocurrió un error al iniciar sesión con Google.'));
      setIsLoading(false);
    }
  };

  const handleSubmitRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Las contraseñas no coinciden.');
      setIsLoading(false);
      return;
    }

    if (regPassword.length < 6) {
      setErrorMsg('La contraseña debe tener al menos 6 caracteres.');
      setIsLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: regEmail.trim(),
      password: regPassword.trim(),
      options: {
        data: {
          name: regName.trim(),
        },
      },
    });

    if (error) {
      setErrorMsg(translateError(error, 'Error al registrar el administrador central.'));
      setIsLoading(false);
      return;
    }

    setSuccessMsg('¡Usuario Administrador creado exitosamente! Iniciando sesión...');
    
    // Auto sign in
    setTimeout(async () => {
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: regEmail.trim(),
        password: regPassword.trim(),
      });

      if (loginError) {
        setErrorMsg(translateError(loginError, 'Cuenta creada, pero ocurrió un error en el inicio de sesión automático. Por favor inicia sesión.'));
        setIsLoading(false);
        setMode('login');
        return;
      }

      if (loginData?.user) {
        onLoginSuccess({
          name: loginData.user.user_metadata?.name || loginData.user.email?.split('@')[0] || '',
          email: loginData.user.email || '',
          role: 'Super Admin',
        });
      }
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Background Decorative Gradients */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      
      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand Logo Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-tr from-purple-600 via-violet-600 to-indigo-600 text-white shadow-xl shadow-purple-900/50 border border-purple-400/30">
            <ShieldCheck className="h-9 w-9" />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white">
              CAMPAÑA GANADORA
            </h1>
            <p className="text-xs font-bold tracking-widest text-purple-400 uppercase mt-0.5">
              PANEL CENTRAL DE ADMINISTRACIÓN AI
            </p>
          </div>
        </div>

        {/* Login Card */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 backdrop-blur-xl p-8 shadow-2xl space-y-6">
          {/* Tabs Selector */}
          <div className="grid grid-cols-2 p-1 rounded-2xl bg-slate-950/80 border border-slate-800/80 text-xs font-bold">
            <button
              type="button"
              onClick={() => { setMode('login'); setErrorMsg(null); setSuccessMsg(null); }}
              className={`py-2 rounded-xl transition-all ${
                mode === 'login'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setErrorMsg(null); setSuccessMsg(null); }}
              className={`py-2 rounded-xl transition-all ${
                mode === 'register'
                  ? 'bg-purple-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Crear Administrador
            </button>
          </div>

          <div className="space-y-1 text-center">
            <h2 className="text-lg font-bold text-white">
              {mode === 'login' ? 'Acceso al Panel Central' : 'Registro de Superadministrador'}
            </h2>
            <p className="text-xs text-slate-400">
              {mode === 'login'
                ? 'Ingresa con tus credenciales de usuario'
                : 'Crea tu usuario administrativo desde cero'}
            </p>
          </div>

          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold text-center">
              {errorMsg}
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold text-center">
              {successMsg}
            </div>
          )}

          {mode === 'login' ? (
            <form onSubmit={handleSubmitLogin} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1.5">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    name="email"
                    autocomplete="username"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="admin@campanaganadora.ai"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/80 pl-10 pr-4 py-3 text-white text-xs font-medium placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1.5">
                  Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    autocomplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/80 pl-10 pr-10 py-3 text-white text-xs font-medium placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-400">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="rounded border-slate-800 bg-slate-950 text-purple-600 focus:ring-0"
                  />
                  <span>Recordar mi sesión</span>
                </label>
                <a href="#" onClick={(e) => { e.preventDefault(); alert('Por favor contacta al soporte técnico o registra un nuevo usuario.'); }} className="text-purple-400 hover:text-purple-300 font-semibold">
                  ¿Olvidaste tu clave?
                </a>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 py-3.5 text-xs font-extrabold text-white shadow-lg shadow-purple-600/30 hover:from-purple-500 hover:to-indigo-500 transition-all disabled:opacity-50 mt-2 cursor-pointer"
              >
                {isLoading ? (
                  <span>Iniciando Sesión...</span>
                ) : (
                  <>
                    <span>Ingresar al Panel de Control</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-800"></div>
                <span className="flex-shrink mx-4 text-slate-500 text-[10px] font-bold uppercase tracking-wider">O</span>
                <div className="flex-grow border-t border-slate-800"></div>
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full inline-flex items-center justify-center gap-2.5 rounded-xl border border-slate-800 bg-slate-950/60 hover:bg-slate-950 hover:border-slate-700 py-3 text-xs font-bold text-slate-200 transition-all cursor-pointer"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                </svg>
                <span>Acceder con Google</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmitRegister} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Nombre Completo del Administrador
                </label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Ej: Ober Osorio"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/80 px-3.5 py-2.5 text-white text-xs font-medium placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Correo Electrónico Corporativo
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="admin@miorganizacion.com"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/80 pl-10 pr-4 py-2.5 text-white text-xs font-medium placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Contraseña Máster
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Crea una contraseña segura"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/80 pl-10 pr-10 py-2.5 text-white text-xs font-medium placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Confirmar Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Repite la contraseña"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/80 pl-10 pr-4 py-2.5 text-white text-xs font-medium placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3.5 text-xs font-extrabold text-white shadow-lg shadow-emerald-600/30 hover:from-emerald-500 hover:to-teal-500 transition-all disabled:opacity-50 mt-2 cursor-pointer"
              >
                {isLoading ? (
                  <span>Registrando Administrador...</span>
                ) : (
                  <>
                    <span>Crear Cuenta e Ingresar</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Footer info */}
        <p className="text-center text-[11px] text-slate-500">
          Software Electoral Multi-Tenant &copy; 2026 Campaña Ganadora AI.
        </p>
      </div>
    </div>
  );
};

