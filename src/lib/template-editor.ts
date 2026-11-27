import type { VariableDefinition, VariableIssue } from "@/types/templates";

/** Inserts `token` replacing the current selection; returns the new value and caret position. */
export function insertAtCursor(value: string, start: number | null, end: number | null, token: string) {
  const from = start ?? value.length;
  const to = end ?? from;
  const next = value.slice(0, from) + token + value.slice(to);
  return { value: next, caret: from + token.length };
}

/** True when the editor HTML has no visible text and no variable chips. */
export function isEmptyEditorHtml(html: string): boolean {
  if (/data-variable-key=/.test(html)) return false;
  return html.replace(/<[^>]*>/g, "").replace(/&nbsp;/g, " ").trim() === "";
}

/** Status per variable key for chip styling: error wins over warning. */
export function issueStatusByKey(issues: VariableIssue[]): Map<string, "error" | "warning"> {
  const map = new Map<string, "error" | "warning">();
  for (const issue of issues) {
    if (!issue.key) continue;
    if (issue.severity === "error" || !map.has(issue.key)) map.set(issue.key, issue.severity);
  }
  return map;
}

/** Filters a catalog by label/key (case and accent insensitive). */
export function filterVariables(variables: VariableDefinition[], query: string): VariableDefinition[] {
  const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const q = norm(query.trim());
  if (!q) return variables;
  return variables.filter((v) => norm(v.label).includes(q) || norm(v.key).includes(q));
}
