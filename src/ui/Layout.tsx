import type { ReactNode } from "react";
import { Link } from "react-router-dom";

type LayoutProps = {
  children: ReactNode;
};

export default function Layout({ children }: LayoutProps) {
  return (
    <>
      <header className="header">
        <div className="brand">
          <Link to="/" aria-label="Ir a inicio">
            Setas de España
          </Link>
          <p className="subtitle">Estudio: fotos y con qué no confundirlas</p>
        </div>
      </header>

      <main className="container">{children}</main>
    </>
  );
}
