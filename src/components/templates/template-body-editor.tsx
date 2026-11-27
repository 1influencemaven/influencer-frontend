"use client";

import Placeholder from "@tiptap/extension-placeholder";
import TextAlign from "@tiptap/extension-text-align";
import { EditorContent, useEditor, useEditorState, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Italic,
  Link2,
  List,
  ListOrdered,
  RemoveFormatting,
  Underline as UnderlineIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { TemplateVariable } from "@/components/templates/variable-node";
import { VariablePicker } from "@/components/templates/variable-picker";
import { cn } from "@/lib/utils";
import type { VariablesCatalog } from "@/types/templates";

function ToolbarButton({
  active,
  label,
  onClick,
  children,
}: {
  active?: boolean;
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={active}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className={cn(
        "grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground",
        active && "bg-primary/10 text-primary",
      )}
    >
      {children}
    </button>
  );
}

function LinkControl({ editor }: { editor: Editor }) {
  const t = useTranslations("Templates.editor.toolbar");
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");

  function apply() {
    const value = url.trim();
    if (!value) editor.chain().focus().extendMarkRange("link").unsetLink().run();
    else {
      const href = /^(https?:|mailto:)/i.test(value) ? value : `https://${value}`;
      editor.chain().focus().extendMarkRange("link").setLink({ href }).run();
    }
    setOpen(false);
  }

  return (
    <span className="relative">
      <ToolbarButton
        label={t("link")}
        active={editor.isActive("link")}
        onClick={() => {
          setUrl((editor.getAttributes("link").href as string | undefined) ?? "");
          setOpen((o) => !o);
        }}
      >
        <Link2 className="size-4" aria-hidden />
      </ToolbarButton>
      {open ? (
        <span className="absolute top-9 left-0 z-20 flex w-72 gap-1 rounded-md border border-border bg-popover p-2 shadow-md">
          <input
            autoFocus
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                apply();
              } else if (e.key === "Escape") setOpen(false);
            }}
            placeholder="https://"
            aria-label={t("linkUrl")}
            className="h-8 flex-1 rounded-md border border-input bg-card px-2 text-sm outline-none focus-visible:border-ring"
          />
          <button type="button" onClick={apply} className="rounded-md bg-primary px-2.5 text-xs font-medium text-primary-foreground">
            {t("linkApply")}
          </button>
        </span>
      ) : null}
    </span>
  );
}

/** Rich email body (HU-TPL-005 CA-03) with inline variable chips (HU-TPL-008 CA-04). */
export function TemplateBodyEditor({
  initialHtml,
  catalog,
  onChange,
  invalid,
}: {
  initialHtml: string;
  catalog: VariablesCatalog | undefined;
  onChange: (html: string) => void;
  invalid?: boolean;
}) {
  const t = useTranslations("Templates.editor");
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        codeBlock: false,
        code: false,
        horizontalRule: false,
        link: { openOnClick: false, autolink: true, protocols: ["https", "http", "mailto"] },
      }),
      TextAlign.configure({ types: ["paragraph", "heading"], alignments: ["left", "center", "right"] }),
      Placeholder.configure({ placeholder: t("bodyPlaceholder") }),
      TemplateVariable,
    ],
    content: initialHtml,
    editorProps: {
      attributes: {
        class: "prose-email min-h-64 px-4 py-3 text-sm leading-relaxed outline-none",
        "aria-label": t("body"),
      },
    },
    onUpdate: ({ editor: e }) => onChange(e.getHTML()),
  });

  const state = useEditorState({
    editor,
    selector: ({ editor: e }) =>
      e
        ? {
            bold: e.isActive("bold"),
            italic: e.isActive("italic"),
            underline: e.isActive("underline"),
            bullet: e.isActive("bulletList"),
            ordered: e.isActive("orderedList"),
            left: e.isActive({ textAlign: "left" }),
            center: e.isActive({ textAlign: "center" }),
            right: e.isActive({ textAlign: "right" }),
          }
        : null,
  });

  return (
    <div
      className={cn(
        "overflow-visible rounded-md border bg-card shadow-xs focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50",
        invalid ? "border-destructive" : "border-input",
      )}
    >
      {editor ? (
        <div className="flex flex-wrap items-center gap-0.5 border-b border-border px-2 py-1" role="toolbar" aria-label={t("toolbar.label")}>
          <ToolbarButton label={t("toolbar.bold")} active={state?.bold} onClick={() => editor.chain().focus().toggleBold().run()}>
            <Bold className="size-4" aria-hidden />
          </ToolbarButton>
          <ToolbarButton label={t("toolbar.italic")} active={state?.italic} onClick={() => editor.chain().focus().toggleItalic().run()}>
            <Italic className="size-4" aria-hidden />
          </ToolbarButton>
          <ToolbarButton label={t("toolbar.underline")} active={state?.underline} onClick={() => editor.chain().focus().toggleUnderline().run()}>
            <UnderlineIcon className="size-4" aria-hidden />
          </ToolbarButton>
          <span className="mx-1 h-5 w-px bg-border" aria-hidden />
          <ToolbarButton label={t("toolbar.bulletList")} active={state?.bullet} onClick={() => editor.chain().focus().toggleBulletList().run()}>
            <List className="size-4" aria-hidden />
          </ToolbarButton>
          <ToolbarButton label={t("toolbar.orderedList")} active={state?.ordered} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
            <ListOrdered className="size-4" aria-hidden />
          </ToolbarButton>
          <span className="mx-1 h-5 w-px bg-border" aria-hidden />
          <ToolbarButton label={t("toolbar.alignLeft")} active={state?.left} onClick={() => editor.chain().focus().setTextAlign("left").run()}>
            <AlignLeft className="size-4" aria-hidden />
          </ToolbarButton>
          <ToolbarButton label={t("toolbar.alignCenter")} active={state?.center} onClick={() => editor.chain().focus().setTextAlign("center").run()}>
            <AlignCenter className="size-4" aria-hidden />
          </ToolbarButton>
          <ToolbarButton label={t("toolbar.alignRight")} active={state?.right} onClick={() => editor.chain().focus().setTextAlign("right").run()}>
            <AlignRight className="size-4" aria-hidden />
          </ToolbarButton>
          <span className="mx-1 h-5 w-px bg-border" aria-hidden />
          <LinkControl editor={editor} />
          <ToolbarButton label={t("toolbar.clear")} onClick={() => editor.chain().focus().unsetAllMarks().unsetTextAlign().run()}>
            <RemoveFormatting className="size-4" aria-hidden />
          </ToolbarButton>
          <span className="ml-auto">
            <VariablePicker
              catalog={catalog}
              onSelect={(v) =>
                editor
                  .chain()
                  .focus()
                  .insertContent({ type: "templateVariable", attrs: { key: v.key, label: v.label } })
                  .run()
              }
            />
          </span>
        </div>
      ) : (
        <div className="h-10 border-b border-border" />
      )}
      <EditorContent editor={editor} />
    </div>
  );
}
