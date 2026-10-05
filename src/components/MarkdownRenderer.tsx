import React from "react";

interface MarkdownRendererProps {
  content: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content }) => {
  if (!content) return null;

  const lines = content.split("\n");

  const renderFormattedText = (text: string) => {
    // Process **bold** and *italic* and `code`
    const parts: React.ReactNode[] = [];
    let remaining = text;
    let keyIdx = 0;

    // Regular expression to match **bold**, *italic*, `code`, and [link](url)
    const regex = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
    let match: RegExpExecArray | null;
    let lastIndex = 0;

    while ((match = regex.exec(text)) !== null) {
      if (match.index > lastIndex) {
        parts.push(text.substring(lastIndex, match.index));
      }
      const token = match[0];
      if (token.startsWith("**") && token.endsWith("**")) {
        parts.push(
          <strong key={keyIdx++} className="font-semibold text-slate-900">
            {token.slice(2, -2)}
          </strong>
        );
      } else if (token.startsWith("*") && token.endsWith("*")) {
        parts.push(
          <em key={keyIdx++} className="italic text-slate-800">
            {token.slice(1, -1)}
          </em>
        );
      } else if (token.startsWith("`") && token.endsWith("`")) {
        parts.push(
          <code
            key={keyIdx++}
            className="px-1.5 py-0.5 bg-slate-100 text-indigo-700 rounded font-mono text-xs"
          >
            {token.slice(1, -1)}
          </code>
        );
      }
      lastIndex = regex.lastIndex;
    }

    if (lastIndex < text.length) {
      parts.push(text.substring(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  return (
    <div className="space-y-2 text-slate-800 text-sm leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();

        if (!trimmed) {
          return <div key={idx} className="h-2" />;
        }

        // H1 Heading
        if (trimmed.startsWith("# ")) {
          return (
            <h1
              key={idx}
              className="text-lg md:text-xl font-black text-slate-900 pt-3 pb-1 border-b border-slate-200"
            >
              {renderFormattedText(trimmed.replace(/^#\s+/, ""))}
            </h1>
          );
        }

        // H2 Heading
        if (trimmed.startsWith("## ")) {
          return (
            <h2
              key={idx}
              className="text-base md:text-lg font-bold text-indigo-900 pt-3 pb-1 flex items-center gap-2"
            >
              <span className="w-1.5 h-4 bg-indigo-600 rounded-full inline-block" />
              {renderFormattedText(trimmed.replace(/^##\s+/, ""))}
            </h2>
          );
        }

        // H3 Heading
        if (trimmed.startsWith("### ")) {
          return (
            <h3
              key={idx}
              className="text-sm md:text-base font-bold text-slate-800 pt-2 pb-0.5"
            >
              {renderFormattedText(trimmed.replace(/^###\s+/, ""))}
            </h3>
          );
        }

        // Bullet list item
        if (trimmed.startsWith("* ") || trimmed.startsWith("- ")) {
          const itemText = trimmed.replace(/^(\*|-)\s+/, "");
          return (
            <div key={idx} className="flex items-start gap-2.5 pl-2 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-2 shrink-0" />
              <div className="flex-1 text-slate-700">
                {renderFormattedText(itemText)}
              </div>
            </div>
          );
        }

        // Numbered list item (e.g. 1. 2. 3.)
        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start gap-2 pl-2 py-0.5">
              <span className="font-bold text-xs text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded shrink-0">
                {numMatch[1]}
              </span>
              <div className="flex-1 text-slate-700">
                {renderFormattedText(numMatch[2])}
              </div>
            </div>
          );
        }

        // Standard paragraph
        return (
          <p key={idx} className="text-slate-700">
            {renderFormattedText(line)}
          </p>
        );
      })}
    </div>
  );
};
