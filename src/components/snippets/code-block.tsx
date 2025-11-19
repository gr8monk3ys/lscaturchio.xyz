"use client"

interface CodeBlockProps {
  code: string
  language: string
}

export function CodeBlock({ code, language }: CodeBlockProps) {
  return (
    <div className="relative">
      <div className="absolute top-2 right-2 px-2 py-1 rounded text-xs font-mono bg-black/50 text-white">
        {language}
      </div>
      <pre className="overflow-x-auto p-4 rounded-md bg-gray-950 dark:bg-gray-900 text-gray-100">
        <code className={`language-${language} text-sm`}>{code}</code>
      </pre>
    </div>
  )
}
