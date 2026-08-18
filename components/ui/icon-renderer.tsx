import React from "react";
import * as Icons from "lucide-react";

interface IconRendererProps {
  name?: string;
  className?: string;
  size?: number;
}

export function IconRenderer({ name, className, size = 18 }: IconRendererProps) {
  if (!name) {
    return <Icons.Code2 className={className} size={size} />;
  }

  // Look up icon from lucide-react
  const IconComponent = (Icons as any)[name] || Icons.Code2;
  return <IconComponent className={className} size={size} />;
}
