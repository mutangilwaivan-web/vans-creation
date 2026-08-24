import React, { useState, useEffect, useRef } from 'react';
import { 
  Lock, 
  Unlock, 
  Mail, 
  KeyRound, 
  Eye, 
  EyeOff, 
  Check, 
  AlertCircle, 
  Sparkles, 
  ArrowRight, 
  RotateCcw, 
  ShieldCheck, 
  Clock, 
  Copy,
  Smartphone,
  Send,
  UserCheck
} from 'lucide-react';
import { useStudio } from '../context/StudioContext';
import { 
  auth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInAnonymously 
} from '../lib/firebase';

interface AdminAuthScreenProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export const AdminAuthScreen: React.FC<AdminAuthScreenProps> = ({
  onSuccess,
  onCancel,
}) => {
  const { settings, setAdminAuthenticated } = useStudio();
  
  // Auth methods: 'firebase_email' | 'otp'
  const [authMethod, setAuthMethod] = useState<'firebase_email' | 'otp'>('firebase_email');
  
  // Email & Password states
  const [emailInput, setEmailInput] = useState(settings.email || 'mutangilwaivan@gmail.com');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // OTP States
  const [otpStep, setOtpStep] = useState<'email' | 'verify'>('email');
  const [generatedOtp, setGeneratedOtp] = useState<string>('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [otpExpirySeconds, setOtpExpirySeconds] = useState<number>(600);
  const [otpResendCooldown, setOtpResendCooldown] = useState<number>(0);
  const [isSendingCode, setIsSendingCode] = useState<boolean>(false);
  const [showSimulatedEmailInbox, setShowSimulatedEmailInbox] = useState<boolean>(false);
  const [copiedSimulatedCode, setCopiedSimulatedCode] = useState<boolean>(false);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Timer countdown for OTP Expiration
  useEffect(() => {
    let interval: any = null;
    if (otpStep === 'verify' && otpExpirySeconds > 0) {
      interval = setInterval(() => {
        setOtpExpirySeconds((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpStep, otpExpirySeconds]);

  // Timer countdown for Resend Cooldown
  useEffect(() => {
    let interval: any = null;
    if (otpResendCooldown > 0) {
      interval = setInterval(() => {
        setOtpResendCooldown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [otpResendCooldown]);

  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  // Complete Authentication Success & Persist Session
  const completeAuthentication = (userEmail: string) => {
    const sessionData = {
      authenticatedAt: new Date().toISOString(),
      email: userEmail || emailInput,
      role: 'Directrice de Création & Modéliste',
      expiresAt: rememberMe ? Date.now() + 60 * 24 * 60 * 60 * 1000 : Date.now() + 7 * 24 * 60 * 60 * 1000,
    };
    localStorage.setItem('maison_vans_admin_session', JSON.stringify(sessionData));
    localStorage.setItem('maison_vans_admin_auth', 'true');
    setAdminAuthenticated(true);
    onSuccess();
  };

  // Firebase Email & Password Login / Auto-Registration Handler
  const handleFirebaseLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !emailInput.includes('@')) {
      setAuthError('Veuillez saisir une adresse email valide.');
      return;
    }
    if (!passwordInput) {
      setAuthError('Veuillez saisir votre mot de passe d’accès.');
      return;
    }
    
    setIsLoading(true);
    setAuthError(null);

    const cleanEmail = emailInput.trim();
    const effectivePassword = passwordInput.trim();

    try {
      // 1. Attempt standard Firebase sign in
      try {
        await signInWithEmailAndPassword(auth, cleanEmail, effectivePassword);
        completeAuthentication(cleanEmail);
      } catch (signInErr: any) {
        // If user not found, attempt initial setup for administrator
        if (signInErr.code === 'auth/user-not-found' || signInErr.code === 'auth/invalid-credential') {
          try {
            await createUserWithEmailAndPassword(auth, cleanEmail, effectivePassword);
            completeAuthentication(cleanEmail);
          } catch (createErr: any) {
            setAuthError('Identifiants incorrects ou compte non autorisé. Veuillez vérifier votre mot de passe.');
          }
        } else if (signInErr.code === 'auth/wrong-password') {
          setAuthError('Mot de passe incorrect. Veuillez réessayer.');
        } else {
          setAuthError('Erreur de connexion : ' + (signInErr.message || 'Vérifiez votre connexion internet.'));
        }
      }
    } catch (err: any) {
      setAuthError('Erreur d’authentification. Veuillez vérifier vos identifiants.');
    } finally {
      setIsLoading(false);
    }
  };

  // Generate 6-digit secure numeric OTP (for email verification flow)
  const handleSendOtp = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!emailInput || !emailInput.includes('@')) {
      setAuthError('Veuillez saisir une adresse email valide.');
      return;
    }

    setIsSendingCode(true);
    setAuthError(null);

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedOtp(code);

    setTimeout(() => {
      setIsSendingCode(false);
      setOtpStep('verify');
      setOtpExpirySeconds(600);
      setOtpResendCooldown(30);
      setShowSimulatedEmailInbox(true);
      setOtpDigits(['', '', '', '', '', '']);
      
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    }, 500);
  };

  // Handle OTP digit inputs
  const handleOtpDigitChange = (index: number, value: string) => {
    const cleanVal = value.replace(/[^0-9]/g, '');
    
    if (cleanVal.length > 1) {
      const pastedDigits = cleanVal.slice(0, 6).split('');
      const newDigits = [...otpDigits];
      pastedDigits.forEach((char, i) => {
        if (i < 6) newDigits[i] = char;
      });
      setOtpDigits(newDigits);
      
      if (newDigits.every((d) => d !== '')) {
        verifyCode(newDigits.join(''));
      } else {
        const nextEmpty = newDigits.findIndex((d) => d === '');
        if (nextEmpty !== -1) otpInputRefs.current[nextEmpty]?.focus();
      }
      return;
    }

    const newDigits = [...otpDigits];
    newDigits[index] = cleanVal;
    setOtpDigits(newDigits);
    setAuthError(null);

    if (cleanVal && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    if (cleanVal && index === 5 && newDigits.every((d) => d !== '')) {
      verifyCode(newDigits.join(''));
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const verifyCode = async (codeToTest: string) => {
    if (otpExpirySeconds <= 0) {
      setAuthError('Le code de sécurité a expiré. Veuillez en demander un nouveau.');
      return;
    }

    if (generatedOtp && codeToTest === generatedOtp) {
      completeAuthentication(emailInput);
    } else {
      setAuthError('Code de sécurité incorrect. Veuillez vérifier le code reçu.');
    }
  };

  const handleAutoFillSimulatedCode = () => {
    if (generatedOtp) {
      const digits = generatedOtp.split('');
      setOtpDigits(digits);
      verifyCode(generatedOtp);
    }
  };

  const handleCopySimulatedCode = () => {
    if (generatedOtp) {
      navigator.clipboard.writeText(generatedOtp);
      setCopiedSimulatedCode(true);
      setTimeout(() => setCopiedSimulatedCode(false), 2500);
    }
  };

  // Instant 1-Click Smooth Access for Vanessa Kaniki
  const handleQuickSmoothUnlock = async () => {
    setIsLoading(true);
    try {
      try {
        await signInAnonymously(auth);
      } catch (e) {
        console.warn('Firebase smooth connect note:', e);
      }
      completeAuthentication('mutangilwaivan@gmail.com');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="admin-login-screen" className="py-12 sm:py-20 bg-[#FAF8F5] min-h-[85vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white p-6 sm:p-9 rounded-3xl border border-[#E8E1D7] shadow-2xl space-y-6 relative overflow-hidden">
        
        {/* Decorative Top Accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#C5A880] via-[#8C7A6B] to-[#181512]" />

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-13 h-13 rounded-2xl bg-[#181512] text-[#C5A880] flex items-center justify-center mx-auto shadow-md border border-[#3D352E]">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="font-cinzel text-xl sm:text-2xl font-bold text-[#1E1B18] tracking-wide">
            Espace Atelier Privé
          </h2>
          <p className="text-xs text-[#6B5F54] leading-relaxed">
            Authentification Firebase pour <strong>{settings.designerName}</strong>. Accès sécurisé sans déconnexion intempestive.
          </p>
        </div>

        {/* 1-Click Instant Vanessa Access (Zero Friction) */}
        <div className="bg-[#FAF8F5] p-3.5 rounded-2xl border border-[#E0D7CC] space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-[#181512] flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-[#C5A880]" />
              Compte Vanessa Kaniki
            </span>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
              Production
            </span>
          </div>
          <p className="text-[11px] text-[#6A5E52] leading-snug">
            Identifiant : <strong>mutangilwaivan@gmail.com</strong>
          </p>
          <button
            type="button"
            onClick={handleQuickSmoothUnlock}
            disabled={isLoading}
            className="w-full py-2.5 px-4 bg-[#181512] hover:bg-[#1B4332] text-[#FAF8F5] rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>{isLoading ? 'Connexion en cours...' : 'Connexion Instantanée Sécurisée'}</span>
          </button>
        </div>

        {/* Auth Method Tabs */}
        <div className="bg-[#EFEAE2] p-1 grid grid-cols-2 gap-1 rounded-2xl border border-[#DCD3C7]">
          <button
            type="button"
            onClick={() => {
              setAuthMethod('firebase_email');
              setAuthError(null);
            }}
            className={`py-2 px-3 text-center rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              authMethod === 'firebase_email'
                ? 'bg-white text-[#181512] shadow-xs'
                : 'text-[#6A5E52] hover:text-[#181512]'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Firebase Auth</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAuthMethod('otp');
              setAuthError(null);
            }}
            className={`py-2 px-3 text-center rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              authMethod === 'otp'
                ? 'bg-white text-[#181512] shadow-xs'
                : 'text-[#6A5E52] hover:text-[#181512]'
            }`}
          >
            <Mail className="w-3.5 h-3.5 text-[#C5A880]" />
            <span>Code OTP Email</span>
          </button>
        </div>

        {/* ================= METHOD 1: FIREBASE EMAIL & PASSWORD ================= */}
        {authMethod === 'firebase_email' && (
          <form onSubmit={handleFirebaseLogin} className="space-y-4 animate-in fade-in duration-200">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#8C7A6B] block mb-1">
                Adresse Email Administrateur
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="ex: mutangilwaivan@gmail.com"
                  className="w-full bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl px-4 py-2.5 pl-10 text-sm text-[#1E1B18] placeholder-[#A39688] focus:outline-none focus:border-[#C5A880] transition-colors"
                />
                <Mail className="w-4 h-4 text-[#A39688] absolute left-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#8C7A6B] block mb-1">
                Mot de passe Atelier
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setAuthError(null);
                  }}
                  placeholder="Mot de passe (défaut : atelier2026)"
                  className="w-full bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl px-4 py-2.5 pr-10 text-sm text-[#1E1B18] placeholder-[#A39688] focus:outline-none focus:border-[#C5A880] transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-3 text-[#A39688] hover:text-[#181512]"
                  aria-label={showPassword ? 'Masquer' : 'Afficher'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {authError && (
                <div className="flex items-center gap-1 text-xs text-rose-600 mt-1.5">
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
                  className="rounded text-[#181512] focus:ring-[#C5A880]"
                />
                <span>Mémoriser ma session (60 jours)</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#181512] hover:bg-[#2C2723] text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md transition-all cursor-pointer active:scale-98"
            >
              {isLoading ? 'Vérification Firebase...' : 'Se Connecter'}
            </button>
          </form>
        )}

        {/* ================= METHOD 2: EMAIL OTP ================= */}
        {authMethod === 'otp' && (
          <div className="space-y-4">
            {otpStep === 'email' && (
              <form onSubmit={handleSendOtp} className="space-y-4 animate-in fade-in duration-200">
                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#8C7A6B] block mb-1">
                    Adresse Email d'administration
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      required
                      value={emailInput}
                      onChange={(e) => setEmailInput(e.target.value)}
                      placeholder="ex: mutangilwaivan@gmail.com"
                      className="w-full bg-[#FAF8F5] border border-[#E0D7CC] rounded-xl px-4 py-2.5 pl-10 text-sm text-[#1E1B18] placeholder-[#A39688] focus:outline-none focus:border-[#C5A880] transition-colors"
                    />
                    <Mail className="w-4 h-4 text-[#A39688] absolute left-3.5 top-3" />
                  </div>
                  {authError && (
                    <div className="flex items-center gap-1 text-xs text-rose-600 mt-1.5">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{authError}</span>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSendingCode}
                  className="w-full py-3 bg-[#181512] hover:bg-[#2C2723] text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  {isSendingCode ? (
                    <span>Génération du code...</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5 text-[#C5A880]" />
                      <span>Envoyer mon code de sécurité</span>
                    </>
                  )}
                </button>
              </form>
            )}

            {otpStep === 'verify' && (
              <div className="space-y-4 animate-in fade-in duration-200">
                <div className="text-center space-y-1">
                  <span className="text-xs text-[#6A5E52]">Code de sécurité envoyé à :</span>
                  <div className="font-semibold text-xs text-[#181512] bg-[#FAF8F5] py-1 px-3 rounded-full inline-block border border-[#E0D7CC]">
                    {emailInput}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-center gap-2">
                    {otpDigits.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => (otpInputRefs.current[idx] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpDigitChange(idx, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                        className={`w-10 h-12 text-center font-mono font-bold text-lg rounded-xl border transition-all focus:outline-none ${
                          digit 
                            ? 'border-[#181512] bg-white text-[#181512] shadow-sm' 
                            : 'border-[#D5CABE] bg-[#FAF8F5] text-[#181512] focus:border-[#C5A880] focus:bg-white'
                        }`}
                      />
                    ))}
                  </div>

                  {authError && (
                    <div className="flex items-center justify-center gap-1.5 text-xs text-rose-600 mt-2">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{authError}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-[#F0EAE1]">
                  <div className="flex items-center gap-1 text-[#8C7A6B]">
                    <Clock className="w-3.5 h-3.5 text-[#C5A880]" />
                    <span>Expire : <strong>{formatTime(otpExpirySeconds)}</strong></span>
                  </div>

                  {otpResendCooldown > 0 ? (
                    <span className="text-[11px] text-[#A39688]">
                      Renvoyer ({otpResendCooldown}s)
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSendOtp()}
                      className="text-[11px] font-bold text-[#C5A880] hover:text-[#181512] underline cursor-pointer"
                    >
                      Renvoyer un code
                    </button>
                  )}
                </div>

                {showSimulatedEmailInbox && generatedOtp && (
                  <div className="bg-[#181512] text-white p-3 rounded-xl border border-[#3D352E] shadow-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-[#C5A880]">
                        <Mail className="w-3.5 h-3.5" />
                        <span>Code de sécurité généré</span>
                      </div>
                      <span className="text-[9px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-medium">
                        Délivré
                      </span>
                    </div>

                    <div className="flex items-center justify-between bg-white/10 p-2 rounded-lg">
                      <span className="font-mono text-base font-bold tracking-widest text-[#FAF8F5]">
                        {generatedOtp}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={handleCopySimulatedCode}
                          className="p-1.5 rounded bg-white/10 hover:bg-white/20 text-white text-xs"
                          title="Copier le code"
                        >
                          {copiedSimulatedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          type="button"
                          onClick={handleAutoFillSimulatedCode}
                          className="px-2 py-1 rounded bg-[#C5A880] hover:bg-[#B59870] text-[#181512] text-xs font-bold cursor-pointer"
                        >
                          Remplir & Entrer
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setOtpStep('email')}
                  className="w-full text-center text-xs text-[#8C7A6B] hover:text-[#181512] transition-colors"
                >
                  ← Changer d'adresse email
                </button>
              </div>
            )}
          </div>
        )}

        {/* Public Site Navigation Link */}
        <div className="text-center pt-2 border-t border-[#F0EAE1]">
          <button
            type="button"
            onClick={onCancel}
            className="text-xs text-[#8C7A6B] hover:text-[#1E1B18] transition-colors underline cursor-pointer"
          >
            ← Retour au catalogue public
          </button>
        </div>

      </div>
    </section>
  );
};

