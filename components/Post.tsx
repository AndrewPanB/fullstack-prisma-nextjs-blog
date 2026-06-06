import React from "react";
import Router from "next/router";
import ReactMarkdown from "react-markdown";

export type PostProps = {
  id: number;
  title: string;
  author: {
    name: string;
    email: string;
  } | null;
  content: string;
  published: boolean;
};

const getReadingTime = (content: string): number => {
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
};

const getExcerpt = (content: string, maxLength = 280): string => {
  const plain = content.replace(/[#*`~\[\]()>!\-\_]/g, "").trim();
  if (plain.length <= maxLength) return plain;
  return plain.slice(0, maxLength).replace(/\s+\S*$/, "") + "...";
};

const Post: React.FC<{ post: PostProps }> = ({ post }) => {
  const authorName = post.author ? post.author.name : "Unknown author";
  const authorInitial = authorName.charAt(0).toUpperCase();
  const readingTime = getReadingTime(post.content);
  const excerpt = getExcerpt(post.content);

  return (
    <article className="row" onClick={() => Router.push("/p/[id]", `/p/${post.id}`)}>
      <div className="row-body">
        {/* Meta line */}
        <div className="row-meta">
          <span className="meta-avatar">{authorInitial}</span>
          <span className="meta-author">{authorName}</span>
          <span className="meta-dot">·</span>
          <span className="meta-time">{readingTime} min read</span>
          {!post.published && (
            <>
              <span className="meta-dot">·</span>
              <span className="meta-draft">Draft</span>
            </>
          )}
        </div>

        {/* Title */}
        <h2 className="row-title">{post.title}</h2>

        {/* Excerpt */}
        <p className="row-excerpt">{excerpt}</p>

        {/* Read link */}
        <span className="row-link">
          Read more <span className="row-arrow">→</span>
        </span>
      </div>

      <style jsx>{`
        .row {
          display: block;
          background: #fff;
          border: 1px solid #e8e8e8;
          border-radius: 10px;
          cursor: pointer;
          transition: border-color 0.15s;
        }
        .row:hover {
          border-color: #bbb;
        }

        .row-body {
          padding: 24px 28px;
        }

        /* ---- Meta ---- */
        .row-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 12px;
        }

        .meta-avatar {
          width: 22px;
          height: 22px;
          border-radius: 5px;
          background: #111;
          color: #fff;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
          flex-shrink: 0;
        }

        .meta-author {
          font-size: 14px;
          font-weight: 500;
          color: #444;
        }

        .meta-dot {
          color: #ccc;
          font-weight: 700;
        }

        .meta-time {
          font-size: 13px;
          color: #999;
        }

        .meta-draft {
          font-size: 12px;
          font-weight: 600;
          color: #b45309;
          background: #fff7e6;
          padding: 1px 8px;
          border-radius: 4px;
          border: 1px solid #fde68a;
        }

        /* ---- Title ---- */
        .row-title {
          font-size: 22px;
          font-weight: 700;
          color: #111;
          line-height: 1.3;
          margin-bottom: 8px;
          letter-spacing: -0.01em;
        }
        .row:hover .row-title {
          text-decoration: underline;
          text-underline-offset: 4px;
          text-decoration-thickness: 2px;
        }

        /* ---- Excerpt ---- */
        .row-excerpt {
          font-size: 15px;
          color: #666;
          line-height: 1.6;
          margin-bottom: 12px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* ---- Link ---- */
        .row-link {
          font-size: 14px;
          font-weight: 600;
          color: #111;
        }
        .row-arrow {
          display: inline-block;
          transition: transform 0.15s;
        }
        .row:hover .row-arrow {
          transform: translateX(4px);
        }

        @media (max-width: 640px) {
          .row-body {
            padding: 18px 20px;
          }
          .row-title {
            font-size: 18px;
          }
          .row-excerpt {
            font-size: 14px;
          }
        }
      `}</style>
    </article>
  );
};

export default Post;
