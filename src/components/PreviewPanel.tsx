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

// Split markdown into sections at ## boundaries.
// The first chunk (before any ## heading) becomes the intro/description section.
function splitSections(md: string): { label: string; md: string }[] {
  const stripped = md.replace(/<!--[\s\S]*?-->/g, '').trim()
  const parts = stripped.split(/^(## .+)$/m)
  const sections: { label: string; md: string }[] = []

  if (parts[0].trim()) {
    sections.push({ label: 'Description', md: parts[0].trim() })
  }
  for (let i = 1; i < parts.length; i += 2) {
    const heading = parts[i]
    const body = parts[i + 1] ?? ''
    sections.push({ label: heading.slice(3).trim(), md: (heading + '\n' + body).trim() })
  }
  return sections
}

async function copyHtml(htmlStr: string) {
  try {
    const blob = new Blob([htmlStr], { type: 'text/html' })
    await navigator.clipboard.write([new ClipboardItem({ 'text/html': blob })])
  } catch {
    await navigator.clipboard.writeText(htmlStr)
  }
}

function SectionCard({ label, md }: { label: string; md: string }) {
  const [copied, setCopied] = useState(false)
  const html = useMemo(() => marked.parse(md) as string, [md])

  async function handleCopy() {
    await copyHtml(html)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mb-3">
      <div className="flex items-center justify-between px-1 mb-1">
        <span className="font-rajdhani text-xs text-slate uppercase tracking-wider">{label}</span>
        <button
          className="font-rajdhani text-xs px-2 py-0.5 rounded transition-colors"
          style={{ background: copied ? '#3d2b63' : 'transparent', color: copied ? '#b46ef5' : '#4a4260', border: '1px solid #2a1d42' }}
          onClick={handleCopy}
        >
          {copied ? '✓ Copied' : 'Copy'}
        </button>
      </div>
      <div className="printables-card">
        <div className="md-preview" dangerouslySetInnerHTML={{ __html: html }} />
      </div>
    </div>
  )
}

export default function PreviewPanel({ data }: Props) {
  const [copiedMd, setCopiedMd] = useState(false)

  const markdown = useMemo(() => generateMarkdown(data), [data])
  const sections = useMemo(() => splitSections(markdown), [markdown])

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
        <button
          className="btn-ghost text-xs py-1.5 px-3"
          onClick={handleCopyMd}
          title="Copy raw markdown"
        >
          {copiedMd ? '✓ Copied!' : 'Copy Markdown'}
        </button>
      </div>

      {/* Per-section preview cards */}
      <style>{previewStyles}</style>
      <div className="printables-page flex-1 overflow-y-auto">
        {sections.map(s => (
          <SectionCard key={s.label} label={s.label} md={s.md} />
        ))}
      </div>
    </div>
  )
}
