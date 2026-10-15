import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.tsx';
import { AppLogo } from '../logos/AppLogo.tsx';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  User as UserIcon,
  ArrowRight,
  AlertCircle,
  PlayCircle,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

interface LoginViewProps {
  onOpenTutorial?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onOpenTutorial }) => {
  const { signInWithGoogle, signInWithEmail, signUpWithEmail } = useAuth();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setIsGoogleSubmitting(true);
    try {
      await signInWithGoogle();
    } catch (err: unknown) {
      console.error('Google sign-in error:', err);
      const code = (err as { code?: string })?.code;
      const currentHost = typeof window !== 'undefined' ? window.location.hostname : '';
      if (code === 'auth/unauthorized-domain') {
        setErrorMessage(
          `Domínio não autorizado no Firebase Auth (${currentHost}). Adicione este domínio no Firebase Console > Authentication > Configurações > Domínios autorizados.`
        );
      } else if (code === 'auth/popup-blocked') {
        setErrorMessage('O navegador bloqueou a janela pop-up do Google. Permita pop-ups para este site e tente novamente.');
      } else if (code === 'auth/operation-not-allowed') {
        setErrorMessage('O provedor de login Google não está ativado no Firebase Console > Authentication > Sign-in method.');
      } else if (code === 'auth/popup-closed-by-user') {
        setErrorMessage('A janela de autenticação foi fechada antes de concluir.');
      } else if (code === 'auth/cancelled-popup-request') {
        setErrorMessage('Requisição de login cancelada.');
      } else {
        const msg = (err as Error)?.message || 'Erro de autenticação';
        setErrorMessage(`Não foi possível conectar com o Google/Gmail (${code || msg}). Tente novamente ou use e-mail/senha.`);
      }
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  const handleEmailPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('A senha precisa ter pelo menos 6 caracteres.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (mode === 'signin') {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password, name);
      }
    } catch (err: unknown) {
      console.error('Email auth error:', err);
      const code = (err as { code?: string })?.code;
      if (code === 'auth/user-not-found' || code === 'auth/wrong-password' || code === 'auth/invalid-credential') {
        setErrorMessage('E-mail ou senha incorretos.');
      } else if (code === 'auth/email-already-in-use') {
        setErrorMessage('Este e-mail já está registrado. Tente fazer login ou conectar com o Gmail.');
      } else if (code === 'auth/weak-password') {
        setErrorMessage('A senha escolhida é muito fraca. Digite ao menos 6 caracteres.');
      } else if (code === 'auth/invalid-email') {
        setErrorMessage('O formato de e-mail informado é inválido.');
      } else if (code === 'auth/operation-not-allowed') {
        setErrorMessage(
          'Login por e-mail/senha não habilitado no Firebase. Conecte com o Google/Gmail acima com 1 clique!'
        );
      } else {
        setErrorMessage('Ocorreu um erro ao processar seu acesso. Verifique seus dados.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F2FAF5] via-[#F8FAF9] to-[#EDF6F0] flex flex-col items-center justify-center px-4 py-8 sm:py-12">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center p-2 rounded-3xl bg-white shadow-sm border border-emerald-100 mb-3">
            <AppLogo size={68} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#15251C] tracking-tight">
            Compra Certa
          </h1>
          <p className="text-xs sm:text-sm text-[#526356] mt-1 font-medium">
            Acesso obrigatório para controle de orçamento e compras
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-[#D5E5DA] p-6 sm:p-8 relative overflow-hidden">
          {/* Top highlight bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#0B4D26] via-[#118447] to-[#22C55E]" />

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-5 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-start gap-2.5 animate-in fade-in duration-150">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          {/* Primary Gmail / Google Button */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isGoogleSubmitting || isSubmitting}
              className="w-full py-3.5 px-4 rounded-2xl border-2 border-[#D5E5DA] hover:border-[#118447] bg-white hover:bg-emerald-50/40 text-[#15251C] font-bold text-sm flex items-center justify-center gap-3 transition-all duration-200 shadow-sm hover:shadow active:scale-[0.99] cursor-pointer disabled:opacity-50"
            >
              {isGoogleSubmitting ? (
                <div className="w-5 h-5 border-2 border-[#118447] border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>Conectar com Gmail / Google</span>
            </button>

            {/* Divider */}
            <div className="relative py-2 flex items-center justify-center">
              <div className="border-t border-[#E1EAE4] w-full" />
              <span className="bg-white px-3 text-[11px] font-semibold tracking-wider uppercase text-[#738377] absolute">
                ou com e-mail e senha
              </span>
            </div>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex bg-[#F2FAF5] p-1 rounded-xl mb-4 mt-2">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setErrorMessage(null);
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'signin'
                  ? 'bg-white text-[#075E37] shadow-sm'
                  : 'text-[#647067] hover:text-[#15251C]'
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setErrorMessage(null);
              }}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-white text-[#075E37] shadow-sm'
                  : 'text-[#647067] hover:text-[#15251C]'
              }`}
            >
              Criar Nova Conta
            </button>
          </div>

          {/* Email / Password Form */}
          <form onSubmit={handleEmailPasswordSubmit} className="space-y-3.5">
            {mode === 'signup' && (
              <div>
                <label className="block text-[11px] font-bold text-[#15251C] uppercase tracking-wider mb-1">
                  Seu Nome
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <UserIcon className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Como prefere ser chamado(a)"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-[#D5E5DA] focus:border-[#118447] focus:bg-white rounded-xl text-sm outline-none transition-colors"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-[#15251C] uppercase tracking-wider mb-1">
                E-mail
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@gmail.com"
                  className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-[#D5E5DA] focus:border-[#118447] focus:bg-white rounded-xl text-sm outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#15251C] uppercase tracking-wider mb-1">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo de 6 dígitos"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-[#D5E5DA] focus:border-[#118447] focus:bg-white rounded-xl text-sm outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || isGoogleSubmitting}
              className="w-full mt-2 py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-[#118447] hover:bg-[#075E37] active:scale-[0.99] transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{mode === 'signin' ? 'Entrar com E-mail' : 'Cadastrar e Acessar'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Discreet Tutorial Link on Login */}
          {onOpenTutorial && (
            <div className="mt-5 pt-4 border-t border-[#E1EAE4] text-center">
              <button
                type="button"
                onClick={onOpenTutorial}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#075E37] hover:text-[#064227] hover:underline cursor-pointer"
              >
                <PlayCircle className="w-4 h-4 text-[#118447]" />
                <span>Primeira vez aqui? Veja o vídeo tutorial de 1 min</span>
              </button>
            </div>
          )}
        </div>

        {/* Security / Quality Guarantees */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-[11px] text-[#526356] font-medium text-center">
          <div className="flex items-center gap-1">
            <ShieldCheck className="w-4 h-4 text-[#118447]" />
            <span>Acesso Seguro Firebase</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle2 className="w-4 h-4 text-[#118447]" />
            <span>Dados Protegidos</span>
          </div>
          <div className="flex items-center gap-1">
            <Sparkles className="w-4 h-4 text-[#118447]" />
            <span>100% Gratuito</span>
          </div>
        </div>
      </div>
    </div>
  );
};
