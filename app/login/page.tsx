"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Se o usuário já está autenticado, redireciona para a página inicial
    if (status === "authenticated" && session?.user) {
      router.push("/");
    }
  }, [status, session, router]);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const result = await signIn("google", {
        redirect: true,
        callbackUrl: "/",
      });
      if (result?.error) {
        console.error("Login error:", result.error);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Login failed:", error);
      setIsLoading(false);
    }
  };

  if (status === "loading") {
    return (
      <main style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
        <div className="rbac-wrapper">
          <div className="rbac-card">
            <p style={{ textAlign: "center" }}>Carregando...</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh" }}>
      <div className="rbac-wrapper" style={{ maxWidth: "400px" }}>
        <div className="rbac-card">
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <span className="rbac-badge">RBAC · IAM</span>
          </div>

          <h1 className="rbac-title" style={{ textAlign: "center", marginBottom: 8 }}>
            Fazer Login
          </h1>

          <p
            className="rbac-subtitle"
            style={{ textAlign: "center", marginBottom: 32 }}
          >
            Autentique-se com sua conta Google para acessar a plataforma de
            controle de acessos.
          </p>

          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            style={{
              width: "100%",
              padding: "12px 16px",
              fontSize: "16px",
              fontWeight: "500",
              border: "1px solid #d1d5db",
              borderRadius: "8px",
              backgroundColor: "#ffffff",
              color: "#1f2937",
              cursor: isLoading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "all 0.2s ease",
              opacity: isLoading ? 0.6 : 1,
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                (e.target as HTMLButtonElement).style.backgroundColor = "#f3f4f6";
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                (e.target as HTMLButtonElement).style.backgroundColor = "#ffffff";
              }
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            {isLoading ? "Autenticando..." : "Entrar com Google"}
          </button>

          <div style={{ marginTop: 24, padding: "16px", backgroundColor: "#f9fafb", borderRadius: "8px" }}>
            <p style={{ fontSize: "12px", color: "#6b7280", margin: 0 }}>
              <strong>Nota de Teste:</strong> Esta página utiliza a credencial Google OAuth
              para autenticação via SSO.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
