import React from "react";
import type { GetServerSideProps } from "next";
import Layout from "../components/Layout";
import Post, { PostProps } from "../components/Post";
import { useSession } from "next-auth/react";
import { unstable_getServerSession } from "next-auth";
import prisma from '../lib/prisma'
import { authOptions } from '../lib/auth'
import Link from "next/link";


export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const session = await unstable_getServerSession(req, res, authOptions);
  if (!session) {
    return { props: { drafts: [] } };
  }

  const drafts = await prisma.post.findMany({
    where: {
      author: { email: session.user.email },
      published: false,
    },
    include: {
      author: {
        select: { name: true },
      },
    },
    orderBy: {
      id: 'desc',
    },
  });
  return {
    props: { drafts },
  };
};

type Props = {
  drafts: PostProps[];
};

const Drafts: React.FC<Props> = (props) => {
  const {data: session}= useSession();

  if (!session) {
    return (
      <Layout>
        <div className="auth-required">
          <div className="auth-icon">🔒</div>
          <h1 className="auth-title">Authentication Required</h1>
          <p className="auth-text">
            You need to sign in to view your drafts.
          </p>
          <Link href="/api/auth/signin" className="auth-btn">
            Sign In
          </Link>
          <style jsx>{`
            .auth-required {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              text-align: center;
              padding: 4rem 1rem;
              animation: fadeIn 0.4s ease;
            }
            @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
            .auth-icon { font-size: 3rem; margin-bottom: 1rem; }
            .auth-title {
              font-size: 1.5rem;
              font-weight: 700;
              color: var(--text-primary, #1e293b);
              margin-bottom: 0.5rem;
            }
            .auth-text {
              color: var(--text-secondary, #64748b);
              margin-bottom: 1.5rem;
              font-size: 1rem;
            }
            .auth-btn {
              padding: 0.65rem 1.75rem;
              border-radius: var(--radius-md, 12px);
              background: var(--gradient-primary, linear-gradient(135deg, #6366f1, #8b5cf6));
              color: white;
              font-weight: 600;
              text-decoration: none;
              transition: all var(--transition-fast, 150ms ease);
              box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
            }
            .auth-btn:hover {
              transform: translateY(-1px);
              box-shadow: 0 4px 16px rgba(99, 102, 241, 0.4);
              color: white;
            }
          `}</style>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="drafts-page">
        {/* Page Header */}
        <div className="page-header">
          <div className="header-left">
            <h1 className="page-title">My Drafts</h1>
            <span className="draft-count">{props.drafts.length} draft{props.drafts.length !== 1 ? 's' : ''}</span>
          </div>
          <Link href="/create" className="btn-new-draft">
            <span>+</span> New Draft
          </Link>
        </div>

        {/* Drafts List */}
        {props.drafts.length === 0 ? (
          <div className="empty-drafts">
            <div className="empty-icon">📄</div>
            <h3>No drafts yet</h3>
            <p>Start writing your next masterpiece!</p>
            <Link href="/create" className="btn-start-writing">
              Start Writing
            </Link>
          </div>
        ) : (
          <div className="drafts-list">
            {props.drafts.map((post, index) => (
              <div
                key={post.id}
                className="draft-item"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <Post post={post} />
              </div>
            ))}
          </div>
        )}
      </div>

      <style jsx>{`
        .drafts-page {
          max-width: 960px;
          margin: 0 auto;
          animation: fadeIn 0.4s ease;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.25rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .header-left {
          display: flex;
          align-items: baseline;
          gap: 10px;
        }

        .page-title {
          font-size: 28px;
          font-weight: 800;
          color: #111;
          letter-spacing: -0.02em;
        }

        .draft-count {
          font-size: 13px;
          color: #999;
          font-weight: 500;
          padding: 2px 10px;
          background: #f0f0f0;
          border-radius: 6px;
        }

        .btn-new-draft {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          height: 38px;
          padding: 0 16px;
          border-radius: 8px;
          background: #111;
          color: #fff;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          transition: background 0.15s;
        }

        .btn-new-draft:hover {
          background: #333;
          color: #fff;
        }

        .drafts-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .draft-item {
          animation: fadeIn 0.4s ease both;
        }

        /* Empty state */
        .empty-drafts {
          text-align: center;
          padding: 4rem 2rem;
          background: #fff;
          border-radius: 10px;
          border: 2px dashed #e0e0e0;
        }

        .empty-icon {
          font-size: 2.5rem;
          margin-bottom: 0.75rem;
        }

        .empty-drafts h3 {
          font-size: 18px;
          font-weight: 600;
          color: #111;
          margin-bottom: 4px;
        }

        .empty-drafts p {
          color: #777;
          font-size: 14px;
          margin-bottom: 1.25rem;
        }

        .btn-start-writing {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          height: 38px;
          padding: 0 20px;
          border-radius: 8px;
          background: #111;
          color: #fff;
          font-size: 14px;
          font-weight: 600;
          text-decoration: none;
          transition: background 0.15s;
        }

        .btn-start-writing:hover {
          background: #333;
          color: #fff;
        }

        @media (max-width: 768px) {
          .page-title {
            font-size: 22px;
          }
        }
      `}</style>
    </Layout>
  );
};

export default Drafts;
