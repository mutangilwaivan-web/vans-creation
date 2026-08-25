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
  ArrowRight,
  Crown,
  ChevronLeft
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
const LOCKOUT_DURATION_MS = 60 * 1000;

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

  // View Mode: 'login' | 'setup' | 'reset'
  const [viewMode, setViewMode] = useState<'login' | 'setup' | 'reset'>('login');

  // Inputs
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
        console.warn('Firestore security load notice:', err);
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
      setAuthError(`Trop de tentatives infructueuses. Accès suspendu temporairement (60s).`);
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

  // --- 1. SETUP / RESET HANDLER ---
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

      try {
        await setDoc(doc(db, 'settings', 'admin_auth'), newConfig);
      } catch (err) {
        console.warn('Firestore setDoc admin_auth notice:', err);
      }

      localStorage.setItem(ADMIN_AUTH_STORAGE_KEY, JSON.stringify(newConfig));
      setAuthConfig(newConfig);

      setAuthSuccessMessage('✅ Mot de passe configuré avec succès ! Connexion immédiate...');
      setTimeout(() => {
        grantAccess(cleanEmail);
      }, 700);
    } catch (err: any) {
      setAuthError(`Erreur lors de la configuration : ${err?.message || 'Veuillez réessayer.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // --- 2. LOGIN HANDLER ---
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

      if (authConfig?.passwordHash && authConfig?.salt) {
        isVerified = await verifyPassword(cleanPassword, authConfig.passwordHash, authConfig.salt);
      }

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
          // offline fallback
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
      <section className="min-h-screen bg-[#141210] flex items-center justify-center relative overflow-hidden">
        <div className="flex flex-col items-center gap-4 text-[#C5A880]">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-2 border-[#C5A880]/20 border-t-[#C5A880] animate-spin" />
            <Crown className="w-5 h-5 text-[#C5A880] absolute inset-0 m-auto" />
          </div>
          <span className="text-xs tracking-[0.25em] uppercase font-bold text-[#D4AF37]" style={{ fontFamily: "'Cinzel', serif" }}>
            Maison Van's Creation
          </span>
        </div>
      </section>
    );
  }

  return (
    <section id="admin-login-screen" className="min-h-screen bg-[#FAF8F5] flex items-center justify-center px-4 sm:px-6 py-12 relative overflow-hidden select-none">
      
      {/* Decorative Ambient Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-b from-[#C5A880]/15 via-[#E8D8C4]/10 to-transparent blur-3xl pointer-events-none rounded-full" />
      <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-[#181512]/5 blur-2xl rounded-full pointer-events-none" />

      {/* Main Luxury Glass Card */}
      <div className="max-w-md w-full bg-white/95 backdrop-blur-xl p-7 sm:p-10 rounded-3xl border border-[#E5DDD2] shadow-[0_25px_60px_-15px_rgba(24,21,18,0.12)] space-y-7 relative z-10">
        
        {/* Top Champagne Gold Fine Border Line */}
        <div className="absolute top-0 left-8 right-8 h-[2px] bg-gradient-to-r from-transparent via-[#C5A880] to-transparent" />

        {/* Brand Luxury Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#181512] text-[#D4AF37] shadow-md border border-[#3D352E] mx-auto transform hover:scale-105 transition-transform duration-300">
            <Crown className="w-7 h-7" />
          </div>
          
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#FAF8F5] border border-[#E5DDD2] text-[#8C7A6B] text-[10px] font-bold uppercase tracking-[0.2em] mb-1.5">
              <Sparkles className="w-3 h-3 text-[#C5A880]" />
              <span>Haute Couture Kinshasa</span>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-bold text-[#181512] tracking-wide" style={{ fontFamily: "'Cinzel', serif" }}>
              {viewMode === 'setup' 
                ? 'Configuration Atelier' 
                : viewMode === 'reset'
                ? 'Nouveau Mot de Passe'
                : 'Espace Atelier Privé'}
            </h1>
            
            <p className="text-xs text-[#6B5F54] mt-1 italic" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
              {viewMode === 'setup'
                ? '« Définissez votre mot de passe pour sécuriser l’accès à votre univers de création. »'
                : viewMode === 'reset'
                ? '« Définissez votre nouveau mot de passe d’accès confidentiel. »'
                : '« Accès confidentiel réservé à la direction de la Maison Van’s Creation. »'}
            </p>
          </div>
        </div>

        {/* Lockout Warning Banner */}
        {lockoutRemainingSeconds > 0 && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs flex items-start gap-2.5 shadow-xs">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Accès temporairement suspendu</p>
              <p className="mt-0.5">Veuillez patienter <strong>{lockoutRemainingSeconds}s</strong> avant de réessayer.</p>
            </div>
          </div>
        )}

        {/* Success Banner */}
        {authSuccessMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs flex items-start gap-2.5 leading-relaxed shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p>{authSuccessMessage}</p>
          </div>
        )}

        {/* Error Banner */}
        {authError && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-start gap-2 leading-relaxed shadow-xs">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{authError}</span>
          </div>
        )}

        {/* --- 1. LOGIN FORM --- */}
        {viewMode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8C7A6B] block">
                Adresse Email Administrateur
              </label>
              <div className="relative group">
                <input
                  type="email"
                  required
                  autoComplete="username"
                  disabled={lockoutRemainingSeconds > 0 || isLoading}
                  value={emailInput}
                  onChange={(e) => { setEmailInput(e.target.value); setAuthError(null); }}
                  placeholder="mutangilwaivan@gmail.com"
                  className="w-full bg-[#FAF8F5] border border-[#E5DDD2] rounded-2xl px-4 py-3.5 pl-11 text-sm text-[#181512] placeholder-[#A89C8F] focus:outline-none focus:border-[#C5A880] focus:ring-2 focus:ring-[#C5A880]/20 transition-all duration-300 disabled:opacity-50"
                />
                <Mail className="w-4 h-4 text-[#8C7A6B] group-focus-within:text-[#C5A880] absolute left-4 top-4 pointer-events-none transition-colors" />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8C7A6B]">
                  Mot de Passe Confidentiel
                </label>
                <button
                  type="button"
                  onClick={() => { setViewMode('reset'); setAuthError(null); setAuthSuccessMessage(null); }}
                  className="text-[10.5px] text-[#C5A880] hover:text-[#181512] transition-colors font-semibold cursor-pointer underline decoration-[#C5A880]/50"
                >
                  Changer de mot de passe ?
                </button>
              </div>
              
              <div className="relative group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  disabled={lockoutRemainingSeconds > 0 || isLoading}
                  value={passwordInput}
                  onChange={(e) => { setPasswordInput(e.target.value); setAuthError(null); }}
                  placeholder="••••••••••••"
                  className="w-full bg-[#FAF8F5] border border-[#E5DDD2] rounded-2xl px-4 py-3.5 pl-11 pr-11 text-sm text-[#181512] placeholder-[#A89C8F] focus:outline-none focus:border-[#C5A880] focus:ring-2 focus:ring-[#C5A880]/20 transition-all duration-300 disabled:opacity-50"
                />
                <Lock className="w-4 h-4 text-[#8C7A6B] group-focus-within:text-[#C5A880] absolute left-4 top-4 pointer-events-none transition-colors" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-4 text-[#8C7A6B] hover:text-[#181512] cursor-pointer transition-colors"
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
                  className="w-4 h-4 rounded text-[#181512] border-[#D8CFC4] focus:ring-[#C5A880]"
                />
                <span className="text-xs font-medium">Mémoriser ma session sécurisée</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading || lockoutRemainingSeconds > 0}
              className="w-full py-4 bg-[#181512] hover:bg-[#2C2621] text-[#FAF8F5] rounded-2xl text-xs font-bold uppercase tracking-[0.2em] shadow-md hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.98] disabled:opacity-50 border border-[#3D352E] group"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[#C5A880]" />
                  <span>Authentification en cours...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4 text-[#C5A880] group-hover:rotate-12 transition-transform duration-300" />
                  <span>Accéder à l'Atelier</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* --- 2. SETUP / RESET FORM --- */}
        {(viewMode === 'setup' || viewMode === 'reset') && (
          <form onSubmit={handleSetup} className="space-y-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <div className="p-3.5 bg-[#FAF8F5] border border-[#E5DDD2] rounded-2xl text-xs text-[#5C5247] leading-relaxed">
              ✨ <strong>{viewMode === 'setup' ? 'Configuration Initiale' : 'Nouveau Mot de Passe'} :</strong> Définissez votre mot de passe d’accès confidentiel pour administrer l’Atelier Van’s Creation (minimum 6 caractères).
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8C7A6B] block">
                Adresse Email Administrateur
              </label>
              <input
                type="email"
                required
                disabled={isLoading}
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="mutangilwaivan@gmail.com"
                className="w-full bg-[#FAF8F5] border border-[#E5DDD2] rounded-2xl px-4 py-3 text-xs text-[#181512] focus:outline-none focus:border-[#C5A880] focus:ring-2 focus:ring-[#C5A880]/20 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8C7A6B] block">
                Nouveau Mot de Passe (Min. 6 caractères)
              </label>
              <input
                type="password"
                required
                disabled={isLoading}
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Votre mot de passe confidentiel"
                className="w-full bg-[#FAF8F5] border border-[#E5DDD2] rounded-2xl px-4 py-3 text-xs text-[#181512] focus:outline-none focus:border-[#C5A880] focus:ring-2 focus:ring-[#C5A880]/20 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#8C7A6B] block">
                Confirmer le Mot de Passe
              </label>
              <input
                type="password"
                required
                disabled={isLoading}
                value={confirmPasswordInput}
                onChange={(e) => setConfirmPasswordInput(e.target.value)}
                placeholder="Retapez le mot de passe"
                className="w-full bg-[#FAF8F5] border border-[#E5DDD2] rounded-2xl px-4 py-3 text-xs text-[#181512] focus:outline-none focus:border-[#C5A880] focus:ring-2 focus:ring-[#C5A880]/20 transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || passwordInput.length < 6}
              className="w-full py-4 bg-[#181512] hover:bg-[#2C2621] text-[#FAF8F5] rounded-2xl text-xs font-bold uppercase tracking-[0.2em] shadow-md transition-all flex items-center justify-center gap-2.5 cursor-pointer active:scale-[0.98] disabled:opacity-50 border border-[#3D352E]"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[#C5A880]" />
                  <span>Enregistrement sécurisé...</span>
                </>
              ) : (
                <>
                  <UserCheck className="w-4 h-4 text-[#C5A880]" />
                  <span>Enregistrer & Ouvrir l'Atelier</span>
                </>
              )}
            </button>

            {viewMode === 'reset' && (
              <button
                type="button"
                onClick={() => { setViewMode('login'); setAuthError(null); }}
                className="w-full text-center text-xs text-[#8C7A6B] hover:text-[#181512] transition-colors py-1 cursor-pointer font-medium"
              >
                ← Annuler et revenir à la connexion
              </button>
            )}
          </form>
        )}

        {/* Public Catalog Link */}
        <div className="text-center pt-3 border-t border-[#F0EAE1]">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 text-xs text-[#8C7A6B] hover:text-[#181512] transition-colors font-medium cursor-pointer"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            <span>Retour au catalogue showroom public</span>
          </button>
        </div>

      </div>
    </section>
  );
};
