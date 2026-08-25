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
  Sparkles,
  ArrowRight,
  MessageCircle,
  Key
} from 'lucide-react';
import { useStudio } from '../context/StudioContext';
import { 
  auth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInAnonymously,
  db
} from '../lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { 
  hashSecret, 
  verifySecret, 
  AdminSecurityConfig, 
  ADMIN_SECURITY_STORAGE_KEY 
} from '../lib/security';
import { generateWhatsAppLink } from '../data/initialData';

interface AdminAuthScreenProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 60 * 1000; // 1 minute lockout on brute force

export const AdminAuthScreen: React.FC<AdminAuthScreenProps> = ({
  onSuccess,
  onCancel,
}) => {
  const { settings, setAdminAuthenticated } = useStudio();
  
  // Security Config State from Firestore / Local Storage
  const [securityConfig, setSecurityConfig] = useState<AdminSecurityConfig | null>(() => {
    const saved = localStorage.getItem(ADMIN_SECURITY_STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  });
  const [isCheckingConfig, setIsCheckingConfig] = useState(true);

  // Form Views: 'login' | 'setup' | 'forgot_password'
  const [viewMode, setViewMode] = useState<'login' | 'setup' | 'forgot_password'>('login');

  // Login Form Inputs
  const [emailInput, setEmailInput] = useState(settings.email || 'mutangilwaivan@gmail.com');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Setup Form Inputs (Initial Configuration)
  const [setupPassword, setSetupPassword] = useState('');
  const [setupConfirmPassword, setSetupConfirmPassword] = useState('');
  const [setupRecoveryPin, setSetupRecoveryPin] = useState('');

  // Forgot Password / Recovery Inputs
  const [recoveryPinInput, setRecoveryPinInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmNewPasswordInput, setConfirmNewPasswordInput] = useState('');

  // Status & Feedback
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccessMessage, setAuthSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Lockout / Rate Limiting
  const [failedAttempts, setFailedAttempts] = useState<number>(() => {
    const saved = localStorage.getItem('maison_vans_auth_failed_attempts');
    return saved ? parseInt(saved, 10) || 0 : 0;
  });
  const [lockoutUntil, setLockoutUntil] = useState<number>(() => {
    const saved = localStorage.getItem('maison_vans_auth_lockout_until');
    return saved ? parseInt(saved, 10) || 0 : 0;
  });
  const [lockoutRemainingSeconds, setLockoutRemainingSeconds] = useState<number>(0);

  // Fetch or sync security config from Firestore on mount
  useEffect(() => {
    let isMounted = true;
    const fetchConfig = async () => {
      try {
        const docRef = doc(db, 'settings', 'admin_auth');
        const snap = await getDoc(docRef);
        if (snap.exists() && isMounted) {
          const data = snap.data() as AdminSecurityConfig;
          setSecurityConfig(data);
          localStorage.setItem(ADMIN_SECURITY_STORAGE_KEY, JSON.stringify(data));
          if (data.isInitialized) {
            setViewMode('login');
          } else {
            setViewMode('setup');
          }
        } else if (isMounted) {
          // If no doc in Firestore and no local storage config, prompt for initial setup
          const localSaved = localStorage.getItem(ADMIN_SECURITY_STORAGE_KEY);
          if (!localSaved) {
            setViewMode('setup');
          } else {
            setViewMode('login');
          }
        }
      } catch (err) {
        console.warn('Firestore security sync notice (operating from cache):', err);
      } finally {
        if (isMounted) setIsCheckingConfig(false);
      }
    };

    fetchConfig();
    return () => { isMounted = false; };
  }, []);

  // Lockout countdown timer
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
      setAuthError(`Trop de tentatives. Accès suspendu temporairement pour des raisons de sécurité.`);
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

  // --- 1. INITIAL SETUP HANDLER ---
  const handleInitialSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (setupPassword.length < 6) {
      setAuthError('Le mot de passe doit comporter au moins 6 caractères.');
      return;
    }
    if (setupPassword !== setupConfirmPassword) {
      setAuthError('Les deux mots de passe ne correspondent pas.');
      return;
    }
    if (setupRecoveryPin.length < 4) {
      setAuthError('Veuillez définir un code PIN de récupération à 6 chiffres.');
      return;
    }

    setIsLoading(true);
    setAuthError(null);

    try {
      const cleanEmail = emailInput.trim().toLowerCase();
      const passwordHash = await hashSecret(setupPassword);
      const recoveryPinHash = await hashSecret(setupRecoveryPin);

      const newConfig: AdminSecurityConfig = {
        email: cleanEmail,
        passwordHash,
        recoveryPinHash,
        updatedAt: new Date().toISOString(),
        isInitialized: true,
      };

      // Save to Firestore
      try {
        await setDoc(doc(db, 'settings', 'admin_auth'), newConfig);
      } catch (err) {
        console.warn('Firestore setDoc admin_auth notice:', err);
      }

      // Save to localStorage
      localStorage.setItem(ADMIN_SECURITY_STORAGE_KEY, JSON.stringify(newConfig));
      setSecurityConfig(newConfig);

      // Authenticate in Firebase
      try {
        await createUserWithEmailAndPassword(auth, cleanEmail, setupPassword);
      } catch {
        try {
          await signInWithEmailAndPassword(auth, cleanEmail, setupPassword);
        } catch {
          if (!auth.currentUser) {
            await signInAnonymously(auth);
          }
        }
      }

      setAuthSuccessMessage('✅ Accès administrateur configuré avec succès ! Connexion en cours...');
      setTimeout(() => {
        grantAccess(cleanEmail);
      }, 800);
    } catch (err: any) {
      setAuthError(`Erreur lors de la configuration : ${err?.message || 'Veuillez réessayer.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // --- 2. REGULAR LOGIN HANDLER ---
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
      setAuthError('Veuillez saisir votre mot de passe.');
      return;
    }

    setIsLoading(true);
    setAuthError(null);
    setAuthSuccessMessage(null);

    try {
      let isVerified = false;

      // A. Verify against cryptographic hash stored in Firestore/localStorage
      if (securityConfig?.passwordHash) {
        isVerified = await verifySecret(cleanPassword, securityConfig.passwordHash);
      }

      // B. Fallback check: Firebase Auth verification
      if (!isVerified) {
        try {
          await signInWithEmailAndPassword(auth, cleanEmail, cleanPassword);
          isVerified = true;
        } catch {
          // not verified
        }
      }

      if (isVerified) {
        // Ensure Firebase session is active for Firestore rules
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
    } catch (err: any) {
      recordFailedAttempt();
    } finally {
      setIsLoading(false);
    }
  };

  // --- 3. RECOVERY / FORGOT PASSWORD HANDLER (Instant on screen) ---
  const handleRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!securityConfig?.recoveryPinHash) {
      setAuthError('Aucun code de récupération n’a été configuré. Veuillez réinitialiser la sécurité.');
      return;
    }

    const cleanPin = recoveryPinInput.trim();
    if (cleanPin.length < 4) {
      setAuthError('Veuillez saisir votre code PIN de récupération.');
      return;
    }

    if (newPasswordInput.length < 6) {
      setAuthError('Le nouveau mot de passe doit comporter au moins 6 caractères.');
      return;
    }

    if (newPasswordInput !== confirmNewPasswordInput) {
      setAuthError('Les deux nouveaux mots de passe ne correspondent pas.');
      return;
    }

    setIsLoading(true);
    setAuthError(null);

    try {
      const isPinValid = await verifySecret(cleanPin, securityConfig.recoveryPinHash);
      if (!isPinValid) {
        setAuthError('Code PIN de récupération incorrect. Vérifiez votre code secret.');
        setIsLoading(false);
        return;
      }

      // PIN is valid: update password hash
      const newHash = await hashSecret(newPasswordInput);
      const updatedConfig: AdminSecurityConfig = {
        ...securityConfig,
        passwordHash: newHash,
        updatedAt: new Date().toISOString(),
        isInitialized: true,
      };

      // Save to Firestore & local storage
      try {
        await setDoc(doc(db, 'settings', 'admin_auth'), updatedConfig);
      } catch (err) {
        console.warn('Firestore update password hash notice:', err);
      }
      localStorage.setItem(ADMIN_SECURITY_STORAGE_KEY, JSON.stringify(updatedConfig));
      setSecurityConfig(updatedConfig);

      // Authenticate in Firebase
      const cleanEmail = emailInput.trim().toLowerCase();
      try {
        if (!auth.currentUser) {
          await signInAnonymously(auth);
        }
      } catch {
        // offline
      }

      setAuthSuccessMessage('✅ Votre mot de passe a été réinitialisé avec succès ! Connexion immédiate...');
      setTimeout(() => {
        grantAccess(cleanEmail);
      }, 1000);
    } catch (err: any) {
      setAuthError(`Erreur lors de la réinitialisation : ${err?.message || 'Réessayez.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const whatsappHelpUrl = generateWhatsAppLink(
    settings.whatsappNumber,
    `Bonjour Vanessa ✨\nJe souhaite obtenir de l'aide pour réinitialiser l'accès confidentiel à l'Atelier Digital Van's Creation.`
  );

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
            {viewMode === 'setup' ? 'Configuration de l’Atelier' : viewMode === 'forgot_password' ? 'Récupération d’Accès' : 'Espace Atelier Privé'}
          </h2>
          <p className="text-xs text-[#6B5F54] leading-relaxed" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {viewMode === 'setup'
              ? 'Définissez vos identifiants confidentiels d’accès pour la Maison Van’s Creation.'
              : viewMode === 'forgot_password'
              ? 'Réinitialisez votre mot de passe instantanément grâce à votre code PIN secret.'
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

        {/* Success Message Banner */}
        {authSuccessMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p>{authSuccessMessage}</p>
          </div>
        )}

        {/* Error Message Banner */}
        {authError && (
          <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{authError}</span>
          </div>
        )}

        {/* --- VIEW 1: REGULAR LOGIN FORM --- */}
        {viewMode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
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
                  onClick={() => { setViewMode('forgot_password'); setAuthError(null); }}
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
                <span>Mémoriser ma session sécurisée</span>
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

        {/* --- VIEW 2: INITIAL SETUP FORM --- */}
        {viewMode === 'setup' && (
          <form onSubmit={handleInitialSetup} className="space-y-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed">
              ✨ Bienvenue dans votre Atelier Digital. Définissez votre mot de passe d'accès personnel et un code PIN de récupération à 6 chiffres pour sécuriser votre espace.
            </div>

            <div>
              <label className="text-[10.5px] font-bold uppercase tracking-wider text-[#8C7A6B] block mb-1">
                Adresse Email Administrateur
              </label>
              <input
                type="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="mutangilwaivan@gmail.com"
                className="w-full bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl px-4 py-2.5 text-xs text-[#181512] focus:outline-none focus:border-[#1B4332]"
              />
            </div>

            <div>
              <label className="text-[10.5px] font-bold uppercase tracking-wider text-[#8C7A6B] block mb-1">
                Nouveau Mot de Passe (Min. 6 caractères)
              </label>
              <input
                type="password"
                required
                value={setupPassword}
                onChange={(e) => setSetupPassword(e.target.value)}
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
                value={setupConfirmPassword}
                onChange={(e) => setSetupConfirmPassword(e.target.value)}
                placeholder="Retapez le mot de passe"
                className="w-full bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl px-4 py-2.5 text-xs text-[#181512] focus:outline-none focus:border-[#1B4332]"
              />
            </div>

            <div>
              <label className="text-[10.5px] font-bold uppercase tracking-wider text-[#8C7A6B] block mb-1">
                Code PIN Secret de Récupération (6 chiffres)
              </label>
              <input
                type="password"
                required
                maxLength={6}
                value={setupRecoveryPin}
                onChange={(e) => setSetupRecoveryPin(e.target.value.replace(/\D/g, ''))}
                placeholder="Ex: 842732"
                className="w-full bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl px-4 py-2.5 text-center text-sm font-mono tracking-[0.25em] text-[#181512] focus:outline-none focus:border-[#1B4332]"
              />
              <p className="text-[10px] text-[#8C7A6B] mt-1">
                Ce code PIN à 6 chiffres vous permettra de réinitialiser votre mot de passe immédiatement en cas d'oubli sans dépendre d'un email.
              </p>
            </div>

            <button
              type="submit"
              disabled={isLoading || setupPassword.length < 6 || setupRecoveryPin.length < 4}
              className="w-full py-3.5 bg-[#181512] hover:bg-[#1B4332] text-[#FAF8F5] rounded-xl text-xs font-bold uppercase tracking-[0.16em] shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? 'Configuration en cours...' : 'Activer mon Accès Sécurisé'}
            </button>
          </form>
        )}

        {/* --- VIEW 3: FORGOT PASSWORD / RECOVERY FORM --- */}
        {viewMode === 'forgot_password' && (
          <form onSubmit={handleRecovery} className="space-y-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <div className="p-3 bg-[#FAF8F5] border border-[#E8E1D7] rounded-xl text-xs text-[#5C5247] leading-relaxed">
              🔑 Saisissez votre <strong>Code PIN Secret de Récupération (6 chiffres)</strong> défini lors de la configuration pour choisir immédiatement un nouveau mot de passe.
            </div>

            <div>
              <label className="text-[10.5px] font-bold uppercase tracking-wider text-[#8C7A6B] block mb-1">
                Code PIN Secret (6 chiffres)
              </label>
              <input
                type="password"
                required
                maxLength={6}
                value={recoveryPinInput}
                onChange={(e) => setRecoveryPinInput(e.target.value.replace(/\D/g, ''))}
                placeholder="••••••"
                className="w-full bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl px-4 py-2.5 text-center text-sm font-mono tracking-[0.25em] text-[#181512] focus:outline-none focus:border-[#1B4332]"
              />
            </div>

            <div>
              <label className="text-[10.5px] font-bold uppercase tracking-wider text-[#8C7A6B] block mb-1">
                Nouveau Mot de Passe
              </label>
              <input
                type="password"
                required
                value={newPasswordInput}
                onChange={(e) => setNewPasswordInput(e.target.value)}
                placeholder="Min. 6 caractères"
                className="w-full bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl px-4 py-2.5 text-xs text-[#181512] focus:outline-none focus:border-[#1B4332]"
              />
            </div>

            <div>
              <label className="text-[10.5px] font-bold uppercase tracking-wider text-[#8C7A6B] block mb-1">
                Confirmer le Nouveau Mot de Passe
              </label>
              <input
                type="password"
                required
                value={confirmNewPasswordInput}
                onChange={(e) => setConfirmNewPasswordInput(e.target.value)}
                placeholder="Retapez le nouveau mot de passe"
                className="w-full bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl px-4 py-2.5 text-xs text-[#181512] focus:outline-none focus:border-[#1B4332]"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || recoveryPinInput.length < 4 || newPasswordInput.length < 6}
              className="w-full py-3.5 bg-[#181512] hover:bg-[#1B4332] text-[#FAF8F5] rounded-xl text-xs font-bold uppercase tracking-[0.16em] shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {isLoading ? 'Réinitialisation en cours...' : 'Réinitialiser & Me Connecter'}
            </button>

            {/* Direct WhatsApp Support fallback */}
            <div className="pt-2 text-center">
              <a
                href={whatsappHelpUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-[#25D366] hover:underline"
              >
                <MessageCircle className="w-3.5 h-3.5 fill-current" />
                <span>Code PIN oublié ? Contacter sur WhatsApp</span>
              </a>
            </div>

            <button
              type="button"
              onClick={() => { setViewMode('login'); setAuthError(null); }}
              className="w-full text-center text-xs text-[#8C7A6B] hover:text-[#181512] transition-colors py-1 cursor-pointer"
            >
              ← Retour à l'écran de connexion
            </button>
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
