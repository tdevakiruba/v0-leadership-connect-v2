"use client"

import ReactMarkdown from "react-markdown"
import remarkBreaks from "remark-breaks"
import { cn } from "@/lib/utils"

interface MarkdownContentProps {
  content: string
  className?: string
  /** When true, renders inline-only (no wrapping <p> or block elements) */
  inline?: boolean
}

export function MarkdownContent({ content, className, inline = false }: MarkdownContentProps) {
  if (inline) {
    return (
      <ReactMarkdown
        remarkPlugins={[remarkBreaks]}
        components={{
          p: ({ children }) => <>{children}</>,
          strong: ({ children }) => (
            <strong className="font-semibold">{children}</strong>
          ),
          em: ({ children }) => <em className="italic">{children}</em>,
          a: ({ href, children }) => (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline underline-offset-2 hover:opacity-80"
            >
              {children}
            </a>
          ),
          code: ({ children }) => (
            <code className="bg-muted px-1 py-0.5 rounded text-sm font-mono">
              {children}
            </code>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    )
  }

  return (
    <ReactMarkdown
      remarkPlugins={[remarkBreaks]}
      className={cn("prose max-w-none leading-relaxed", className)}
    >
      {content}
    </ReactMarkdown>
  )
}
