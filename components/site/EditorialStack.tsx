"use client";

import type { ReactNode } from "react";

type EditorialStackProps = {
  children: ReactNode[];
  className?: string;
};

export default function EditorialStack({
  children,
  className = "",
}: EditorialStackProps) {
  return (
    <div className={`relative ${className}`}>
      {children.map((child, index) => (
        <div
          key={index}
          className="sticky mb-8 md:mb-12"
          style={{
            top: `${96 + Math.min(index, 5) * 14}px`,
            zIndex: index + 1,
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
}
