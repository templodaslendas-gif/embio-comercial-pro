import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, useReducedMotion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { LogIn, Loader2, Eye, EyeOff, Users, FileText, LineChart, ArrowLeft, MailCheck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { FFRFooter } from "@/components/FFRFooter";

const APP_NAME = "Embio Intelligence Pro";
const HEADLINE = "Gestão inteligente de clientes, propostas e vendas.";
const SUBHEADLINE =
  "Centralize relacionamento, agenda, propostas e indicadores em uma única plataforma.";
const TAGLINE = "Venda mais. Organize melhor. Acompanhe tudo.";

const BENEFITS = [
  { icon: Users, label: "Gestão de clientes e relacionamento" },
  { icon: FileText, label: "Propostas comerciais e controle de vendas" },
  { icon: LineChart, label: "Financeiro e indicadores em tempo real" },
];

const Auth = () => {
  const { user, loading, signIn, resetPassword } = useAuth();
  const [mode, setMode] = useState<"login" | "forgot">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-embio-blue">
        <Loader2 className="h-8 w-8 animate-spin text-white/80" />
      </div>
    );
  }

  if (user) return <Navigate to="/" replace />;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setSubmitting(true);
    try {
      const { error } = await signIn(email.trim(), password);
      if (error) {
        toast({ title: t("auth.loginError"), description: error.message, variant: "destructive" });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setSubmitting(true);
    try {
      // Mensagem sempre neutra, mesmo em erro: nunca revelar se o e-mail
      // existe ou não na base a quem não está autenticado.
      await resetPassword(email.trim());
    } finally {
      setForgotSent(true);
      setSubmitting(false);
    }
  };

  const switchToForgot = () => {
    setMode("forgot");
    setForgotSent(false);
  };

  const switchToLogin = () => {
    setMode("login");
    setForgotSent(false);
    setPassword("");
  };

  return (
    <div className="flex min-h-svh flex-col lg:flex-row">
      {/* Desktop left panel — fixed platform identity, never per-tenant branding */}
      <div className="hidden lg:flex flex-col justify-between w-[460px] shrink-0 bg-embio-blue px-10 py-12 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-white/[0.04] blur-3xl" />
          <div className="absolute bottom-16 -right-16 h-48 w-48 rounded-full bg-accent/10 blur-2xl" />
        </div>

        <div className="relative flex items-center gap-4">
          <img
            src="/web-app-manifest-512x512.png"
            alt={APP_NAME}
            className="h-16 w-16 rounded-2xl object-contain shadow-lg ring-1 ring-white/10"
          />
          <div>
            <p className="text-lg font-bold text-white leading-tight">{APP_NAME}</p>
            <p className="text-[13px] text-white/55 leading-tight mt-1">{TAGLINE}</p>
          </div>
        </div>

        <div className="relative space-y-6">
          <div className="space-y-2">
            <span className="text-[13px] font-bold uppercase tracking-widest text-[#8FDA76]">
              Plataforma Comercial
            </span>
            <h2 className="text-2xl font-bold text-white leading-snug">{HEADLINE}</h2>
            <p className="text-sm text-white/55 leading-relaxed">{SUBHEADLINE}</p>
          </div>

          <div className="space-y-3">
            {BENEFITS.map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-2.5">
                <Icon className="h-4 w-4 text-[#8FDA76] shrink-0" />
                <span className="text-[13px] text-white/75">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative h-6" aria-hidden />
      </div>

      {/* Mobile header — own vertical layout, not a shrunk desktop panel */}
      <div className="flex lg:hidden flex-col items-center gap-3 bg-embio-blue px-6 pt-10 pb-8">
        <img
          src="/web-app-manifest-512x512.png"
          alt={APP_NAME}
          className="h-20 w-20 rounded-2xl object-contain shadow-lg ring-1 ring-white/10"
        />
        <div className="text-center space-y-1.5">
          <p className="text-lg font-bold text-white">{APP_NAME}</p>
          <p className="text-[13px] text-white/70 font-medium">{TAGLINE}</p>
          <p className="text-[13px] text-white/50 mt-1 max-w-[280px] leading-relaxed">{SUBHEADLINE}</p>
        </div>
      </div>

      {/* Form column */}
      <div className="flex-1 flex items-center justify-center bg-background px-6 py-8">
        <motion.div
          className="w-full max-w-sm"
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          {mode === "login" ? (
            <>
              <div className="space-y-1 mb-8">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">Entrar na conta</h1>
                <p className="text-sm text-muted-foreground">Use suas credenciais para acessar o sistema.</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm font-medium">
                    {t("auth.email")}
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t("auth.emailPlaceholder")}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 rounded-xl text-base"
                    autoComplete="email"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="password" className="text-sm font-medium">
                    {t("auth.password")}
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder={t("auth.passwordPlaceholder")}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="h-12 rounded-xl text-base pr-10"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      tabIndex={-1}
                      aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className={cn(
                    "w-full h-12 gap-2 rounded-xl font-semibold text-base mt-2",
                    "transition-all duration-200 hover:shadow-lg",
                  )}
                  disabled={submitting}
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
                  {submitting ? t("common.loading") : t("auth.login")}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <button
                  type="button"
                  onClick={switchToForgot}
                  className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  {t("auth.forgotPassword")}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-1 mb-8">
                <button
                  type="button"
                  onClick={switchToLogin}
                  className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-3"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  {t("auth.backToLogin")}
                </button>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">
                  {t("auth.forgotPasswordTitle")}
                </h1>
                <p className="text-sm text-muted-foreground">{t("auth.forgotPasswordDesc")}</p>
              </div>

              {forgotSent ? (
                <div className="rounded-xl border border-border/60 bg-muted/40 p-5 flex items-start gap-3">
                  <MailCheck className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                  <p className="text-sm text-foreground/80">{t("auth.forgotPasswordSent")}</p>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="forgot-email" className="text-sm font-medium">
                      {t("auth.email")}
                    </Label>
                    <Input
                      id="forgot-email"
                      type="email"
                      placeholder={t("auth.emailPlaceholder")}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="h-12 rounded-xl text-base"
                      autoComplete="email"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 gap-2 rounded-xl font-semibold text-base mt-2 transition-all duration-200 hover:shadow-lg"
                    disabled={submitting}
                  >
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    {submitting ? t("common.loading") : t("auth.forgotPasswordSubmit")}
                  </Button>
                </form>
              )}
            </>
          )}

          <FFRFooter className="mt-8" />
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
