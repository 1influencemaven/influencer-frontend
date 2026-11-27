import { filterVariables, insertAtCursor, isEmptyEditorHtml, issueStatusByKey } from "@/lib/template-editor";
import type { VariableDefinition } from "@/types/templates";

describe("template editor utils", () => {
  it("inserts a token at the cursor or replaces the selection", () => {
    expect(insertAtCursor("Hola , ¿cómo estás?", 5, 5, "{{firstName}}")).toEqual({ value: "Hola {{firstName}}, ¿cómo estás?", caret: 18 });
    expect(insertAtCursor("Hola NOMBRE", 5, 11, "{{firstName}}")).toEqual({ value: "Hola {{firstName}}", caret: 18 });
    expect(insertAtCursor("Hola", null, null, " {{company}}")).toEqual({ value: "Hola {{company}}", caret: 16 });
  });

  it("detects empty editor content but keeps bodies with only variables", () => {
    expect(isEmptyEditorHtml("<p></p>")).toBe(true);
    expect(isEmptyEditorHtml("<p>&nbsp;</p>")).toBe(true);
    expect(isEmptyEditorHtml('<p><span data-variable-key="firstName">{{firstName}}</span></p>')).toBe(false);
    expect(isEmptyEditorHtml("<p>Hola</p>")).toBe(false);
  });

  it("maps issue severity per key (error wins)", () => {
    const map = issueStatusByKey([
      { code: "FIELD_DISABLED", severity: "warning", key: "old", raw: "{{old}}", location: "body" },
      { code: "UNKNOWN_VARIABLE", severity: "error", key: "x", raw: "{{x}}", location: "subject" },
      { code: "FIELD_DISABLED", severity: "warning", key: "x", raw: "{{x}}", location: "body" },
      { code: "MALFORMED_TOKEN", severity: "error", key: null, raw: "{{", location: "body" },
    ]);
    expect(Object.fromEntries(map)).toEqual({ old: "warning", x: "error" });
  });

  it("filters variables by label or key ignoring accents", () => {
    const vars = [
      { key: "influencer.country", label: "País", token: "", source: "influencer" },
      { key: "company", label: "Company", token: "", source: "prospect" },
    ] as VariableDefinition[];
    expect(filterVariables(vars, "pais").map((v) => v.key)).toEqual(["influencer.country"]);
    expect(filterVariables(vars, "COMP").map((v) => v.key)).toEqual(["company"]);
    expect(filterVariables(vars, " ")).toHaveLength(2);
  });
});
