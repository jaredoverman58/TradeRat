'use client'

import { useEffect, useState } from 'react'
import DOMPurify from 'dompurify'

interface SafeHtmlRendererProps {
  html: string
  style?: React.CSSProperties
}

export default function SafeHtmlRenderer({ html, style }: SafeHtmlRendererProps) {
  const [sanitizedHtml, setSanitizedHtml] = useState('')

  useEffect(() => {
    // Sanitize HTML on client side
    const clean = DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [
        'p', 'br', 'strong', 'em', 'b', 'i', 'u',
        'ul', 'ol', 'li',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'blockquote', 'code', 'pre'
      ],
      ALLOWED_ATTR: []
    })
    setSanitizedHtml(clean)
  }, [html])

  return (
    <>
      <div
        className="safe-html-content"
        style={style}
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />

      {/* Styling for rendered HTML content */}
      <style jsx global>{`
        .safe-html-content p {
          margin: 0 0 1em 0;
        }
        .safe-html-content p:last-child {
          margin-bottom: 0;
        }
        .safe-html-content strong,
        .safe-html-content b {
          font-weight: 700;
        }
        .safe-html-content em,
        .safe-html-content i {
          font-style: italic;
        }
        .safe-html-content ul,
        .safe-html-content ol {
          padding-left: 2rem;
          margin: 1em 0;
        }
        .safe-html-content ul {
          list-style-type: disc;
        }
        .safe-html-content ol {
          list-style-type: decimal;
        }
        .safe-html-content li {
          margin-bottom: 0.5em;
        }
        .safe-html-content li p {
          margin: 0;
        }
        .safe-html-content h1,
        .safe-html-content h2,
        .safe-html-content h3,
        .safe-html-content h4,
        .safe-html-content h5,
        .safe-html-content h6 {
          font-family: var(--font-playfair);
          font-weight: 700;
          margin: 1.5em 0 0.5em 0;
        }
        .safe-html-content h1 { font-size: 2em; }
        .safe-html-content h2 { font-size: 1.5em; }
        .safe-html-content h3 { font-size: 1.25em; }
        .safe-html-content h4 { font-size: 1.1em; }
        .safe-html-content h5 { font-size: 1em; }
        .safe-html-content h6 { font-size: 0.9em; }
        .safe-html-content blockquote {
          border-left: 3px solid #C9A84C;
          padding-left: 1em;
          margin: 1em 0;
          font-style: italic;
        }
        .safe-html-content code {
          background-color: #1a1710;
          padding: 0.2em 0.4em;
          border-radius: 3px;
          font-family: monospace;
          font-size: 0.9em;
        }
        .safe-html-content pre {
          background-color: #1a1710;
          padding: 1em;
          border-radius: 5px;
          overflow-x: auto;
          margin: 1em 0;
        }
        .safe-html-content pre code {
          background-color: transparent;
          padding: 0;
        }
      `}</style>
    </>
  )
}
