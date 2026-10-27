import { Link, createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Logo } from "@/components/lunae/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Acceso privado · Lunae" },
      { name: "description", content: "Acceso al panel privado de Lunae para administrar el catálogo." },
      { property: "og:title", content: "Acceso privado · Lunae" },
      { property: "og:description", content: "Panel privado para administrar el catálogo de Lunae." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/admin", replace: true });
    });
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) navigate({ to: "/admin", replace: true });
    });
    return () => data.subscription.unsubscribe();
  }, [navigate]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}${window.location.pathname}#/admin` },
        });
        if (error) throw error;
        if (!data.session) setSent(true);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Algo salió mal";
      toast.error(msg.includes("Invalid login") ? "Correo o contraseña incorrectos" : msg);
    } finally {
      setLoading(false);
    }
  }

  async function google() {
    const result = await lovable.auth.signInWithOAuth("google", { redirect_uri: `${window.location.origin}${window.location.pathname}#/auth` });
    if (result.error) toast.error("No se pudo entrar con Google");
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ivory-gradient px-5 py-12">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm"
      >
        <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Catálogo
        </Link>
        <div className="rounded-3xl border border-border bg-card/80 p-8 shadow-lift backdrop-blur">
          <div className="mb-8 flex justify-center">
            <Logo />
          </div>
          {sent ? (
            <div className="text-center">
              <h1 className="font-display text-2xl">Revisa tu correo</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Te enviamos un enlace a <strong>{email}</strong> para confirmar tu cuenta.
              </p>
            </div>
          ) : (
            <>
              <h1 className="text-center font-display text-3xl">
                {mode === "signin" ? "Bienvenida" : "Crear cuenta"}
              </h1>
              <p className="mt-1 mb-6 text-center text-sm text-muted-foreground">Panel para administrar el catálogo</p>
              <form onSubmit={onSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email">Correo</Label>
                  <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="h-12 rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input id="password" type="password" autoComplete={mode === "signin" ? "current-password" : "new-password"} required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="h-12 rounded-xl" />
                </div>
                <Button type="submit" variant="gold" size="xl" className="w-full" disabled={loading}>
                  {loading && <Loader2 className="animate-spin" />}
                  {mode === "signin" ? "Entrar" : "Crear cuenta"}
                </Button>
              </form>
              <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
                <div className="h-px flex-1 bg-border" /> o <div className="h-px flex-1 bg-border" />
              </div>
              <Button type="button" variant="hairline" size="xl" className="w-full" onClick={google}>
                <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
                  <path fill="currentColor" d="M21.35 11.1H12v2.98h5.35c-.23 1.4-1.66 4.1-5.35 4.1-3.22 0-5.85-2.67-5.85-5.96S8.78 6.26 12 6.26c1.83 0 3.06.78 3.76 1.45l2.57-2.47C16.68 3.7 14.55 2.75 12 2.75 6.9 2.75 2.75 6.9 2.75 12S6.9 21.25 12 21.25c5.34 0 8.88-3.75 8.88-9.04 0-.6-.07-1.07-.15-1.11z" />
                </svg>
                Continuar con Google
              </Button>
              <p className="mt-6 text-center text-sm text-muted-foreground">
                {mode === "signin" ? "¿Primera vez?" : "¿Ya tienes cuenta?"}{" "}
                <button type="button" onClick={() => setMode(mode === "signin" ? "signup" : "signin")} className="text-gold-deep underline-offset-4 hover:underline">
                  {mode === "signin" ? "Crear cuenta" : "Entrar"}
                </button>
              </p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
