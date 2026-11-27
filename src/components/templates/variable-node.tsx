"use client";

import { mergeAttributes, Node } from "@tiptap/core";
import { NodeViewWrapper, ReactNodeViewRenderer, type ReactNodeViewProps } from "@tiptap/react";
import { createContext, useContext } from "react";

import { cn } from "@/lib/utils";

/** Labels and validation status per key, provided by the editor page. */
export const VariableChipContext = createContext<{
  labels: Map<string, string>;
  status: Map<string, "error" | "warning">;
}>({ labels: new Map(), status: new Map() });

function VariableChip({ node }: ReactNodeViewProps) {
  const { labels, status } = useContext(VariableChipContext);
  const key = String(node.attrs.key ?? "");
  const state = status.get(key);
  const label = labels.get(key) ?? (node.attrs.label as string | null) ?? key;
  return (
    <NodeViewWrapper
      as="span"
      className={cn(
        "mx-0.5 inline-flex items-center rounded-sm border px-1 py-px align-baseline text-[0.85em] font-medium whitespace-nowrap",
        state === "error"
          ? "border-destructive/40 bg-destructive/10 text-destructive"
          : state === "warning"
            ? "border-amber-400/50 bg-amber-50 text-amber-900 dark:bg-amber-400/10 dark:text-amber-400"
            : "border-primary/20 bg-primary/10 text-primary",
      )}
      title={`{{${key}}}`}
      data-variable-chip={key}
    >
      {label}
    </NodeViewWrapper>
  );
}

/**
 * Inline atomic variable (HU-TPL-008 CA-04/05/06). Stored as
 * `<span data-type="template-variable" data-variable-key="key">{{key}}</span>`
 * so the stable key, not the visible label, is persisted.
 */
export const TemplateVariable = Node.create({
  name: "templateVariable",
  group: "inline",
  inline: true,
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      key: { default: null, parseHTML: (el) => el.getAttribute("data-variable-key") },
      label: { default: null, parseHTML: (el) => el.getAttribute("data-label") },
    };
  },

  parseHTML() {
    return [{ tag: "span[data-variable-key]" }];
  },

  renderHTML({ node, HTMLAttributes }) {
    const key = String(node.attrs.key ?? "");
    return [
      "span",
      mergeAttributes(
        { "data-type": "template-variable", "data-variable-key": key },
        node.attrs.label ? { "data-label": String(node.attrs.label) } : {},
        // Keep only our attributes (no ids/classes from pasted content).
        Object.fromEntries(Object.entries(HTMLAttributes).filter(([k]) => k.startsWith("data-variable"))),
      ),
      `{{${key}}}`,
    ];
  },

  renderText({ node }) {
    return `{{${String(node.attrs.key ?? "")}}}`;
  },

  addNodeView() {
    return ReactNodeViewRenderer(VariableChip, { as: "span" });
  },
});
