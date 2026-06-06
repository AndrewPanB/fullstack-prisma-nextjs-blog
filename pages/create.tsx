import React, { useState, useRef, useCallback, useEffect } from "react";
import Layout from "../components/Layout";
import Router, { useRouter } from "next/router";
import ReactMarkdown from "react-markdown";

/* ---- Markdown 插入辅助函数 ---- */
function insertAtCursor(
  textarea: HTMLTextAreaElement,
  before: string,
  after: string = "",
  placeholder: string = "text"
) {
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const selected = textarea.value.substring(start, end) || placeholder;
  const newText =
    textarea.value.substring(0, start) +
    before +
    selected +
    after +
    textarea.value.substring(end);
  textarea.value = newText;
  // 触发 React onChange
  const event = new Event("input", { bubbles: true }) as any;
  Object.defineProperty(event, "target", { value: { value: newText } });
  textarea.dispatchEvent(event);
  // 恢复焦点
  textarea.focus();
  const newCursor = start + before.length + selected.length + after.length;
  textarea.setSelectionRange(
    selected === placeholder ? start + before.length : newCursor,
    selected === placeholder ? start + before.length + placeholder.length : newCursor
  );
}

const toolbarActions = [
  { label: "B", title: "Bold", before: "**", after: "**", placeholder: "bold" },
  { label: "I", title: "Italic", before: "*", after: "*", placeholder: "italic" },
  { label: "H2", title: "Heading", before: "\n## ", after: "", placeholder: "Heading" },
  { label: "H3", title: "Subheading", before: "\n### ", after: "", placeholder: "Subheading" },
  { label: ">", title: "Blockquote", before: "\n> ", after: "", placeholder: "quote" },
  { label: "•", title: "Bullet List", before: "\n- ", after: "", placeholder: "list item" },
  { label: "1.", title: "Numbered List", before: "\n1. ", after: "", placeholder: "list item" },
  { label: "`", title: "Inline Code", before: "`", after: "`", placeholder: "code" },
  { label: "```", title: "Code Block", before: "\n```\n", after: "\n```\n", placeholder: "code" },
  { label: "🔗", title: "Link", before: "[", after: "](url)", placeholder: "link text" },
  { label: "—", title: "Horizontal Rule", before: "\n\n---\n\n", after: "", placeholder: "" },
];

