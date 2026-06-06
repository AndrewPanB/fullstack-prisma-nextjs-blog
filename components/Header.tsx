import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { signOut, useSession } from "next-auth/react";

const Header: React.FC = () => {
  const router = useRouter();
  const isActive: (pathname: string) => boolean = (pathname) =>
    router.pathname === pathname;

  const { data: session, status } = useSession();

  return (
    <header className="header">
      <div className="header-inner">
        {/* Left: Logo */}
        <Link href="/" className="logo">
          <svg className="logo-mark" width="22" height="22" viewBox="0 0 24 24" fill="none">
            <rect x="2" y="2" width="20" height="20" rx="5" stroke="currentColor" strokeWidth="2"/>
            <path d="M7 12L10.5 15.5L17 9" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="logo-word">NextGenerationLog</span>
        </Link>

        {/* Center: Main Nav Tabs */}
        <nav className="nav">
          <Link href="/" className={`nav-tab ${isActive("/") ? "active" : ""}`}>
            <svg className="tab-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
            Feed
          </Link>
          {session && (
            <Link href="/drafts" className={`nav-tab ${isActive("/drafts") ? "active" : ""}`}>
              <svg className="tab-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
                <line x1="16" y1="13" x2="8" y2="13"/>
                <line x1="16" y1="17" x2="8" y2="17"/>
                <polyline points="10 9 9 9 8 9"/>
              </svg>
              Drafts
            </Link>
          )}
          {session && (
            <Link href="/create" className={`nav-tab nav-action ${isActive("/create") ? "active" : ""}`}>
              <svg className="tab-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              New Post
            </Link>
          )}
        </nav>

        {/* Right: User */}
        <div className="right">
          {status === "loading" ? (
            <>
              <span className="skeleton-avatar" />
              <span className="skeleton-text" />
            </>
          ) : !session ? (
            <Link href="/api/auth/signin" className="btn-signin">
              Sign In
            </Link>
          ) : (
            <>
              <div className="user-chip">
                <span className="chip-avatar">{session.user.name?.charAt(0).toUpperCase() || "U"}</span>
                <span className="chip-name">{session.user.name}</span>
              </div>
              <button onClick={() => signOut()} className="btn-signout">
                Sign Out
              </button>
            </>
          )}
        </div>
      </div>

      <style jsx>{`
        .header {
          position: sticky;
          top: 0;
          z-index: 100;
          background: #fff;
          border-bottom: 1px solid #ebebeb;
        }

        .header-inner {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 1.5rem;
          height: 64px;
          display: flex;
          align-items: center;
        }

        /* ---- Logo ---- */
        .logo {
          display: flex;
          align-items: center;
          gap: 7px;
          text-decoration: none;
          color: #111;
          flex-shrink: 0;
          margin-right: 2rem;
        }
        .logo-mark { color: #000; }
        .logo-word {
          font-size: 16px;
          font-weight: 700;
          color: #111;
          letter-spacing: -0.2px;
        }

        /* ---- Nav Tabs ---- */
        .nav {
          display: flex;
          align-items: center;
          gap: 6px;
          flex: 1;
          justify-content: center;
        }

        .nav-tab {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 10px 20px;
          font-size: 15px;
          font-weight: 600;
          color: #777;
          text-decoration: none;
          border-radius: 10px;
          transition: color 0.15s, background 0.15s, box-shadow 0.15s;
          position: relative;
        }
        .nav-tab:hover {
          color: #111;
          background: #f5f5f5;
        }
        .nav-tab.active {
          color: #111;
          background: #111;
          color: #fff;
          box-shadow: 0 2px 8px rgba(0,0,0,0.12);
        }
        .nav-tab.active:hover {
          background: #222;
          color: #fff;
        }

        /* New Post special styling */
        .nav-action {
          color: #111;
          border: 2px dashed #d0d0d0;
        }
        .nav-action:hover {
          border-color: #111;
          background: #fafafa;
        }
        .nav-action.active {
          border-color: #111;
        }

        .tab-icon {
          flex-shrink: 0;
        }

        /* ---- Right ---- */
        .right {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-shrink: 0;
          margin-left: 2rem;
        }

        .btn-signin {
          display: inline-flex;
          align-items: center;
          height: 36px;
          padding: 0 16px;
          font-size: 14px;
          font-weight: 600;
          border-radius: 8px;
          background: #111;
          color: #fff;
          text-decoration: none;
          transition: background 0.15s;
          white-space: nowrap;
        }
        .btn-signin:hover { background: #333; color: #fff; }

        .btn-signout {
          background: none;
          border: none;
          font-size: 13px;
          color: #aaa;
          cursor: pointer;
          font-weight: 500;
          transition: color 0.15s;
          white-space: nowrap;
        }
        .btn-signout:hover { color: #111; }

        /* ---- User Chip ---- */
        .user-chip {
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: default;
        }

        .chip-avatar {
          width: 30px;
          height: 30px;
          border-radius: 7px;
          background: #111;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 12px;
          font-weight: 700;
          flex-shrink: 0;
        }

        .chip-name {
          font-size: 14px;
          font-weight: 600;
          color: #333;
          max-width: 100px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        /* ---- Skeleton ---- */
        .skeleton-avatar {
          width: 30px;
          height: 30px;
          border-radius: 7px;
          background: #eee;
        }
        .skeleton-text {
          width: 80px;
          height: 14px;
          border-radius: 4px;
          background: #eee;
        }

        /* ---- Responsive ---- */
        @media (max-width: 850px) {
          .header-inner { padding: 0 1rem; }
          .logo { margin-right: 0.75rem; }
          .logo-word { display: none; }
          .nav { gap: 2px; }
          .nav-tab { padding: 8px 14px; font-size: 14px; }
          .right { margin-left: 0.75rem; gap: 6px; }
          .chip-name, .btn-signout { display: none; }
        }
      `}</style>
    </header>
  );
};

export default Header;
