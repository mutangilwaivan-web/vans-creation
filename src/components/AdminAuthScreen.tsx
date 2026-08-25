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
  Sparkles,
  Send,
  UserPlus,
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { useStudio } from '../context/StudioContext';
import { 
  auth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInWithEmailLink
} from '../lib/firebase';

interface AdminAuthScreenProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const AUTHORIZED_ADMIN_EMAILS = [
  'mutangilwaivan@gmail.com',
  'contact@vans-creation.com'
];

export const AdminAuthScreen: React.FC<AdminAuthScreenProps> = ({
  onSuccess,
  onCancel,
}) => {
  const { settings, setAdminAuthenticated } = useStudio();
  
  // Auth Modes: 'login_password' | 'magic_link' | 'forgot_password' | 'register'
  const [authMode, setAuthMode] = useState<'login_password' | 'magic_link' | 'forgot_password' | 'register'>('login_password');
  
  const [emailInput, setEmailInput] = useState(settings.email || 'mutangilwaivan@gmail.com');
  const [passwordInput, setPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Status & Feedback
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccessMessage, setAuthSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Auto-detect Magic Link sign-in on page load
  useEffect(() => {
    const handleEmailLinkSignIn = async () => {
      if (isSignInWithEmailLink(auth, window.location.href)) {
        setIsLoading(true);
        let email = localStorage.getItem('maison_vans_email_for_signin');
        if (!email) {
          email = window.prompt('Veuillez confirmer votre adresse email administrateur :') || '';
        }
        if (email) {
          try {
            const cleanEmail = email.trim().toLowerCase();
            const result = await signInWithEmailLink(auth, cleanEmail, window.location.href);
            localStorage.removeItem('maison_vans_email_for_signin');
            
            // Verify authorized email
            if (result.user?.email && AUTHORIZED_ADMIN_EMAILS.includes(result.user.email.toLowerCase())) {
              grantAccess(result.user.email);
            } else {
              setAuthError('Cette adresse email n’est pas autorisée à administrer l’Atelier.');
            }
          } catch (err: any) {
            setAuthError(`Lien de connexion expiré ou invalide : ${err?.message || 'Veuillez en demander un nouveau.'}`);
          } finally {
            setIsLoading(false);
          }
        }
      }
    };

    handleEmailLinkSignIn();
  }, []);

  const grantAccess = (userEmail: string) => {
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

  // 1. STANDARD LOGIN (Email + Password)
  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
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

    try {
      const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, cleanPassword);
      if (userCredential.user.email) {
        grantAccess(userCredential.user.email);
      }
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/user-not-found' || code === 'auth/invalid-credential') {
        setAuthError('Identifiants incorrects ou compte non encore activé. Si vous n’avez pas encore créé votre compte, cliquez sur "Créer / Activer mon compte" ci-dessous.');
      } else if (code === 'auth/wrong-password') {
        setAuthError('Mot de passe incorrect. Vérifiez votre saisie ou utilisez "Mot de passe oublié".');
      } else if (code === 'auth/too-many-requests') {
        setAuthError('Trop de tentatives infructueuses. Veuillez patienter quelques minutes.');
      } else {
        setAuthError(`Erreur de connexion : ${err?.message || 'Vérifiez votre connexion internet.'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 2. MAGIC LINK LOGIN (Passwordless link sent to email)
  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = emailInput.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setAuthError('Veuillez saisir une adresse email valide.');
      return;
    }

    setIsLoading(true);
    setAuthError(null);
    setAuthSuccessMessage(null);

    try {
      const actionCodeSettings = {
        url: window.location.origin + '/#admin',
        handleCodeInApp: true,
      };
      await sendSignInLinkToEmail(auth, cleanEmail, actionCodeSettings);
      localStorage.setItem('maison_vans_email_for_signin', cleanEmail);
      setAuthSuccessMessage(
        `✉️ Un lien magique de connexion a été envoyé à ${cleanEmail}. Cliquez sur le lien dans votre email pour vous connecter instantanément ! (Vérifiez également les spams)`
      );
    } catch (err: any) {
      setAuthError(`Erreur lors de l'envoi du lien : ${err?.message || 'Vérifiez votre connexion.'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 3. ACCOUNT REGISTRATION / FIRST-TIME ACTIVATION
  const handleRegister = async (e: React.FormEvent) => {
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
      const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, cleanPassword);
      setAuthSuccessMessage('✅ Votre compte administrateur a été créé et activé sur Firebase avec succès !');
      setTimeout(() => {
        grantAccess(userCredential.user.email || cleanEmail);
      }, 800);
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/email-already-in-use') {
        setAuthError('Ce compte existe déjà sur Firebase. Utilisez "Connexion par mot de passe" ou "Mot de passe oublié".');
      } else if (code === 'auth/weak-password') {
        setAuthError('Le mot de passe est trop faible. Utilisez au moins 6 caractères variés.');
      } else {
        setAuthError(`Erreur de création : ${err?.message || 'Veuillez réessayer.'}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 4. FORGOT PASSWORD (Official Firebase Reset Email)
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = emailInput.trim().toLowerCase();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setAuthError('Veuillez saisir une adresse email valide.');
      return;
    }

    setIsLoading(true);
    setAuthError(null);
    setAuthSuccessMessage(null);

    try {
      const actionCodeSettings = {
        url: window.location.origin + '/#admin',
        handleCodeInApp: false,
      };
      await sendPasswordResetEmail(auth, cleanEmail, actionCodeSettings);
      setAuthSuccessMessage(
        `📧 Un email officiel de réinitialisation a été envoyé à ${cleanEmail}. Cliquez sur le lien reçu pour choisir votre nouveau mot de passe. (Pensez à vérifier vos spams)`
      );
    } catch (err: any) {
      const code = err?.code || '';
      if (code === 'auth/user-not-found' || code === 'auth/invalid-credential') {
        setAuthError('Aucun compte Firebase n’a été trouvé avec cet email. Vous devez d’abord activer votre compte via "Créer / Activer mon compte".');
      } else {
        setAuthError(`Erreur lors de l'envoi : ${err?.message || 'Vérifiez votre connexion internet.'}`);
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
            {authMode === 'register' 
              ? 'Activation Compte Atelier' 
              : authMode === 'magic_link' 
              ? 'Lien Magique par Email' 
              : authMode === 'forgot_password'
              ? 'Réinitialisation par Email'
              : 'Espace Atelier Privé'}
          </h2>
          <p className="text-xs text-[#6B5F54] leading-relaxed" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Authentification officielle Firebase réservée à la direction de la Maison Van's Creation.
          </p>
        </div>

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

        {/* Auth Method Navigation Tabs */}
        {authMode !== 'forgot_password' && authMode !== 'register' && (
          <div className="grid grid-cols-2 p-1 bg-[#FAF8F5] rounded-2xl border border-[#E8E1D7] text-xs font-bold text-[#8C7A6B]">
            <button
              type="button"
              onClick={() => { setAuthMode('login_password'); setAuthError(null); setAuthSuccessMessage(null); }}
              className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMode === 'login_password' ? 'bg-[#181512] text-[#FAF8F5] shadow-sm' : 'hover:text-[#181512]'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Mot de Passe</span>
            </button>
            <button
              type="button"
              onClick={() => { setAuthMode('magic_link'); setAuthError(null); setAuthSuccessMessage(null); }}
              className={`py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                authMode === 'magic_link' ? 'bg-[#181512] text-[#FAF8F5] shadow-sm' : 'hover:text-[#181512]'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Lien par Email</span>
            </button>
          </div>
        )}

        {/* --- FORM 1: PASSWORD LOGIN --- */}
        {authMode === 'login_password' && (
          <form onSubmit={handlePasswordLogin} className="space-y-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <div>
              <label className="text-[10.5px] font-bold uppercase tracking-wider text-[#8C7A6B] block mb-1">
                Adresse Email Administrateur
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  autoComplete="username"
                  disabled={isLoading}
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
                  onClick={() => { setAuthMode('forgot_password'); setAuthError(null); setAuthSuccessMessage(null); }}
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
                  disabled={isLoading}
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
              disabled={isLoading}
              className="w-full py-3.5 bg-[#181512] hover:bg-[#1B4332] text-[#FAF8F5] rounded-xl text-xs font-bold uppercase tracking-[0.16em] shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[#C5A880]" />
                  <span>Vérification Firebase...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4 text-[#C5A880]" />
                  <span>Connexion Atelier</span>
                </>
              )}
            </button>

            <div className="pt-2 border-t border-[#F0EAE1] text-center">
              <button
                type="button"
                onClick={() => { setAuthMode('register'); setAuthError(null); setAuthSuccessMessage(null); }}
                className="text-xs text-[#8C7A6B] hover:text-[#181512] font-semibold transition-colors cursor-pointer"
              >
                Première connexion ? <span className="text-[#C5A880] underline">Créer / Activer mon compte</span>
              </button>
            </div>
          </form>
        )}

        {/* --- FORM 2: MAGIC LINK (Passwordless Email Auth) --- */}
        {authMode === 'magic_link' && (
          <form onSubmit={handleMagicLink} className="space-y-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900 leading-relaxed">
              ✨ <strong>Connexion par Lien Magique :</strong> Saisissez votre email. Firebase vous envoie un lien sécurisé d'authentification sans mot de passe.
            </div>

            <div>
              <label className="text-[10.5px] font-bold uppercase tracking-wider text-[#8C7A6B] block mb-1">
                Adresse Email Administrateur
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  disabled={isLoading}
                  value={emailInput}
                  onChange={(e) => { setEmailInput(e.target.value); setAuthError(null); }}
                  placeholder="mutangilwaivan@gmail.com"
                  className="w-full bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl px-4 py-3 pl-10 text-sm text-[#181512] focus:outline-none focus:border-[#1B4332]"
                />
                <Mail className="w-4 h-4 text-[#8C7A6B] absolute left-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-[#181512] hover:bg-[#1B4332] text-[#FAF8F5] rounded-xl text-xs font-bold uppercase tracking-[0.16em] shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[#C5A880]" />
                  <span>Envoi du lien en cours...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 text-[#C5A880]" />
                  <span>Envoyer mon Lien de Connexion</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* --- FORM 3: FORGOT PASSWORD (Password Reset Email) --- */}
        {authMode === 'forgot_password' && (
          <form onSubmit={handleForgotPassword} className="space-y-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <div className="p-3 bg-[#FAF8F5] border border-[#E8E1D7] rounded-xl text-xs text-[#5C5247] leading-relaxed">
              📧 Saisissez votre adresse email pour recevoir un <strong>lien sécurisé officiel de réinitialisation</strong> de mot de passe envoyé par Firebase.
            </div>

            <div>
              <label className="text-[10.5px] font-bold uppercase tracking-wider text-[#8C7A6B] block mb-1">
                Adresse Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  disabled={isLoading}
                  value={emailInput}
                  onChange={(e) => { setEmailInput(e.target.value); setAuthError(null); }}
                  placeholder="mutangilwaivan@gmail.com"
                  className="w-full bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl px-4 py-3 pl-10 text-sm text-[#181512] focus:outline-none focus:border-[#1B4332]"
                />
                <Mail className="w-4 h-4 text-[#8C7A6B] absolute left-3.5 top-3.5 pointer-events-none" />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-[#181512] hover:bg-[#1B4332] text-[#FAF8F5] rounded-xl text-xs font-bold uppercase tracking-[0.16em] shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-[#C5A880]" />
                  <span>Envoi en cours...</span>
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
              onClick={() => { setAuthMode('login_password'); setAuthError(null); }}
              className="w-full text-center text-xs text-[#8C7A6B] hover:text-[#181512] transition-colors py-1 cursor-pointer"
            >
              ← Retour à l'écran de connexion
            </button>
          </form>
        )}

        {/* --- FORM 4: ACCOUNT REGISTRATION / INITIAL CREATION --- */}
        {authMode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs text-emerald-900 leading-relaxed">
              🔐 <strong>Création de votre Compte Firebase Administrateur :</strong> Définissez votre mot de passe pour enregistrer officiellement votre compte dans la base d'authentification Google Firebase.
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
                onChange={(e) => { setEmailInput(e.target.value); setAuthError(null); }}
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
                onChange={(e) => { setPasswordInput(e.target.value); setAuthError(null); }}
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
                onChange={(e) => { setConfirmPasswordInput(e.target.value); setAuthError(null); }}
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
                  <span>Création en cours sur Firebase...</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 text-[#C5A880]" />
                  <span>Créer mon Compte Administrateur</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => { setAuthMode('login_password'); setAuthError(null); }}
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