const Draft: React.FC = () => {
  const router = useRouter();
  const editId = router.query.edit as string | undefined;
  const isEditing = Boolean(editId);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tab, setTab] = useState<"write" | "preview">("write");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 加载待编辑文章数据
  useEffect(() => {
    if (!editId) return;
    setIsLoading(true);
    fetch(`/api/post/${editId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load post");
        return res.json();
      })
      .then((post) => {
        setTitle(post.title || "");
        setContent(post.content || "");
      })
      .catch((err) => {
        console.error(err);
        alert("Failed to load post for editing.");
      })
      .finally(() => setIsLoading(false));
  }, [editId]);

  const handleToolbar = useCallback((action: typeof toolbarActions[0]) => {
    const ta = textareaRef.current;
    if (!ta) return;
    if (action.placeholder === "") {
      const newText = ta.value + action.before;
      ta.value = newText;
      const event = new Event("input", { bubbles: true }) as any;
      Object.defineProperty(event, "target", { value: { value: newText } });
      ta.dispatchEvent(event);
      ta.focus();
    } else {
      insertAtCursor(ta, action.before, action.after, action.placeholder);
    }
  }, []);

  const submitData = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const body = { title, content };
      const url = isEditing ? `/api/post/${editId}` : `/api/post`;
      const method = isEditing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json();
        alert("Failed: " + (err.message || res.statusText));
        setIsSubmitting(false);
        return;
      }
      await Router.push(isEditing ? `/p/${editId}` : "/drafts");
    } catch (error) {
      console.error(error);
      setIsSubmitting(false);
    }
  };

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;
  const charCount = content.length;

  return (
    <Layout>
      <div className="create-page">
        <div className="create-header">
          <h1 className="create-title">
            {isEditing ? "Edit Post" : "Create New Draft"}
          </h1>
          <p className="create-subtitle">
            {isEditing
              ? "Update your post. Changes will be saved immediately."
              : "Write in Markdown. Preview in real time. Publish when ready."}
          </p>
        </div>

        {isLoading ? (
          <div className="loading-card">
            <div className="loading-spinner" />
            <p>Loading post...</p>
          </div>
        ) : (
        <form onSubmit={submitData} className="create-form">
          {/* Title */}
          <div className="form-group">
            <label className="form-label" htmlFor="title">Title</label>
            <input
              id="title"
              autoFocus
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Give your post a compelling title..."
              type="text"
              value={title}
              className="form-input"
            />
          </div>

          {/* Editor Tabs */}
          <div className="editor-header">
            <div className="editor-tabs">
              <button
                type="button"
                className={`editor-tab ${tab === "write" ? "is-active" : ""}`}
                onClick={() => setTab("write")}
              >
                Write
              </button>
              <button
                type="button"
                className={`editor-tab ${tab === "preview" ? "is-active" : ""}`}
                onClick={() => setTab("preview")}
              >
                Preview
              </button>
            </div>
            <div className="editor-stats">
              {charCount}c / {wordCount}w / ~{Math.max(1, Math.ceil(wordCount / 200))}min
            </div>
          </div>

          {/* Toolbar (only in write mode) */}
          {tab === "write" && (
            <div className="toolbar">
              {toolbarActions.map((action) => (
                <button
                  key={action.title}
                  type="button"
                  className="toolbar-btn"
                  title={action.title}
                  onClick={() => handleToolbar(action)}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}

          {/* Editor / Preview */}
          <div className="editor-body">
            {tab === "write" ? (
              <textarea
                ref={textareaRef}
                id="content"
                onChange={(e) => setContent(e.target.value)}
                placeholder={`Start writing your story here...

## Tips
- **Bold** and *italic* text
- \`inline code\` and code blocks
- [Links](https://example.com) and images
- > Blockquotes
- --- Horizontal rules`}
                value={content}
                className="form-textarea"
              />
            ) : (
              <div className="preview-pane markdown-body">
                {content.trim() ? (
                  <ReactMarkdown>{content}</ReactMarkdown>
                ) : (
                  <p className="preview-empty">Nothing to preview yet. Start writing in the editor.</p>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="form-actions">
            <button
              type="submit"
              disabled={!content || !title || isSubmitting}
              className="btn-submit"
            >
              {isSubmitting ? (
                <>
                  <span className="spinner" />
                  Saving...
                </>
              ) : isEditing ? (
                "Save Changes"
              ) : (
                "Save as Draft"
              )}
            </button>
            <button
              type="button"
              onClick={() => Router.push("/")}
              className="btn-cancel"
            >
              Cancel
            </button>
          </div>
        </form>
        )}
      </div>

      <style jsx>{`
        .create-page {
          max-width: 780px;
          margin: 0 auto;
          animation: fadeIn 0.4s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .loading-card {
          background: #fff;
          border: 1px solid #e8e8e8;
          border-radius: 10px;
          padding: 4rem 2rem;
          text-align: center;
          color: #999;
        }
        .loading-spinner {
          width: 32px;
          height: 32px;
          border: 3px solid #e8e8e8;
          border-top-color: #111;
          border-radius: 50%;
          animation: spin 0.7s linear infinite;
          margin: 0 auto 14px;
        }

        .create-header {
          margin-bottom: 1.5rem;
        }
        .create-title {
          font-size: 28px;
          font-weight: 800;
          color: #111;
          letter-spacing: -0.02em;
          margin-bottom: 4px;
        }
        .create-subtitle {
          font-size: 15px;
          color: #777;
        }

        .create-form {
          background: #fff;
          border: 1px solid #e8e8e8;
          border-radius: 10px;
          overflow: hidden;
        }

        /* ---- Title input ---- */
        .form-group {
          padding: 20px 22px 0;
        }
        .form-label {
          display: block;
          font-size: 13px;
          font-weight: 600;
          color: #888;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 8px;
        }
        .form-input {
          width: 100%;
          padding: 0;
          font-size: 20px;
          font-weight: 700;
          border: none;
          outline: none;
          color: #111;
          background: transparent;
          line-height: 1.4;
        }
        .form-input::placeholder { color: #ccc; }

        /* ---- Editor header ---- */
        .editor-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 22px 0;
        }
        .editor-tabs {
          display: flex;
          gap: 4px;
        }
        .editor-tab {
          padding: 6px 14px;
          font-size: 13px;
          font-weight: 600;
          color: #999;
          background: none;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
        }
        .editor-tab:hover { background: #f5f5f5; color: #555; }
        .editor-tab.is-active { background: #111; color: #fff; }

        .editor-stats {
          font-size: 12px;
          color: #bbb;
        }

        /* ---- Toolbar ---- */
        .toolbar {
          display: flex;
          flex-wrap: wrap;
          gap: 2px;
          padding: 10px 22px;
          border-top: 1px solid #f0f0f0;
          border-bottom: 1px solid #f0f0f0;
          background: #fafafa;
        }
        .toolbar-btn {
          height: 28px;
          min-width: 28px;
          padding: 0 8px;
          font-size: 13px;
          font-weight: 600;
          color: #666;
          background: none;
          border: 1px solid transparent;
          border-radius: 4px;
          cursor: pointer;
          transition: background 0.1s, border-color 0.1s, color 0.1s;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .toolbar-btn:hover {
          background: #fff;
          border-color: #ddd;
          color: #111;
        }

        /* ---- Editor body ---- */
        .editor-body {
          min-height: 320px;
        }

        .form-textarea {
          display: block;
          width: 100%;
          min-height: 360px;
          padding: 18px 22px;
          font-size: 15px;
          font-family: "SF Mono", "Fira Code", "Cascadia Code", Consolas, monospace;
          line-height: 1.7;
          border: none;
          outline: none;
          resize: vertical;
          background: #fff;
          color: #222;
        }
        .form-textarea::placeholder { color: #bbb; }

        .preview-pane {
          min-height: 360px;
          padding: 24px 28px;
          background: #fff;
        }
        .preview-empty {
          color: #bbb;
          font-style: italic;
          text-align: center;
          padding-top: 80px;
        }

        /* ---- Actions ---- */
        .form-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 16px 22px;
          border-top: 1px solid #f0f0f0;
        }
        .btn-submit {
          height: 38px;
          padding: 0 20px;
          border-radius: 8px;
          background: #111;
          color: #fff;
          border: none;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.15s;
          display: inline-flex;
          align-items: center;
          gap: 6px;
        }
        .btn-submit:hover:not(:disabled) { background: #333; }
        .btn-submit:disabled { opacity: 0.4; cursor: not-allowed; }

        .spinner {
          width: 14px;
          height: 14px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .btn-cancel {
          height: 38px;
          padding: 0 16px;
          border-radius: 8px;
          background: none;
          color: #888;
          border: 1.5px solid #e0e0e0;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.15s, color 0.15s;
        }
        .btn-cancel:hover { background: #f5f5f5; color: #111; }

        @media (max-width: 640px) {
          .form-group { padding: 14px 16px 0; }
          .editor-header { padding: 12px 16px 0; }
          .toolbar { padding: 8px 16px; }
          .form-textarea { padding: 14px 16px; font-size: 14px; }
          .preview-pane { padding: 18px 20px; }
          .form-actions { padding: 12px 16px; flex-direction: column; }
          .btn-submit, .btn-cancel { width: 100%; justify-content: center; }
          .form-input { font-size: 18px; }
          .create-title { font-size: 22px; }
        }
      `}</style>
    </Layout>
  );
};

export default Draft;
