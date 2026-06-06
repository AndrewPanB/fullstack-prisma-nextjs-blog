import React from "react";
import type { GetStaticProps, GetStaticPaths } from "next";
import ReactMarkdown from "react-markdown";
import Layout from "../../components/Layout";
import Router from "next/router";
import { PostProps } from "../../components/Post";
import prisma from '../../lib/prisma'
import { useSession } from "next-auth/react";

export const getStaticPaths: GetStaticPaths = async () => {
  const posts = await prisma.post.findMany({
    where: { published: true },
    select: { id: true },
  });
  return {
    paths: posts.map((post) => ({ params: { id: post.id } })),
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const post = await prisma.post.findUnique({
    where: {
      id: String(params?.id) ,
    },
    include: {
      author: {
        select: { name: true, email: true },
      },
    },
  });
  return {
    props: post,
    revalidate: 10,
  };
};

async function publishPost(id: number): Promise<void> {
  await fetch(`/api/publish/${id}`, {
    method: "PUT",
  });
  await Router.push("/")
}

async function deletePost(id: number): Promise<void> {
  await fetch(`/api/post/${id}`, {
    method: "DELETE",
  });
  await Router.push("/")
}

const Post: React.FC<PostProps> = (props) => {
  const { data: session, status } = useSession();
  if (status === 'loading') {
    return (
      <Layout>
        <div className="loading-container">
          <div className="loading-spinner" />
          <p>Loading article...</p>
          <style jsx>{`
            .loading-container {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              padding: 4rem 1rem;
              gap: 1rem;
            }
            .loading-spinner {
              width: 36px;
              height: 36px;
              border: 3px solid var(--border-color, #e2e8f0);
              border-top-color: var(--color-primary, #6366f1);
              border-radius: 50%;
              animation: spin 0.8s linear infinite;
            }
            @keyframes spin { to { transform: rotate(360deg); } }
            p { color: var(--text-muted, #94a3b8); font-size: 0.9rem; }
          `}</style>
        </div>
      </Layout>
    );
  }
  const userHasValidSession = Boolean(session);
  const postBelongsToUser = session?.user?.email === props.author?.email;
  const authorName = props?.author?.name || "Unknown author";
  const authorInitial = authorName.charAt(0).toUpperCase();
  const title = props.title;
  const isDraft = !props.published;
  const wordCount = props.content.trim().split(/\s+/).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  return (
    <Layout>
      <article className="post-detail">
        {/* Article Header */}
        <header className="article-header">
          {isDraft && (
            <span className="draft-flag">🔒 Draft</span>
          )}
          <h1 className="article-title">{title}</h1>

          <div className="article-meta">
            <div className="author-card">
              <div className="author-avatar-lg">{authorInitial}</div>
              <div className="author-details">
                <span className="author-fullname">{authorName}</span>
                {props.author?.email && (
                  <span className="author-email">{props.author.email}</span>
                )}
              </div>
            </div>
            <div className="meta-info">
              <span className="meta-tag">📖 {readingTime} min read</span>
              <span className="meta-tag">📝 {wordCount} words</span>
            </div>
          </div>

          <div className="article-divider" />
        </header>

        {/* Article Content */}
        <div className="article-body markdown-body">
          <ReactMarkdown>{props.content}</ReactMarkdown>
        </div>

        {/* Article Footer */}
        <footer className="article-footer">
          <div className="footer-divider" />
          <div className="footer-actions">
            <button className="btn-back" onClick={() => Router.push("/")}>
              ← Back to Feed
            </button>
            <div className="admin-actions">
              {userHasValidSession && postBelongsToUser && (
                <button
                  className="btn-edit"
                  onClick={() => Router.push(`/create?edit=${props.id}`)}
                >
                  Edit
                </button>
              )}
              {isDraft && userHasValidSession && postBelongsToUser && (
                <button
                  className="btn-publish"
                  onClick={() => publishPost(props.id)}
                >
                  Publish
                </button>
              )}
              {userHasValidSession && postBelongsToUser && (
                <button
                  className="btn-delete"
                  onClick={() => deletePost(props.id)}
                >
                  Delete
                </button>
              )}
            </div>
          </div>

          {/* Author Bio */}
          <div className="author-bio">
            <div className="author-avatar-xl">{authorInitial}</div>
            <div className="author-bio-text">
              <strong>{authorName}</strong>
              <p>A passionate writer sharing thoughts and ideas with the community.</p>
            </div>
          </div>
        </footer>
      </article>

      <style jsx>{`
        .post-detail {
          max-width: 720px;
          margin: 0 auto;
          animation: fadeIn 0.4s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* ===== Article Header ===== */
        .article-header {
          margin-bottom: 1.75rem;
          padding-top: 0.25rem;
        }

        .draft-flag {
          display: inline-block;
          padding: 2px 10px;
          background: #fff7e6;
          color: #b45309;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 600;
          margin-bottom: 0.75rem;
          border: 1px solid #fde68a;
        }

        .article-title {
          font-size: 36px;
          font-weight: 800;
          color: #111;
          line-height: 1.2;
          margin-bottom: 1rem;
          letter-spacing: -0.025em;
        }

        .article-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .author-card {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .author-avatar-lg {
          width: 40px;
          height: 40px;
          border-radius: 7px;
          background: #111;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          font-weight: 700;
          flex-shrink: 0;
        }

        .author-details {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }

        .author-fullname {
          font-weight: 600;
          color: #111;
          font-size: 15px;
        }

        .author-email {
          font-size: 12px;
          color: #999;
        }

        .meta-info {
          display: flex;
          gap: 8px;
        }

        .meta-tag {
          font-size: 12px;
          color: #999;
          padding: 3px 10px;
          background: #f5f5f5;
          border-radius: 5px;
        }

        .article-divider {
          margin-top: 1.25rem;
          height: 1px;
          background: #e8e8e8;
        }

        /* ===== Article Body ===== */
        .article-body {
          padding: 0.75rem 0 2rem;
          font-size: 1.08rem;
          line-height: 1.85;
        }

        /* ===== Article Footer ===== */
        .article-footer {
          margin-top: 1.5rem;
        }

        .footer-divider {
          height: 1px;
          background: #e8e8e8;
          margin-bottom: 1.25rem;
        }

        .footer-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 2rem;
        }

        .btn-back {
          padding: 8px 18px;
          border-radius: 7px;
          background: #f5f5f5;
          color: #555;
          border: none;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
        }
        .btn-back:hover {
          background: #e8e8e8;
          color: #111;
        }

        .admin-actions {
          display: flex;
          gap: 8px;
        }

        .btn-edit {
          padding: 8px 20px;
          border-radius: 7px;
          background: #fff;
          color: #111;
          border: 1.5px solid #d0d0d0;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.15s;
        }
        .btn-edit:hover {
          background: #f5f5f5;
          border-color: #111;
        }

        .btn-publish {
          padding: 8px 20px;
          border-radius: 7px;
          background: #111;
          color: #fff;
          border: none;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s;
        }
        .btn-publish:hover { background: #333; }

        .btn-delete {
          padding: 8px 20px;
          border-radius: 7px;
          background: #fff;
          color: #cc0000;
          border: 1.5px solid #ffcccc;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
        }
        .btn-delete:hover {
          background: #cc0000;
          color: #fff;
          border-color: #cc0000;
        }

        /* ===== Author Bio ===== */
        .author-bio {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 18px 20px;
          background: #fafafa;
          border-radius: 10px;
          border: 1px solid #eee;
        }

        .author-avatar-xl {
          width: 44px;
          height: 44px;
          border-radius: 8px;
          background: #111;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 18px;
          font-weight: 700;
          flex-shrink: 0;
        }

        .author-bio-text strong {
          display: block;
          font-size: 15px;
          color: #111;
          margin-bottom: 2px;
        }

        .author-bio-text p {
          font-size: 13px;
          color: #777;
          line-height: 1.5;
          margin: 0;
        }

        @media (max-width: 640px) {
          .article-title { font-size: 26px; }
          .article-meta { flex-direction: column; align-items: flex-start; }
          .footer-actions { flex-direction: column; align-items: stretch; }
          .footer-actions button { width: 100%; justify-content: center; }
        }
      `}</style>
    </Layout>
  );
};

export default Post;
