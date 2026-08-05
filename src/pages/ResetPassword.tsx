import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, useReducedMotion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Eye, EyeOff, KeyRound, CheckCircle2, AlertTriangle } from "lucide-react";
import { FFRFooter } from "@/components/FFRFooter";

const APP_NAME = "Embio Intelligence Pro";

type ViewState = "checking" | "ready" | "invalid" | "success";
type LinkType = "invite" | "recovery" | null;

// Supabase entrega os tokens de convite/recuperação como fragmento de URL
// (#access_token=...&type=recovery), nunca como query string — o fragmento
// não é enviado ao servidor, então isso não aparece em logs de acesso.
function parseHashParams(): Record<string, string> {
  const hash = window.location.hash.startsWith("#") ? window.location.hash.slice(1) : window.location.hash;
  return Object.fromEntries(new URLSearchParams(hash));
}

const ResetPassword = () => {
  const [state, setState] = useState<ViewState>("checking");
  const [linkType, setLinkType] = useState<LinkType>(null);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const params = parseHashParams();

    // Link expirado ou já usado: o Supabase redireciona com error/error_code
    // no lugar dos tokens, em vez de lançar uma exceção no cliente.
    if (params.error || params.error_code) {
      setState("invalid");
      return;
    }

    // Sem type=invite|recovery no fragmento, não há motivo legítimo para
    // esta tela conceder acesso a definição de senha — não confiar em uma
    // sessão já ativa de outra origem.
    if (params.type !== "invite" && params.type !== "recovery") {
      setState("invalid");
      return;
    }

    setLinkType(params.type);
    let settled = false;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (settled || !session) return;
      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        settled = true;
        setState("ready");
      }
    });

    // Se o cliente já processou o link antes deste efeito ser registrado,
    // a sessão já existe — não é preciso esperar o evento.
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (settled || !session) return;
      settled = true;
      setState("ready");
    });

    const timeout = window.setTimeout(() => {
      if (!settled) setState("invalid");
    }, 4000);

    return () => {
      subscription.unsubscribe();
      window.clearTimeout(timeout);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (password.length < 6) {
      setFormError(t("resetPassword.minLengthError"));
      return;
    }
    if (password !== confirmPassword) {
      setFormError(t("resetPassword.mismatchError"));
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        setFormError(t("resetPassword.genericError"));
        return;
      }
      setState("success");
      window.setTimeout(() => navigate("/", { replace: true }), 1800);
    } catch {
      setFormError(t("resetPassword.genericError"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-svh items-center justify-center bg-background px-6 py-8">
      <motion.div
        className="w-full max-w-sm"
        initial={reduceMotion ? false : { opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
      >
        <div className="flex items-center gap-3 mb-8 justify-center">
          <img
            src="/web-app-manifest-512x512.png"
            alt={APP_NAME}
            className="h-12 w-12 rounded-2xl object-contain shadow-lg"
          />
          <p className="text-lg font-bold text-foreground">{APP_NAME}</p>
        </div>

        {state === "checking" && (
          <div className="flex flex-col items-center gap-3 py-10 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {state === "invalid" && (
          <div className="space-y-5 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div className="space-y-1.5">
              <h1 className="text-xl font-bold text-foreground">{t("resetPassword.invalidLinkTitle")}</h1>
              <p className="text-sm text-muted-foreground">{t("resetPassword.invalidLinkDesc")}</p>
            </div>
            <Button variant="outline" className="w-full h-12 rounded-xl" onClick={() => navigate("/auth")}>
              {t("resetPassword.backToLogin")}
            </Button>
          </div>
        )}

        {state === "success" && (
          <div className="space-y-5 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent/15">
              <CheckCircle2 className="h-6 w-6 text-accent" />
            </div>
            <div className="space-y-1.5">
              <h1 className="text-xl font-bold text-foreground">{t("resetPassword.success")}</h1>
              <p className="text-sm text-muted-foreground">{t("resetPassword.successDesc")}</p>
            </div>
          </div>
        )}

        {state === "ready" && (
          <>
            <div className="space-y-1 mb-8 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-3">
                <KeyRound className="h-6 w-6 text-primary" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("resetPassword.title")}</h1>
              <p className="text-sm text-muted-foreground">
                {linkType === "invite" ? t("resetPassword.descInvite") : t("resetPassword.descRecovery")}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="new-password" className="text-sm font-medium">
                  {t("resetPassword.newPassword")}
                </Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="h-12 rounded-xl text-base pr-10"
                    autoComplete="new-password"
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

              <div className="space-y-1.5">
                <Label htmlFor="confirm-password" className="text-sm font-medium">
                  {t("resetPassword.confirmPassword")}
                </Label>
                <Input
                  id="confirm-password"
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="h-12 rounded-xl text-base"
                  autoComplete="new-password"
                />
              </div>

              {formError && <p className="text-sm text-destructive">{formError}</p>}

              <Button
                type="submit"
                className="w-full h-12 gap-2 rounded-xl font-semibold text-base mt-2 transition-all duration-200 hover:shadow-lg"
                disabled={submitting}
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                {submitting ? t("common.loading") : t("resetPassword.submit")}
              </Button>
            </form>
          </>
        )}

        <FFRFooter className="mt-8" />
      </motion.div>
    </div>
  );
};

export default ResetPassword;
