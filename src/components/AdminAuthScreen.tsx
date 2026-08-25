import React, { useState, useEffect } from 'react';
import { 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw,
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
  
  const [authConfig, setAuthConfig] = useState<AdminAuthConfig | null>(() => {
    const saved = localStorage.getItem(ADMIN_AUTH_STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  });
  const [isCheckingConfig, setIsCheckingConfig] = useState(true);
  const [viewMode, setViewMode] = useState<'login' | 'setup' | 'reset'>('login');

  const [emailInput, setEmailInput] = useState(settings.email || 'mutangilwaivan@gmail.com');
  const [passwordInput, setPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccessMessage, setAuthSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [failedAttempts, setFailedAttempts] = useState<number>(() => {
    const saved = localStorage.getItem('maison_vans_auth_failed_attempts');
    return saved ? parseInt(saved, 10) || 0 : 0;
  });
  const [lockoutUntil, setLockoutUntil] = useState<number>(() => {
    const saved = localStorage.getItem('maison_vans_auth_lockout_until');
    return saved ? parseInt(saved, 10) || 0 : 0;
  });
  const [lockoutRemainingSeconds, setLockoutRemainingSeconds] = useState<number>(0);

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
          setViewMode(data.isConfigured && data.passwordHash ? 'login' : 'setup');
        } else if (isMounted) {
          const localSaved = localStorage.getItem(ADMIN_AUTH_STORAGE_KEY);
          setViewMode(localSaved ? 'login' : 'setup');
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
      setAuthError('Accès temporairement suspendu (60s).');
    } else {
      setAuthError(`Mot de passe incorrect. (${MAX_FAILED_ATTEMPTS - next} restante(s))`);
    }
  };

  const grantAccess = (userEmail: string) => {
    setFailedAttempts(0);
    setLockoutUntil(0);
    localStorage.removeItem('maison_vans_auth_failed_attempts');
    localStorage.removeItem('maison_vans_auth_lockout_until');
    
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

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = emailInput.trim().toLowerCase();
    const cleanPassword = passwordInput.trim();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setAuthError('Email invalide.');
      return;
    }
    if (cleanPassword.length < 6) {
      setAuthError('Mot de passe trop court (min. 6 caractères).');
      return;
    }
    if (cleanPassword !== confirmPasswordInput) {
      setAuthError('Les mots de passe ne correspondent pas.');
      return;
    }

    setIsLoading(true);
    setAuthError(null);

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
        console.warn('Firestore setDoc notice:', err);
      }

      localStorage.setItem(ADMIN_AUTH_STORAGE_KEY, JSON.stringify(newConfig));
      setAuthConfig(newConfig);
      grantAccess(cleanEmail);
    } catch (err: any) {
      setAuthError(`Erreur : ${err?.message || 'Veuillez réessayer.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutRemainingSeconds > 0) return;

    const cleanEmail = emailInput.trim().toLowerCase();
    const cleanPassword = passwordInput.trim();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setAuthError('Email invalide.');
      return;
    }
    if (!cleanPassword || cleanPassword.length < 6) {
      setAuthError('Veuillez saisir votre mot de passe.');
      return;
    }

    setIsLoading(true);
    setAuthError(null);

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
          // offline
        }
      }

      if (isVerified) {
        grantAccess(cleanEmail);
      } else {
        recordFailedAttempt();
      }
    } catch {
      recordFailedAttempt();
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingConfig) {
    return (
      <section className="min-h-[70vh] flex items-center justify-center bg-[#FAF8F5]">
        <div className="flex flex-col items-center gap-3 text-[#C5A880]">
          <div className="w-8 h-8 rounded-full border-2 border-[#C5A880]/30 border-t-[#C5A880] animate-spin" />
        </div>
      </section>
    );
  }

  return (
    <section id="admin-login-screen" className="min-h-[85vh] bg-[#FAF8F5] flex items-center justify-center px-4 py-12 select-none">
      <div className="max-w-sm w-full bg-white p-8 sm:p-10 rounded-3xl border border-[#EAE3DA] shadow-xl space-y-6">
        
        {/* Brand Minimalist Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#181512] text-[#D4AF37] flex items-center justify-center mx-auto shadow-sm">
            <Crown className="w-6 h-6" />
          </div>
          
          <h1 className="text-xl font-bold text-[#181512] tracking-wide" style={{ fontFamily: "'Cinzel', serif" }}>
            {viewMode === 'setup' ? 'Création d’Accès' : viewMode === 'reset' ? 'Nouveau Mot de Passe' : 'Atelier Privé'}
          </h1>
          
          <p className="text-xs text-[#8C7A6B]">
            {viewMode === 'setup' ? 'Définissez votre mot de passe confidentiel.' : viewMode === 'reset' ? 'Choisissez votre nouveau mot de passe.' : 'Maison Van’s Creation'}
          </p>
        </div>

        {/* Status Messages */}
        {lockoutRemainingSeconds > 0 && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Accès suspendu ({lockoutRemainingSeconds}s).</span>
          </div>
        )}

        {authError && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{authError}</span>
          </div>
        )}

        {/* LOGIN FORM */}
        {viewMode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4 text-xs" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <div className="space-y-1">
              <label className="font-semibold text-[#8C7A6B] block">Email</label>
              <input
                type="email"
                required
                disabled={lockoutRemainingSeconds > 0 || isLoading}
                value={emailInput}
                onChange={(e) => { setEmailInput(e.target.value); setAuthError(null); }}
                placeholder="mutangilwaivan@gmail.com"
                className="w-full bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl px-3.5 py-2.5 text-xs text-[#181512] focus:outline-none focus:border-[#C5A880]"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-[#8C7A6B]">Mot de passe</label>
                <button
                  type="button"
                  onClick={() => { setViewMode('reset'); setAuthError(null); }}
                  className="text-[11px] text-[#C5A880] hover:underline cursor-pointer"
                >
                  Oublié ?
                </button>
              </div>
              
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={lockoutRemainingSeconds > 0 || isLoading}
                  value={passwordInput}
                  onChange={(e) => { setPasswordInput(e.target.value); setAuthError(null); }}
                  placeholder="••••••••••••"
                  className="w-full bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl px-3.5 py-2.5 pr-10 text-xs text-[#181512] focus:outline-none focus:border-[#C5A880]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-[#8C7A6B] hover:text-[#181512] cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-0.5">
              <input
                type="checkbox"
                id="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-[#D8CFC4] text-[#181512] focus:ring-[#C5A880]"
              />
              <label htmlFor="rememberMe" className="text-[11px] text-[#6B5F54] cursor-pointer">
                Mémoriser la session
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading || lockoutRemainingSeconds > 0}
              className="w-full py-3 bg-[#181512] hover:bg-[#2C2621] text-[#FAF8F5] rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
            >
              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin text-[#C5A880]" /> : 'Connexion'}
            </button>
          </form>
        )}

        {/* SETUP / RESET FORM */}
        {(viewMode === 'setup' || viewMode === 'reset') && (
          <form onSubmit={handleSetup} className="space-y-3.5 text-xs" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <div className="space-y-1">
              <label className="font-semibold text-[#8C7A6B] block">Email</label>
              <input
                type="email"
                required
                disabled={isLoading}
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="mutangilwaivan@gmail.com"
                className="w-full bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl px-3.5 py-2.5 text-xs text-[#181512] focus:outline-none focus:border-[#C5A880]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#8C7A6B] block">Nouveau Mot de Passe</label>
              <input
                type="password"
                required
                disabled={isLoading}
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Min. 6 caractères"
                className="w-full bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl px-3.5 py-2.5 text-xs text-[#181512] focus:outline-none focus:border-[#C5A880]"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-[#8C7A6B] block">Confirmer</label>
              <input
                type="password"
                required
                disabled={isLoading}
                value={confirmPasswordInput}
                onChange={(e) => setConfirmPasswordInput(e.target.value)}
                placeholder="Retapez le mot de passe"
                className="w-full bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl px-3.5 py-2.5 text-xs text-[#181512] focus:outline-none focus:border-[#C5A880]"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || passwordInput.length < 6}
              className="w-full py-3 bg-[#181512] hover:bg-[#2C2621] text-[#FAF8F5] rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer disabled:opacity-50 shadow-sm"
            >
              {isLoading ? <RefreshCw className="w-4 h-4 animate-spin text-[#C5A880]" /> : 'Enregistrer & Ouvrir'}
            </button>

            {viewMode === 'reset' && (
              <button
                type="button"
                onClick={() => { setViewMode('login'); setAuthError(null); }}
                className="w-full text-center text-[11px] text-[#8C7A6B] hover:text-[#181512] pt-1 cursor-pointer"
              >
                Annuler
              </button>
            )}
          </form>
        )}

        {/* Back Link */}
        <div className="text-center pt-2 border-t border-[#F0EAE1]">
          <button
            type="button"
            onClick={onCancel}
            className="text-[11px] text-[#8C7A6B] hover:text-[#181512] cursor-pointer inline-flex items-center gap-1"
          >
            <ChevronLeft className="w-3 h-3" />
            <span>Retour au catalogue</span>
          </button>
        </div>

      </div>
    </section>
  );
};
