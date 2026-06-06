import React from "react";
import type { GetStaticProps } from "next";
import Layout from "../components/Layout";
import Post, { PostProps } from "../components/Post";
import prisma from '../lib/prisma'

export const getStaticProps: GetStaticProps = async () => {
  const feed = await prisma.post.findMany({
    where: {
      published: true,
    },
    include: {
      author: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      id: 'desc',
    },
  });
  return {
    props: { feed },
    revalidate: 10,
  };
};

type Props = {
  feed: PostProps[];
};

const Blog: React.FC<Props> = (props) => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg-decor" />
        <div className="hero-content">
          <span className="hero-badge">📝 Community Blog</span>
          <h1 className="hero-title">
            Explore Ideas,{" "}
            <span className="hero-highlight">Share Stories</span>
          </h1>
          <p className="hero-subtitle">
            Discover articles from our community of writers. Thoughtful pieces on
            technology, design, and life.
          </p>
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-number">{props.feed.length}</span>
              <span className="stat-label">Articles</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-number">
                {new Set(props.feed.map((p) => p.author?.name)).size}
              </span>
              <span className="stat-label">Authors</span>
            </div>
            <div className="stat-divider" />
            <div className="stat-item">
              <span className="stat-number">✦</span>
              <span className="stat-label">Curated</span>
            </div>
          </div>
        </div>
      </section>

      {/* Posts List */}
      <section className="posts-section">
        <div className="section-header">
          <h2 className="section-title">Latest Posts</h2>
          <div className="section-line" />
        </div>

        {props.feed.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <h3>No posts yet</h3>
            <p>Be the first to share your story! Sign in and create a new post.</p>
          </div>
        ) : (
          <div className="posts-list">
            {props.feed.map((post, index) => (
              <div
                key={post.id}
                className="post-item"
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <Post post={post} />
              </div>
            ))}
          </div>
        )}
      </section>

      <style jsx>{`
        /* ===== Hero ===== */
        .hero {
          padding: 2.5rem 0 2rem;
          margin-bottom: 1.5rem;
        }

        .hero-content {
          max-width: 640px;
        }

        .hero-badge {
          display: inline-block;
          padding: 3px 10px;
          background: #f0f0f0;
          color: #555;
          border-radius: 5px;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 0.3px;
          text-transform: uppercase;
          margin-bottom: 0.75rem;
        }

        .hero-title {
          font-size: 40px;
          font-weight: 800;
          color: #111;
          line-height: 1.12;
          margin-bottom: 0.6rem;
          letter-spacing: -0.03em;
        }

        .hero-highlight {
          color: #111;
          font-weight: 900;
          font-size: 1.05em;
        }

        .hero-subtitle {
          font-size: 17px;
          color: #666;
          line-height: 1.55;
          margin-bottom: 1.5rem;
        }

        .hero-stats {
          display: flex;
          align-items: center;
          gap: 1.75rem;
        }

        .stat-item {
          text-align: center;
        }

        .stat-number {
          display: block;
          font-size: 24px;
          font-weight: 800;
          color: #111;
          font-variant-numeric: tabular-nums;
        }

        .stat-label {
          font-size: 12px;
          color: #999;
          font-weight: 500;
          letter-spacing: 0.2px;
        }

        .stat-divider {
          width: 1px;
          height: 30px;
          background: #e0e0e0;
        }

        /* ===== Posts List ===== */
        .posts-section {
          padding-bottom: 2rem;
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 1.25rem;
        }

        .section-title {
          font-size: 13px;
          font-weight: 600;
          color: #888;
          text-transform: uppercase;
          letter-spacing: 0.6px;
          white-space: nowrap;
        }

        .section-line {
          flex: 1;
          height: 1px;
          background: #e8e8e8;
        }

        .posts-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .post-item {
          animation: fadeIn 0.4s ease both;
        }

        /* ===== Empty State ===== */
        .empty-state {
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

        .empty-state h3 {
          font-size: 18px;
          font-weight: 600;
          color: #111;
          margin-bottom: 4px;
        }

        .empty-state p {
          color: #777;
          font-size: 14px;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @media (max-width: 768px) {
          .hero-title {
            font-size: 30px;
          }
          .hero-stats {
            gap: 1rem;
          }
        }
      `}</style>
    </Layout>
  );
};

export default Blog;
