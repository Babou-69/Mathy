import React from "react";
import { InlineMath, BlockMath } from "react-katex";

function MethodeContent({ text }) {
  if (!text) return null;

  // Sépare les blocs $$...$$
  const parts = text.split(/(\$\$[\s\S]*?\$\$)/g);

  return (
    <div style={{ whiteSpace: "pre-line", lineHeight: "1.6" }}>
      {parts.map((part, i) => {
        // Bloc math centré
        if (part.startsWith("$$")) {
          return (
            <BlockMath key={i}>
              {part.replace(/\$\$/g, "")}
            </BlockMath>
          );
        }

        // Inline math $...$
        const inlineParts = part.split(/(\$[^$]+\$)/g);

        return inlineParts.map((sub, j) => {
          if (sub.startsWith("$")) {
            return (
              <InlineMath key={`${i}-${j}`}>
                {sub.replace(/\$/g, "")}
              </InlineMath>
            );
          }
          return <span key={`${i}-${j}`}>{sub}</span>;
        });
      })}
    </div>
  );
}

export default MethodeContent;
