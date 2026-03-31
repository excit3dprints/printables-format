import { useState, useMemo } from 'react'
import { marked } from 'marked'
import type { ModelData } from '../types'
import { generateMarkdown } from '../generateMarkdown'

interface Props {
  data: ModelData
}

// Styles that replicate Printables.com's description rendering:
// white card on light-gray page background, Roboto, dark text, orange links.
const previewStyles = `
  .printables-page {
    background: #f5f5f5;
    min-height: 100%;
    padding: 24px 16px;
    box-sizing: border-box;
  }
  .printables-card {
    background: #ffffff;
    border-radius: 4px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.08);
    padding: 24px 28px;
    max-width: 860px;
    margin: 0 auto;
  }
  .md-preview {
    font-family: 'Roboto', 'Segoe UI', Arial, sans-serif;
    font-size: 14px;
    line-height: 1.65;
    color: #212121;
    word-break: break-word;
  }
  .md-preview h1 {
    font-size: 22px;
    font-weight: 700;
    color: #212121;
    margin: 0 0 16px 0;
    line-height: 1.3;
  }
  .md-preview h2 {
    font-size: 17px;
    font-weight: 700;
    color: #212121;
    margin: 24px 0 10px 0;
    padding-bottom: 6px;
    border-bottom: 1px solid #e0e0e0;
    line-height: 1.3;
  }
  .md-preview h3 {
    font-size: 15px;
    font-weight: 700;
    color: #212121;
    margin: 18px 0 8px 0;
    line-height: 1.3;
  }
  .md-preview h4 {
    font-size: 14px;
    font-weight: 700;
    color: #424242;
    margin: 14px 0 6px 0;
  }
  .md-preview p {
    margin: 8px 0;
  }
  .md-preview a {
    color: #fa6831;
    text-decoration: none;
  }
  .md-preview a:hover {
    text-decoration: underline;
  }
  .md-preview hr {
    border: none;
    border-top: 1px solid #e0e0e0;
    margin: 20px 0;
  }
  .md-preview table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
    margin: 12px 0;
    border: 1px solid #e0e0e0;
  }
  .md-preview th {
    background: #f5f5f5;
    color: #424242;
    font-weight: 700;
    text-align: left;
    padding: 8px 12px;
    border: 1px solid #e0e0e0;
    font-size: 13px;
  }
  .md-preview td {
    padding: 7px 12px;
    border: 1px solid #e0e0e0;
    color: #212121;
    vertical-align: top;
  }
  .md-preview tr:nth-child(even) td {
    background: #fafafa;
  }
  .md-preview code {
    font-family: 'Roboto Mono', 'Consolas', 'Courier New', monospace;
    font-size: 12.5px;
    background: #f5f5f5;
    color: #d32f2f;
    padding: 1px 5px;
    border-radius: 3px;
    border: 1px solid #e0e0e0;
  }
  .md-preview pre {
    background: #f5f5f5;
    border: 1px solid #e0e0e0;
    border-radius: 4px;
    padding: 14px 16px;
    overflow-x: auto;
    margin: 12px 0;
  }
  .md-preview pre code {
    background: none;
    border: none;
    padding: 0;
    color: #212121;
    font-size: 13px;
  }
  .md-preview blockquote {
    border-left: 3px solid #bdbdbd;
    padding: 4px 0 4px 14px;
    margin: 10px 0;
    color: #616161;
  }
  .md-preview ul, .md-preview ol {
    padding-left: 24px;
    margin: 8px 0;
  }
  .md-preview li {
    margin: 4px 0;
  }
  .md-preview strong {
    font-weight: 700;
    color: #212121;
  }
  .md-preview em {
    font-style: italic;
  }
`

export default function PreviewPanel({ data }: Props) {
  const [copiedRich, setCopiedRich] = useState(false)
  const [copiedMd,   setCopiedMd]   = useState(false)

  const markdown = useMemo(() => generateMarkdown(data), [data])

  const html = useMemo(() => {
    const cleaned = markdown.replace(/<!--[\s\S]*?-->/g, '')
    return marked.parse(cleaned) as string
  }, [markdown])

  // Copy rendered HTML — pastes as formatted text in Printables' rich text editor
  async function handleCopyRich() {
    try {
      const blob = new Blob([html], { type: 'text/html' })
      await navigator.clipboard.write([new ClipboardItem({ 'text/html': blob })])
      setCopiedRich(true)
      setTimeout(() => setCopiedRich(false), 2000)
    } catch {
      // ClipboardItem not supported — fall back to plain HTML string
      await navigator.clipboard.writeText(html)
      setCopiedRich(true)
      setTimeout(() => setCopiedRich(false), 2000)
    }
  }

  // Copy raw markdown for reference / version control
  function handleCopyMd() {
    navigator.clipboard.writeText(markdown).then(() => {
      setCopiedMd(true)
      setTimeout(() => setCopiedMd(false), 2000)
    })
  }

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 py-3 bg-deep border-b border-shadow">
        <span className="text-ash text-xs font-rajdhani uppercase tracking-wider">
          Printables Preview
        </span>
        <div className="flex items-center gap-2">
          <button
            className="btn-ghost text-xs py-1.5 px-3"
            onClick={handleCopyMd}
            title="Copy raw markdown (for version control / backup)"
          >
            {copiedMd ? '✓ Copied!' : 'Copy Markdown'}
          </button>
          <button
            className="btn-primary text-sm py-1.5 px-3"
            onClick={handleCopyRich}
            title="Copy formatted text — paste directly into Printables description editor"
          >
            {copiedRich ? '✓ Copied!' : 'Copy for Printables'}
          </button>
        </div>
      </div>

      {/* Preview content — styled to match Printables.com */}
      <style>{previewStyles}</style>
      <div className="printables-page flex-1 overflow-y-auto">
        <div className="printables-card">
          <div
            className="md-preview"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
      </div>
    </div>
  )
}
