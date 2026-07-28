import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, useReducedMotion } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { LogIn, UserPlus, Loader2, Eye, EyeOff, Users, FileText, LineChart } from "lucide-react";
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
  const { user, loading, signIn, signUp } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;
    if (!isLogin && !fullName.trim()) return;

    setSubmitting(true);
    try {
      if (isLogin) {
        const { error } = await signIn(email.trim(), password);
        if (error) {
          toast({ title: t("auth.loginError"), description: error.message, variant: "destructive" });
        }
      } else {
        const { error } = await signUp(email.trim(), password, fullName.trim());
        if (error) {
          toast({ title: t("auth.signupError"), description: error.message, variant: "destructive" });
        } else {
          toast({ title: t("auth.accountCreated"), description: t("auth.accountCreatedDesc") });
        }
      }
    } finally {
      setSubmitting(false);
    }
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
          <div className="space-y-1 mb-8">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {isLogin ? "Entrar na conta" : "Criar conta"}
            </h1>
            <p className="text-sm text-muted-foreground">
              {isLogin
                ? "Use suas credenciais para acessar o sistema."
                : "Crie sua conta para começar a usar o sistema."}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1.5">
                <Label htmlFor="fullName" className="text-sm font-medium">
                  {t("auth.fullName")}
                </Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder={t("auth.fullNamePlaceholder")}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required={!isLogin}
                  className="h-12 rounded-xl text-base"
                  autoComplete="name"
                />
              </div>
            )}

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
                  autoComplete={isLogin ? "current-password" : "new-password"}
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
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isLogin ? (
                <LogIn className="h-4 w-4" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              {submitting
                ? t("common.loading")
                : isLogin
                ? t("auth.login")
                : t("auth.signup")}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-primary hover:text-primary/80 font-medium transition-colors"
            >
              {isLogin ? t("auth.noAccount") : t("auth.hasAccount")}
            </button>
          </div>
          <FFRFooter className="mt-8" />
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
