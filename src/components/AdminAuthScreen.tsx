import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  AlertCircle, 
  CheckCircle2, 
  KeyRound, 
  RefreshCw,
  Hash,
  HelpCircle,
  Sparkles,
  ArrowRight,
  Unlock
} from 'lucide-react';
import { useStudio } from '../context/StudioContext';
import { 
  auth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInAnonymously,
  sendPasswordResetEmail 
} from '../lib/firebase';

interface AdminAuthScreenProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 3 * 60 * 1000; // 3 minutes

// Authorized Master Credentials
const MASTER_PASSWORDS = [
  'Vanessa2026!',
  'MaisonVans2026!',
  'Atelier2026!',
  'Vans2026!',
  'Admin2026!',
  'VanessaKaniki2026!'
];

const MASTER_PINS = [
  '243842',
  '842732',
  '243000',
  '202600'
];

export const AdminAuthScreen: React.FC<AdminAuthScreenProps> = ({
  onSuccess,
  onCancel,
}) => {
  const { settings, setAdminAuthenticated } = useStudio();
  
  // Auth Mode: 'password' | 'pin'
  const [authMode, setAuthMode] = useState<'password' | 'pin'>('password');
  
  const [emailInput, setEmailInput] = useState(settings.email || 'mutangilwaivan@gmail.com');
  const [passwordInput, setPasswordInput] = useState('');
  const [pinInput, setPinInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  
  // Reset Form State
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetMode, setResetMode] = useState<'pin' | 'email'>('pin');
  const [resetPinInput, setResetPinInput] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  
  // Status Messages
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccessMessage, setAuthSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showCredentialsHelp, setShowCredentialsHelp] = useState(false);

  // Rate Limiting / Lockout State
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

  // Grant Admin Access and Save Session
  const grantAccess = async (userEmail: string) => {
    clearFailedAttempts();
    const sessionData = {
      authenticatedAt: new Date().toISOString(),
      email: userEmail,
      role: 'Directrice de Création & Modéliste',
      expiresAt: rememberMe ? Date.now() + 30 * 24 * 60 * 60 * 1000 : Date.now() + 24 * 60 * 60 * 1000,
    };
    localStorage.setItem('maison_vans_admin_session', JSON.stringify(sessionData));
    localStorage.setItem('maison_vans_admin_auth', 'true');
    localStorage.setItem('maison_vans_atelier_data_v1_admin_auth', 'true');
    setAdminAuthenticated(true);
    onSuccess();
  };

  // Authenticate via Email + Password (Multi-Strategy)
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutRemainingSeconds > 0) return;

    const cleanEmail = emailInput.trim().toLowerCase();
    const cleanPassword = passwordInput.trim();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setAuthError('Veuillez saisir une adresse email valide.');
      return;
    }
    if (!cleanPassword || cleanPassword.length < 6) {
      setAuthError('Le mot de passe doit comporter au moins 6 caractères.');
      return;
    }

    setIsLoading(true);
    setAuthError(null);
    setAuthSuccessMessage(null);

    const customPassword = localStorage.getItem('maison_vans_custom_admin_password');
    const isMasterPassword = MASTER_PASSWORDS.includes(cleanPassword) || (customPassword && customPassword === cleanPassword);

    try {
      // 1. Try Firebase standard sign-in
      await signInWithEmailAndPassword(auth, cleanEmail, cleanPassword);
      await grantAccess(cleanEmail);
    } catch (firebaseErr: any) {
      const code = firebaseErr?.code || '';

      // 2. If user not found and password is valid, try auto-creating the account in Firebase
      if ((code === 'auth/user-not-found' || code === 'auth/invalid-credential') && (isMasterPassword || cleanPassword.length >= 6)) {
        try {
          await createUserWithEmailAndPassword(auth, cleanEmail, cleanPassword);
          await grantAccess(cleanEmail);
          return;
        } catch {
          // Fall through to master password check
        }
      }

      // 3. Fallback: If password matches master password or custom password, authenticate locally & anonymously in Firebase
      if (isMasterPassword) {
        try {
          if (!auth.currentUser) {
            await signInAnonymously(auth);
          }
        } catch {
          // offline mode
        }
        await grantAccess(cleanEmail);
      } else {
        recordFailedAttempt();
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Authenticate via 6-Digit PIN Code
  const handlePinLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutRemainingSeconds > 0) return;

    const cleanPin = pinInput.trim();
    if (cleanPin.length < 4) {
      setAuthError('Veuillez saisir votre code PIN à 6 chiffres.');
      return;
    }

    setIsLoading(true);
    setAuthError(null);

    const customPin = localStorage.getItem('maison_vans_custom_admin_pin');
    const isMasterPin = MASTER_PINS.includes(cleanPin) || (customPin && customPin === cleanPin);

    if (isMasterPin) {
      try {
        if (!auth.currentUser) {
          await signInAnonymously(auth);
        }
      } catch {
        // offline
      }
      await grantAccess(settings.email || 'mutangilwaivan@gmail.com');
    } else {
      recordFailedAttempt();
    }
    setIsLoading(false);
  };

  // Reset Password via PIN (Instant on screen)
  const handleResetViaPin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPin = resetPinInput.trim();
    const customPin = localStorage.getItem('maison_vans_custom_admin_pin');
    const isMasterPin = MASTER_PINS.includes(cleanPin) || (customPin && customPin === cleanPin);

    if (!isMasterPin) {
      setAuthError('Code PIN incorrect. Utilisez le code secret Atelier (ex: 243842 ou 842732).');
      return;
    }

    if (resetNewPassword.length < 6) {
      setAuthError('Le nouveau mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    if (resetNewPassword !== resetConfirmPassword) {
      setAuthError('Les deux mots de passe ne correspondent pas.');
      return;
    }

    setIsLoading(true);
    try {
      // Save new custom password
      localStorage.setItem('maison_vans_custom_admin_password', resetNewPassword);
      
      // Try to create/sync Firebase user if possible
      const cleanEmail = emailInput.trim().toLowerCase();
      try {
        await createUserWithEmailAndPassword(auth, cleanEmail, resetNewPassword);
      } catch {
        try {
          await signInWithEmailAndPassword(auth, cleanEmail, resetNewPassword);
        } catch {
          if (!auth.currentUser) {
            await signInAnonymously(auth);
          }
        }
      }

      setAuthSuccessMessage('✅ Mot de passe mis à jour avec succès ! Connexion immédiate en cours...');
      setTimeout(() => {
        grantAccess(cleanEmail);
      }, 1000);
    } catch {
      setAuthError('Erreur lors de la réinitialisation. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  // Reset Password via Firebase Email Link
  const handleResetViaEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = emailInput.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@')) {
      setAuthError('Veuillez saisir une adresse email valide.');
      return;
    }

    setIsLoading(true);
    setAuthError(null);
    try {
      const actionCodeSettings = {
        url: window.location.origin + '/#admin',
        handleCodeInApp: false,
      };
      await sendPasswordResetEmail(auth, cleanEmail, actionCodeSettings);
      setAuthSuccessMessage(
        `✅ Un email avec le lien de réinitialisation a été envoyé à ${cleanEmail}. Vérifiez votre boîte de réception et vos spams.`
      );
      setShowResetModal(false);
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/user-not-found' || code === 'auth/invalid-credential') {
        setAuthError('Cette adresse email n\'est pas encore enregistrée sur Firebase. Utilisez l\'option "Code PIN" pour définir votre mot de passe instantanément.');
      } else {
        setAuthError(`Erreur : ${err?.message || 'Vérifiez votre connexion internet.'}`);
      }
    } finally {
      setIsLoading(false);
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
            Accès confidentiel réservé à la direction de la Maison Van's Creation.
          </p>
        </div>

        {/* Lockout Warning Banner with Quick Unlock */}
        {lockoutRemainingSeconds > 0 && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs space-y-2">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Accès temporairement verrouillé</p>
                <p className="mt-0.5">Veuillez patienter <strong>{lockoutRemainingSeconds}s</strong> avant de réessayer.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={clearFailedAttempts}
              className="text-[11px] font-bold text-rose-700 underline hover:text-rose-900 cursor-pointer block text-right"
            >
              Débloquer immédiatement
            </button>
          </div>
        )}

        {/* Success Banner */}
        {authSuccessMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p>{authSuccessMessage}</p>
          </div>
        )}

        {/* Error Banner */}
        {authError && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{authError}</span>
          </div>
        )}

        {/* Auth Mode Tabs */}
        {!showResetModal && (
          <div className="grid grid-cols-2 p-1 bg-[#FAF8F5] rounded-2xl border border-[#E8E1D7] text-xs font-bold text-[#8C7A6B]">
            <button
              type="button"
              onClick={() => { setAuthMode('password'); setAuthError(null); }}
              className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMode === 'password' ? 'bg-[#181512] text-[#FAF8F5] shadow-sm' : 'hover:text-[#181512]'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Mot de Passe</span>
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('pin'); setAuthError(null); }}
              className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMode === 'pin' ? 'bg-[#181512] text-[#FAF8F5] shadow-sm' : 'hover:text-[#181512]'
              }`}
            >
              <Hash className="w-3.5 h-3.5" />
              <span>Code PIN (6 chiffres)</span>
            </button>
          </div>
        )}

        {/* Form 1: Password Login */}
        {!showResetModal && authMode === 'password' && (
          <form onSubmit={handlePasswordLogin} className="space-y-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
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
                  onChange={(e) => { setEmailInput(e.target.value); setAuthError(null); }}
                  placeholder="mutangilwaivan@gmail.com"
                  className="w-full bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl px-4 py-3 pl-10 text-sm text-[#181512] placeholder-[#A39688] focus:outline-none focus:border-[#1B4332] transition-all disabled:opacity-50"
                />
                <Mail className="w-4 h-4 text-[#8C7A6B] absolute left-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[10.5px] font-bold uppercase tracking-wider text-[#8C7A6B]">
                  Mot de Passe
                </label>
                <button
                  type="button"
                  onClick={() => { setShowResetModal(true); setAuthError(null); }}
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
                  onChange={(e) => { setPasswordInput(e.target.value); setAuthError(null); }}
                  placeholder="••••••••••••"
                  className="w-full bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl px-4 py-3 pl-10 pr-10 text-sm text-[#181512] placeholder-[#A39688] focus:outline-none focus:border-[#1B4332] transition-all disabled:opacity-50"
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
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-[#5C5247]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded text-[#1B4332] focus:ring-[#1B4332]"
                />
                <span>Mémoriser ma session Atelier</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading || lockoutRemainingSeconds > 0}
              className="w-full py-3.5 bg-[#181512] hover:bg-[#1B4332] text-[#FAF8F5] rounded-xl text-xs font-bold uppercase tracking-[0.16em] shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[#C5A880]" />
                  <span>Connexion en cours...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4 text-[#C5A880]" />
                  <span>Connexion Atelier</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Form 2: PIN Code Login */}
        {!showResetModal && authMode === 'pin' && (
          <form onSubmit={handlePinLogin} className="space-y-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E8E1D7] text-xs text-[#5C5247]">
              Saisissez votre code PIN secret à 6 chiffres pour accéder directement au tableau de bord.
            </div>

            <div>
              <label className="text-[10.5px] font-bold uppercase tracking-wider text-[#8C7A6B] block mb-1">
                Code PIN Confidentiel (6 chiffres)
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  maxLength={6}
                  disabled={lockoutRemainingSeconds > 0 || isLoading}
                  value={pinInput}
                  onChange={(e) => { setPinInput(e.target.value.replace(/\D/g, '')); setAuthError(null); }}
                  placeholder="243842"
                  className="w-full bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl px-4 py-3 pl-10 text-center text-lg tracking-[0.3em] font-mono text-[#181512] placeholder-[#A39688] focus:outline-none focus:border-[#1B4332] transition-all disabled:opacity-50"
                />
                <Hash className="w-4 h-4 text-[#8C7A6B] absolute left-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || lockoutRemainingSeconds > 0 || pinInput.length < 4}
              className="w-full py-3.5 bg-[#181512] hover:bg-[#1B4332] text-[#FAF8F5] rounded-xl text-xs font-bold uppercase tracking-[0.16em] shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[#C5A880]" />
                  <span>Validation du Code...</span>
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4 text-[#C5A880]" />
                  <span>Déverrouiller l'Atelier</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Modal: Forgot Password / Recovery */}
        {showResetModal && (
          <div className="space-y-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <div className="flex items-center justify-between border-b border-[#F0EAE1] pb-2">
              <h3 className="text-sm font-bold text-[#181512] flex items-center gap-1.5">
                <KeyRound className="w-4 h-4 text-[#C5A880]" />
                <span>Récupération d'Accès</span>
              </h3>
              <button
                type="button"
                onClick={() => { setShowResetModal(false); setAuthError(null); }}
                className="text-xs text-[#8C7A6B] hover:text-[#181512] cursor-pointer"
              >
                ✕ Fermer
              </button>
            </div>

            {/* Reset Tabs */}
            <div className="grid grid-cols-2 p-1 bg-[#FAF8F5] rounded-xl border border-[#E8E1D7] text-xs font-bold text-[#8C7A6B]">
              <button
                type="button"
                onClick={() => { setResetMode('pin'); setAuthError(null); }}
                className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                  resetMode === 'pin' ? 'bg-[#181512] text-white shadow-xs' : 'hover:text-[#181512]'
                }`}
              >
                Par Code PIN (Direct)
              </button>
              <button
                type="button"
                onClick={() => { setResetMode('email'); setAuthError(null); }}
                className={`py-1.5 rounded-lg transition-all cursor-pointer ${
                  resetMode === 'email' ? 'bg-[#181512] text-white shadow-xs' : 'hover:text-[#181512]'
                }`}
              >
                Par Lien Email
              </button>
            </div>

            {/* Reset Option 1: Instant via PIN */}
            {resetMode === 'pin' ? (
              <form onSubmit={handleResetViaPin} className="space-y-3">
                <div className="p-2.5 bg-amber-50/70 border border-amber-200 rounded-xl text-[11px] text-amber-900">
                  💡 Entrez le code secret Atelier (par défaut : <strong>243842</strong> ou <strong>842732</strong>) pour définir instantanément votre nouveau mot de passe.
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#8C7A6B] block mb-1">
                    Code PIN Secret (6 chiffres)
                  </label>
                  <input
                    type="password"
                    required
                    maxLength={6}
                    value={resetPinInput}
                    onChange={(e) => setResetPinInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="243842"
                    className="w-full bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl px-3 py-2 text-center text-sm font-mono tracking-[0.2em]"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#8C7A6B] block mb-1">
                    Nouveau Mot de Passe
                  </label>
                  <input
                    type="password"
                    required
                    value={resetNewPassword}
                    onChange={(e) => setResetNewPassword(e.target.value)}
                    placeholder="Min. 6 caractères"
                    className="w-full bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#8C7A6B] block mb-1">
                    Confirmer le Nouveau Mot de Passe
                  </label>
                  <input
                    type="password"
                    required
                    value={resetConfirmPassword}
                    onChange={(e) => setResetConfirmPassword(e.target.value)}
                    placeholder="Retapez le mot de passe"
                    className="w-full bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading || resetPinInput.length < 4 || resetNewPassword.length < 6}
                  className="w-full py-3 bg-[#181512] hover:bg-[#1B4332] text-[#FAF8F5] rounded-xl text-xs font-bold uppercase tracking-wider shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? 'Mise à jour en cours...' : 'Enregistrer & Me Connecter'}
                </button>
              </form>
            ) : (
              /* Reset Option 2: Firebase Email Link */
              <form onSubmit={handleResetViaEmail} className="space-y-3">
                <div className="p-2.5 bg-[#FAF8F5] border border-[#E8E1D7] rounded-xl text-[11px] text-[#5C5247]">
                  Un lien sécurisé de réinitialisation vous sera envoyé par email.
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-[#8C7A6B] block mb-1">
                    Adresse Email
                  </label>
                  <input
                    type="email"
                    required
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="mutangilwaivan@gmail.com"
                    className="w-full bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl px-3 py-2 text-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 bg-[#181512] hover:bg-[#1B4332] text-[#FAF8F5] rounded-xl text-xs font-bold uppercase tracking-wider shadow-md transition-all cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? 'Envoi...' : 'Envoyer le lien par Email'}
                </button>
              </form>
            )}

            <button
              type="button"
              onClick={() => { setShowResetModal(false); setAuthError(null); }}
              className="w-full text-center text-xs text-[#8C7A6B] hover:text-[#181512] transition-colors py-1 cursor-pointer"
            >
              ← Retour à l'écran de connexion
            </button>
          </div>
        )}

        {/* Credentials Emergency Help Tooltip / Accordion */}
        <div className="pt-2 border-t border-[#F0EAE1] space-y-2">
          <button
            type="button"
            onClick={() => setShowCredentialsHelp(!showCredentialsHelp)}
            className="w-full flex items-center justify-center gap-1 text-[11px] text-[#8C7A6B] hover:text-[#181512] transition-colors cursor-pointer"
          >
            <HelpCircle className="w-3 h-3 text-[#C5A880]" />
            <span>Identifiants & Codes de secours Atelier</span>
          </button>

          {showCredentialsHelp && (
            <div className="p-3 bg-[#FAF8F5] border border-[#E8E1D7] rounded-2xl text-[11px] text-[#5C5247] space-y-1.5 animate-fadeIn">
              <p className="font-bold text-[#181512]">Accès de secours préconfigurés :</p>
              <div className="flex items-center justify-between py-0.5 border-b border-[#E8E1D7]">
                <span>Code PIN rapide :</span>
                <strong className="font-mono text-[#181512]">243842</strong>
              </div>
              <div className="flex items-center justify-between py-0.5 border-b border-[#E8E1D7]">
                <span>Code PIN alternatif :</span>
                <strong className="font-mono text-[#181512]">842732</strong>
              </div>
              <div className="flex items-center justify-between py-0.5">
                <span>Mot de passe maître :</span>
                <strong className="font-mono text-[#181512]">Vanessa2026!</strong>
              </div>
            </div>
          )}

          <div className="text-center pt-1">
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

      </div>
    </section>
  );
};
