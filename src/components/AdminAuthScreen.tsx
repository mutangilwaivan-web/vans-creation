import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  ArrowRight, 
  CheckCircle2, 
  KeyRound, 
  RefreshCw 
} from 'lucide-react';
import { useStudio } from '../context/StudioContext';
import { 
  auth, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail 
} from '../lib/firebase';

interface AdminAuthScreenProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 3 * 60 * 1000; // 3 minutes lockout

export const AdminAuthScreen: React.FC<AdminAuthScreenProps> = ({
  onSuccess,
  onCancel,
}) => {
  const { settings, setAdminAuthenticated } = useStudio();
  
  const [emailInput, setEmailInput] = useState(settings.email || 'mutangilwaivan@gmail.com');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [resetSuccessMessage, setResetSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);

  // Rate Limiting / Brute-force Lockout State
  const [failedAttempts, setFailedAttempts] = useState<number>(() => {
    const saved = localStorage.getItem('maison_vans_auth_failed_attempts');
    return saved ? parseInt(saved, 10) || 0 : 0;
  });
  const [lockoutUntil, setLockoutUntil] = useState<number>(() => {
    const saved = localStorage.getItem('maison_vans_auth_lockout_until');
    return saved ? parseInt(saved, 10) || 0 : 0;
  });
  const [lockoutRemainingSeconds, setLockoutRemainingSeconds] = useState<number>(0);

  // Lockout Countdown Timer
  useEffect(() => {
    const checkLockout = () => {
      const now = Date.now();
      if (lockoutUntil > now) {
        setLockoutRemainingSeconds(Math.ceil((lockoutUntil - now) / 1000));
      } else {
        setLockoutRemainingSeconds(0);
        if (lockoutUntil > 0) {
          setLockoutUntil(0);
          setFailedAttempts(0);
          localStorage.removeItem('maison_vans_auth_lockout_until');
          localStorage.removeItem('maison_vans_auth_failed_attempts');
        }
      }
    };

    checkLockout();
    const timer = setInterval(checkLockout, 1000);
    return () => clearInterval(timer);
  }, [lockoutUntil]);

  const recordFailedAttempt = () => {
    const nextAttempts = failedAttempts + 1;
    setFailedAttempts(nextAttempts);
    localStorage.setItem('maison_vans_auth_failed_attempts', nextAttempts.toString());

    if (nextAttempts >= MAX_FAILED_ATTEMPTS) {
      const lockTime = Date.now() + LOCKOUT_DURATION_MS;
      setLockoutUntil(lockTime);
      localStorage.setItem('maison_vans_auth_lockout_until', lockTime.toString());
      setAuthError(`Trop de tentatives infructueuses. Accès temporairement suspendu pour des raisons de sécurité.`);
    } else {
      setAuthError(`Identifiants invalides. (${MAX_FAILED_ATTEMPTS - nextAttempts} tentative(s) restante(s))`);
    }
  };

  const clearFailedAttempts = () => {
    setFailedAttempts(0);
    setLockoutUntil(0);
    localStorage.removeItem('maison_vans_auth_failed_attempts');
    localStorage.removeItem('maison_vans_auth_lockout_until');
  };

  // Authenticate Admin with Firebase Credentials
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutRemainingSeconds > 0) return;

    if (!emailInput || !emailInput.includes('@')) {
      setAuthError('Veuillez saisir une adresse email valide.');
      return;
    }
    if (!passwordInput || passwordInput.length < 6) {
      setAuthError('Veuillez saisir votre mot de passe d’accès.');
      return;
    }

    setIsLoading(true);
    setAuthError(null);
    setResetSuccessMessage(null);

    const cleanEmail = emailInput.trim().toLowerCase();
    const cleanPassword = passwordInput.trim();

    try {
      await signInWithEmailAndPassword(auth, cleanEmail, cleanPassword);
      
      // Clear security counter on successful authentication
      clearFailedAttempts();

      const sessionData = {
        authenticatedAt: new Date().toISOString(),
        email: cleanEmail,
        role: 'Directrice de Création & Modéliste',
        expiresAt: rememberMe ? Date.now() + 30 * 24 * 60 * 60 * 1000 : Date.now() + 24 * 60 * 60 * 1000,
      };
      localStorage.setItem('maison_vans_admin_session', JSON.stringify(sessionData));
      localStorage.setItem('maison_vans_admin_auth', 'true');
      setAdminAuthenticated(true);
      onSuccess();
    } catch (err: any) {
      recordFailedAttempt();
    } finally {
      setIsLoading(false);
    }
  };

  // Secure Firebase Password Reset Flow
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !emailInput.includes('@')) {
      setAuthError('Veuillez saisir votre adresse email pour recevoir le lien de réinitialisation.');
      return;
    }

    setIsResettingPassword(true);
    setAuthError(null);
    setResetSuccessMessage(null);

    const cleanEmail = emailInput.trim().toLowerCase();

    try {
      // ActionCodeSettings tells Firebase where to redirect the user after resetting
      const actionCodeSettings = {
        url: window.location.origin + '/#admin',
        handleCodeInApp: false,
      };
      await sendPasswordResetEmail(auth, cleanEmail, actionCodeSettings);
      setResetSuccessMessage(
        `✅ Un email de réinitialisation a été envoyé à ${cleanEmail}. ` +
        `Vérifiez votre boîte de réception ET vos courriers indésirables (spam/junk). ` +
        `L'email provient de noreply@gen-lang-client-0203190859.firebaseapp.com.`
      );
      setShowResetForm(false);
    } catch (err: any) {
      console.error('[Van\'s Creation] Erreur réinitialisation mot de passe:', err);
      const code = err?.code || '';
      if (code === 'auth/user-not-found' || code === 'auth/invalid-credential') {
        setAuthError('Aucun compte n\'est associé à cette adresse email. Vérifiez l\'adresse saisie.');
      } else if (code === 'auth/invalid-email') {
        setAuthError('L\'adresse email saisie n\'est pas valide.');
      } else if (code === 'auth/too-many-requests') {
        setAuthError('Trop de tentatives de réinitialisation. Veuillez patienter quelques minutes avant de réessayer.');
      } else if (code === 'auth/network-request-failed') {
        setAuthError('Erreur de connexion internet. Vérifiez votre connexion et réessayez.');
      } else {
        setAuthError(`Erreur lors de l'envoi : ${err?.message || 'Vérifiez votre connexion internet et réessayez.'}`);
      }
    } finally {
      setIsResettingPassword(false);
    }
  };

  return (
    <section id="admin-login-screen" className="py-12 sm:py-20 bg-[#FAF8F5] min-h-[85vh] flex items-center justify-center px-4 select-none">
      <div className="max-w-md w-full bg-white p-6 sm:p-9 rounded-3xl border border-[#E8E1D7] shadow-2xl space-y-6 relative overflow-hidden">
        
        {/* Top Gold Accent Line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#C5A880] via-[#8C7A6B] to-[#181512]" />

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#181512] text-[#C5A880] flex items-center justify-center mx-auto shadow-md border border-[#3D352E]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#181512] tracking-wide" style={{ fontFamily: "'Cinzel', serif" }}>
            Espace Atelier Privé
          </h2>
          <p className="text-xs text-[#6B5F54] leading-relaxed" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Accès sécurisé réservé à la direction de la Maison Van's Creation.
          </p>
        </div>

        {/* Lockout Warning Banner */}
        {lockoutRemainingSeconds > 0 && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Accès temporairement verrouillé</p>
              <p className="mt-0.5">Veuillez patienter <strong>{lockoutRemainingSeconds}s</strong> avant de réessayer.</p>
            </div>
          </div>
        )}

        {/* Reset Password Success Banner */}
        {resetSuccessMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p>{resetSuccessMessage}</p>
          </div>
        )}

        {/* Main Login Form */}
        {!showResetForm ? (
          <form onSubmit={handleLogin} className="space-y-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            
            {/* Email Field */}
            <div>
              <label className="text-[10.5px] font-bold uppercase tracking-wider text-[#8C7A6B] block mb-1">
                Identifiant Administrateur
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  autoComplete="username"
                  disabled={lockoutRemainingSeconds > 0 || isLoading}
                  value={emailInput}
                  onChange={(e) => {
                    setEmailInput(e.target.value);
                    setAuthError(null);
                  }}
                  placeholder="adresse@exemple.com"
                  className="w-full bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl px-4 py-3 pl-10 text-sm text-[#181512] placeholder-[#A39688] focus:outline-none focus:border-[#1B4332] focus:ring-2 focus:ring-[#1B4332]/10 transition-all disabled:opacity-50"
                />
                <Mail className="w-4 h-4 text-[#8C7A6B] absolute left-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10.5px] font-bold uppercase tracking-wider text-[#8C7A6B]">
                  Mot de Passe
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setShowResetForm(true);
                    setAuthError(null);
                  }}
                  className="text-[10.5px] text-[#C5A880] hover:text-[#181512] transition-colors font-medium cursor-pointer"
                >
                  Mot de passe oublié ?
                </button>
              </div>
              
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  disabled={lockoutRemainingSeconds > 0 || isLoading}
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setAuthError(null);
                  }}
                  placeholder="••••••••••••"
                  className="w-full bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl px-4 py-3 pl-10 pr-10 text-sm text-[#181512] placeholder-[#A39688] focus:outline-none focus:border-[#1B4332] focus:ring-2 focus:ring-[#1B4332]/10 transition-all disabled:opacity-50"
                />
                <Lock className="w-4 h-4 text-[#8C7A6B] absolute left-3.5 top-3.5 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3.5 text-[#8C7A6B] hover:text-[#181512] cursor-pointer"
                  aria-label={showPassword ? 'Masquer' : 'Afficher'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {authError && (
                <div className="flex items-center gap-1.5 text-xs text-rose-600 mt-2">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}
            </div>

            {/* Remember Me Option */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-[#5C5247]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-[#1B4332] focus:ring-[#1B4332]"
                />
                <span>Mémoriser ma session sécurisée</span>
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || lockoutRemainingSeconds > 0}
              className="w-full py-3.5 bg-[#181512] hover:bg-[#1B4332] text-[#FAF8F5] rounded-xl text-xs font-bold uppercase tracking-[0.16em] shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[#C5A880]" />
                  <span>Authentification sécurisée...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4 text-[#C5A880]" />
                  <span>Connexion Atelier</span>
                </>
              )}
            </button>
          </form>
        ) : (
          /* Password Reset Form */
          <form onSubmit={handlePasswordReset} className="space-y-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E8E1D7] text-xs text-[#5C5247]">
              Saisissez l'adresse email de votre compte pour recevoir un lien officiel de réinitialisation de mot de passe.
            </div>

            <div>
              <label className="text-[10.5px] font-bold uppercase tracking-wider text-[#8C7A6B] block mb-1">
                Adresse Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => { setEmailInput(e.target.value); setAuthError(null); }}
                  placeholder="adresse@exemple.com"
                  className="w-full bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl px-4 py-3 pl-10 text-sm text-[#181512] placeholder-[#A39688] focus:outline-none focus:border-[#1B4332] transition-all"
                />
                <Mail className="w-4 h-4 text-[#8C7A6B] absolute left-3.5 top-3.5 pointer-events-none" />
              </div>

              {authError && (
                <div className="flex items-start gap-1.5 text-xs text-rose-600 mt-2 p-2.5 bg-rose-50 border border-rose-200 rounded-xl">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>{authError}</span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isResettingPassword}
              className="w-full py-3.5 bg-[#181512] hover:bg-[#1B4332] text-[#FAF8F5] rounded-xl text-xs font-bold uppercase tracking-[0.16em] shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
            >
              {isResettingPassword ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[#C5A880]" />
                  <span>Envoi du lien en cours...</span>
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 text-[#C5A880]" />
                  <span>Envoyer le lien de réinitialisation</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowResetForm(false);
                setAuthError(null);
              }}
              className="w-full text-center text-xs text-[#8C7A6B] hover:text-[#181512] transition-colors py-1 cursor-pointer"
            >
              ← Retour au formulaire de connexion
            </button>
          </form>
        )}

        {/* Public Site Navigation Link */}
        <div className="text-center pt-2 border-t border-[#F0EAE1]">
          <button
            type="button"
            onClick={onCancel}
            className="text-xs text-[#8C7A6B] hover:text-[#181512] transition-colors underline cursor-pointer"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            ← Retour au catalogue public
          </button>
        </div>

      </div>
    </section>
  );
};
