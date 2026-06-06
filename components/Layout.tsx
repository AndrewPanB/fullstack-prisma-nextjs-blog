import React, { ReactNode } from "react";
import Header from "./Header";

type Props = {
  children: ReactNode;
};

const Layout: React.FC<Props> = (props) => (
  <div className="page-wrapper">
    <Header />
    <main className="layout">{props.children}</main>
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-brand">
          <span className="footer-logo">✦</span>
          <span className="footer-name">NextGenerationLog</span>
        </div>
        <p className="footer-text">
          Built with Next.js, Prisma &amp; PostgreSQL. Crafted with care.
        </p>
        <div className="footer-links">
          <a href="/" className="footer-link">Home</a>
          <span className="footer-divider">·</span>
          <a href="/drafts" className="footer-link">Drafts</a>
          <span className="footer-divider">·</span>
          <a href="/create" className="footer-link">Write</a>
        </div>
        <p className="footer-copy">&copy; {new Date().getFullYear()} NextGenerationLog. All rights reserved.</p>
      </div>
    </footer>
    <style jsx>{`
      .page-wrapper {
        display: flex;
        flex-direction: column;
        min-height: 100vh;
      }

      .layout {
        flex: 1;
        max-width: 960px;
        width: 100%;
        margin: 0 auto;
        padding: 2rem 1.5rem;
      }

      @media (max-width: 640px) {
        .layout {
          padding: 1.5rem 1rem;
        }
      }

      .footer {
        margin-top: auto;
        padding: 3rem 1.5rem 2rem;
        background: linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%);
        border-top: 1px solid var(--border-color-light, #f1f5f9);
      }

      .footer-content {
        max-width: 600px;
        margin: 0 auto;
        text-align: center;
      }

      .footer-brand {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
      }

      .footer-logo {
        font-size: 1.5rem;
        color: var(--color-primary, #6366f1);
      }

      .footer-name {
        font-size: 1.25rem;
        font-weight: 700;
        background: var(--gradient-primary, linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .footer-text {
        color: var(--text-secondary, #64748b);
        font-size: 0.9rem;
        margin-bottom: 1rem;
      }

      .footer-links {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 0.5rem;
        margin-bottom: 0.75rem;
        flex-wrap: wrap;
      }

      .footer-link {
        color: var(--text-secondary, #64748b);
        font-size: 0.9rem;
        transition: color 0.2s;
      }

      .footer-link:hover {
        color: var(--color-primary, #6366f1);
      }

      .footer-divider {
        color: var(--text-muted, #94a3b8);
      }

      .footer-copy {
        color: var(--text-muted, #94a3b8);
        font-size: 0.8rem;
      }
    `}</style>
  </div>
);

export default Layout;
