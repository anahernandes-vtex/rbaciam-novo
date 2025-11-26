import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "RBAC IAM – Consulta de Acessos",
  description: "Consulta de acessos por time baseada na matriz de RBAC.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className="rbac-body">
        {children}
      </body>
    </html>
  );
}