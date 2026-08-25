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
  UserCheck,
  RotateCcw,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useStudio } from '../context/StudioContext';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { 
  hashPassword, 
  verifyPassword, 
  AdminAuthConfig, 
  ADMIN_AUTH_STORAGE_KEY 
} from '../lib/security';

interface AdminAuthScreenProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 60 * 1000; // 1 minute lockout

export const AdminAuthScreen: React.FC<AdminAuthScreenProps> = ({
  onSuccess,
  onCancel,
}) => {
  const { settings, setAdminAuthenticated } = useStudio();
  
  // Security Config from Firestore
  const [authConfig, setAuthConfig] = useState<AdminAuthConfig | null>(() => {
    const saved = localStorage.getItem(ADMIN_AUTH_STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  });
  const [isCheckingConfig, setIsCheckingConfig] = useState(true);

  // Mode: 'login' | 'setup' | 'reset'
  const [viewMode, setViewMode] = useState<'login' | 'setup' | 'reset'>('login');

  // Form Inputs
  const [emailInput, setEmailInput] = useState(settings.email || 'mutangilwaivan@gmail.com');
  const [passwordInput, setPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Status & Feedback
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccessMessage, setAuthSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Lockout State
  const [failedAttempts, setFailedAttempts] = useState<number>(() => {
    const saved = localStorage.getItem('maison_vans_auth_failed_attempts');
    return saved ? parseInt(saved, 10) || 0 : 0;
  });
  const [lockoutUntil, setLockoutUntil] = useState<number>(() => {
    const saved = localStorage.getItem('maison_vans_auth_lockout_until');
    return saved ? parseInt(saved, 10) || 0 : 0;
  });
  const [lockoutRemainingSeconds, setLockoutRemainingSeconds] = useState<number>(0);

  // Fetch security configuration from Firestore on mount
  useEffect(() => {
    let isMounted = true;
    const fetchConfig = async () => {
      try {
        const docRef = doc(db, 'settings', 'admin_auth');
        const snap = await getDoc(docRef);
        if (snap.exists() && isMounted) {
          const data = snap.data() as AdminAuthConfig;
          setAuthConfig(data);
          localStorage.setItem(ADMIN_AUTH_STORAGE_KEY, JSON.stringify(data));
          if (data.isConfigured && data.passwordHash) {
            setViewMode('login');
          } else {
            setViewMode('setup');
          }
        } else if (isMounted) {
          const localSaved = localStorage.getItem(ADMIN_AUTH_STORAGE_KEY);
          if (!localSaved) {
            setViewMode('setup');
          } else {
            setViewMode('login');
          }
        }
      } catch (err) {
        console.warn('Firestore load security notice:', err);
      } finally {
        if (isMounted) setIsCheckingConfig(false);
      }
    };

    fetchConfig();
    return () => { isMounted = false; };
  }, []);

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
    const next = failedAttempts + 1;
    setFailedAttempts(next);
    localStorage.setItem('maison_vans_auth_failed_attempts', next.toString());

    if (next >= MAX_FAILED_ATTEMPTS) {
      const lockTime = Date.now() + LOCKOUT_DURATION_MS;
      setLockoutUntil(lockTime);
      localStorage.setItem('maison_vans_auth_lockout_until', lockTime.toString());
      setAuthError(`Trop de tentatives infructueuses. Accès suspendu temporairement pour des raisons de sécurité.`);
    } else {
      setAuthError(`Mot de passe incorrect. (${MAX_FAILED_ATTEMPTS - next} tentative(s) restante(s))`);
    }
  };

  const clearFailedAttempts = () => {
    setFailedAttempts(0);
    setLockoutUntil(0);
    localStorage.removeItem('maison_vans_auth_failed_attempts');
    localStorage.removeItem('maison_vans_auth_lockout_until');
  };

  const grantAccess = (userEmail: string) => {
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

  // --- 1. SETUP / INITIAL CONFIGURATION ---
  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = emailInput.trim().toLowerCase();
    const cleanPassword = passwordInput.trim();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setAuthError('Veuillez saisir une adresse email valide.');
      return;
    }
    if (cleanPassword.length < 6) {
      setAuthError('Le mot de passe doit comporter au moins 6 caractères.');
      return;
    }
    if (cleanPassword !== confirmPasswordInput) {
      setAuthError('Les deux mots de passe ne correspondent pas.');
      return;
    }

    setIsLoading(true);
    setAuthError(null);
    setAuthSuccessMessage(null);

    try {
      const salt = `salt_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const pHash = await hashPassword(cleanPassword, salt);

      const newConfig: AdminAuthConfig = {
        email: cleanEmail,
        passwordHash: pHash,
        salt,
        updatedAt: new Date().toISOString(),
        isConfigured: true,
      };

      // Save to Firestore
      try {
        await setDoc(doc(db, 'settings', 'admin_auth'), newConfig);
      } catch (err) {
        console.warn('Firestore setDoc admin_auth notice:', err);
      }

      // Save to localStorage
      localStorage.setItem(ADMIN_AUTH_STORAGE_KEY, JSON.stringify(newConfig));
      setAuthConfig(newConfig);

      setAuthSuccessMessage('✅ Mot de passe administrateur configuré avec succès ! Connexion immédiate...');
      setTimeout(() => {
        grantAccess(cleanEmail);
      }, 700);
    } catch (err: any) {
      setAuthError(`Erreur lors de la configuration : ${err?.message || 'Veuillez réessayer.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // --- 2. LOGIN WITH PASSWORD ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutRemainingSeconds > 0) return;

    const cleanEmail = emailInput.trim().toLowerCase();
    const cleanPassword = passwordInput.trim();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setAuthError('Veuillez saisir une adresse email valide.');
      return;
    }
    if (!cleanPassword || cleanPassword.length < 6) {
      setAuthError('Veuillez saisir votre mot de passe d’accès.');
      return;
    }

    setIsLoading(true);
    setAuthError(null);
    setAuthSuccessMessage(null);

    try {
      let isVerified = false;

      // 1. Check against Firestore config
      if (authConfig?.passwordHash && authConfig?.salt) {
        isVerified = await verifyPassword(cleanPassword, authConfig.passwordHash, authConfig.salt);
      }

      // 2. If not verified from memory, attempt fresh fetch from Firestore
      if (!isVerified) {
        try {
          const snap = await getDoc(doc(db, 'settings', 'admin_auth'));
          if (snap.exists()) {
            const data = snap.data() as AdminAuthConfig;
            setAuthConfig(data);
            localStorage.setItem(ADMIN_AUTH_STORAGE_KEY, JSON.stringify(data));
            if (data.passwordHash && data.salt) {
              isVerified = await verifyPassword(cleanPassword, data.passwordHash, data.salt);
            }
          }
        } catch {
          // offline
        }
      }

      if (isVerified) {
        grantAccess(cleanEmail);
      } else {
        recordFailedAttempt();
      }
    } catch (err: any) {
      recordFailedAttempt();
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingConfig) {
    return (
      <section className="py-20 bg-[#FAF8F5] min-h-[70vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-[#8C7A6B]">
          <RefreshCw className="w-6 h-6 animate-spin text-[#C5A880]" />
          <span className="text-xs tracking-wider uppercase font-semibold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Vérification de la sécurité Atelier...
          </span>
        </div>
      </section>
    );
  }

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
            {viewMode === 'setup' 
              ? 'Configuration de l’Atelier' 
              : viewMode === 'reset'
              ? 'Nouveau Mot de Passe'
              : 'Espace Atelier Privé'}
          </h2>
          <p className="text-xs text-[#6B5F54] leading-relaxed" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {viewMode === 'setup'
              ? 'Définissez votre mot de passe confidentiel pour sécuriser l’accès à votre Atelier.'
              : viewMode === 'reset'
              ? 'Définissez un nouveau mot de passe administrateur pour votre espace.'
              : 'Accès sécurisé réservé à la direction de la Maison Van’s Creation.'}
          </p>
        </div>

        {/* Lockout Banner */}
        {lockoutRemainingSeconds > 0 && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Accès temporairement suspendu</p>
              <p className="mt-0.5">Veuillez patienter <strong>{lockoutRemainingSeconds}s</strong> avant de réessayer.</p>
            </div>
          </div>
        )}

        {/* Success Banner */}
        {authSuccessMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs flex items-start gap-2.5 leading-relaxed">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p>{authSuccessMessage}</p>
          </div>
        )}

        {/* Error Banner */}
        {authError && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2 leading-relaxed">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{authError}</span>
          </div>
        )}

        {/* --- 1. LOGIN FORM --- */}
        {viewMode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <div>
              <label className="text-[10.5px] font-bold uppercase tracking-wider text-[#8C7A6B] block mb-1">
                Adresse Email Administrateur
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
                  onClick={() => { setViewMode('reset'); setAuthError(null); setAuthSuccessMessage(null); }}
                  className="text-[10.5px] text-[#C5A880] hover:text-[#181512] transition-colors font-medium cursor-pointer"
                >
                  Modifier mon mot de passe
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
              className="w-full py-3.5 bg-[#181512] hover:bg-[#1B4332] text-[#FAF8F5] rounded-xl text-xs font-bold uppercase tracking-[0.16em] shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[#C5A880]" />
                  <span>Vérification sécurisée...</span>
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

        {/* --- 2. INITIAL SETUP / RESET PASSWORD FORM --- */}
        {(viewMode === 'setup' || viewMode === 'reset') && (
          <form onSubmit={handleSetup} className="space-y-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed">
              ✨ <strong>{viewMode === 'setup' ? 'Configuration Initiale' : 'Définition du Mot de Passe'} :</strong> Saisissez votre adresse email et choisissez votre mot de passe d’accès confidentiel (minimum 6 caractères).
            </div>

            <div>
              <label className="text-[10.5px] font-bold uppercase tracking-wider text-[#8C7A6B] block mb-1">
                Adresse Email Administrateur
              </label>
              <input
                type="email"
                required
                disabled={isLoading}
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="mutangilwaivan@gmail.com"
                className="w-full bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl px-4 py-2.5 text-xs text-[#181512] focus:outline-none focus:border-[#1B4332]"
              />
            </div>

            <div>
              <label className="text-[10.5px] font-bold uppercase tracking-wider text-[#8C7A6B] block mb-1">
                Mot de Passe (Min. 6 caractères)
              </label>
              <input
                type="password"
                required
                disabled={isLoading}
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Votre mot de passe confidentiel"
                className="w-full bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl px-4 py-2.5 text-xs text-[#181512] focus:outline-none focus:border-[#1B4332]"
              />
            </div>

            <div>
              <label className="text-[10.5px] font-bold uppercase tracking-wider text-[#8C7A6B] block mb-1">
                Confirmer le Mot de Passe
              </label>
              <input
                type="password"
                required
                disabled={isLoading}
                value={confirmPasswordInput}
                onChange={(e) => setConfirmPasswordInput(e.target.value)}
                placeholder="Retapez le mot de passe"
                className="w-full bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl px-4 py-2.5 text-xs text-[#181512] focus:outline-none focus:border-[#1B4332]"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || passwordInput.length < 6}
              className="w-full py-3.5 bg-[#181512] hover:bg-[#1B4332] text-[#FAF8F5] rounded-xl text-xs font-bold uppercase tracking-[0.16em] shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[#C5A880]" />
                  <span>Enregistrement en cours...</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4 text-[#C5A880]" />
                  <span>Enregistrer & Accéder à l’Atelier</span>
                </>
              )}
            </button>

            {viewMode === 'reset' && (
              <button
                type="button"
                onClick={() => { setViewMode('login'); setAuthError(null); }}
                className="w-full text-center text-xs text-[#8C7A6B] hover:text-[#181512] transition-colors py-1 cursor-pointer"
              >
                ← Annuler et revenir à la connexion
              </button>
            )}
          </form>
        )}

        {/* Public Catalog Link */}
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
