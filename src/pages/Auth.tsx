import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import { useBranding } from "@/hooks/useBranding";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { LogIn, UserPlus, Loader2, Eye, EyeOff, Wheat, FlaskConical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { FFRFooter } from "@/components/FFRFooter";

const Auth = () => {
  const { user, loading, signIn, signUp } = useAuth();
  const { branding } = useBranding();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-sidebar">
        <Loader2 className="h-8 w-8 animate-spin text-sidebar-primary" />
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

  const appName = branding.app_name || "Embio Comercial";
  const slogan = branding.slogan || "Biotecnologia · Agropecuária";

  return (
    <div className="flex min-h-svh">
      {/* Left panel — brand identity */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 bg-sidebar px-10 py-12 relative overflow-hidden">
        {/* Background texture */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-sidebar-primary/8 blur-3xl" />
          <div className="absolute bottom-16 -right-16 h-48 w-48 rounded-full bg-accent/6 blur-2xl" />
        </div>

        {/* Logo + name */}
        <div className="relative flex items-center gap-3">
          {branding.logo_url ? (
            <img
              src={branding.logo_url}
              alt={appName}
              className="h-10 w-10 rounded-xl object-contain"
            />
          ) : (
            <div className="h-10 w-10 rounded-xl bg-sidebar-primary/20 flex items-center justify-center">
              <Wheat className="h-5 w-5 text-sidebar-primary" />
            </div>
          )}
          <div>
            <p className="text-sm font-bold text-sidebar-foreground leading-tight">{appName}</p>
            <p className="text-[10px] text-sidebar-foreground/40 leading-tight mt-0.5">{slogan}</p>
          </div>
        </div>

        {/* Center content */}
        <div className="relative space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <FlaskConical className="h-5 w-5 text-sidebar-primary" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-sidebar-primary">
                Plataforma Comercial
              </span>
            </div>
            <h2 className="text-2xl font-bold text-sidebar-foreground leading-snug">
              Gestão completa para<br />o agronegócio.
            </h2>
            <p className="text-sm text-sidebar-foreground/45 leading-relaxed">
              Orçamentos, clientes, agenda e indicadores — tudo integrado em uma plataforma profissional.
            </p>
          </div>

          <div className="space-y-3">
            {[
              "Orçamentos técnicos com PDF",
              "Dimensionamento de lagoas",
              "Agenda comercial de campo",
              "Indicadores em tempo real",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2.5">
                <div className="h-1.5 w-1.5 rounded-full bg-sidebar-primary shrink-0" />
                <span className="text-[13px] text-sidebar-foreground/60">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative">
          <p className="text-[10px] text-sidebar-foreground/25 uppercase tracking-widest mb-1">
            {branding.company_name || "Embio"} · Sistema Interno
          </p>
          <FFRFooter className="py-1 justify-start" />
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center bg-background p-6">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center justify-center gap-2.5 mb-8">
            {branding.logo_url ? (
              <img src={branding.logo_url} alt={appName} className="h-8 w-8 rounded-lg object-contain" />
            ) : (
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Wheat className="h-4 w-4 text-primary" />
              </div>
            )}
            <p className="font-bold text-foreground">{appName}</p>
          </div>

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
                  className="h-11 rounded-xl"
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
                className="h-11 rounded-xl"
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
                  className="h-11 rounded-xl pr-10"
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
                "w-full h-11 gap-2 rounded-xl font-semibold text-[15px] mt-2",
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
        </div>
      </div>
    </div>
  );
};

export default Auth;
