/**
 * @jest-environment jsdom
 */
import { generateHTML, generateJSON } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";

import { TemplateVariable } from "@/components/templates/variable-node";

const extensions = [StarterKit, TemplateVariable];

describe("TemplateVariable node", () => {
  it("persists the stable key (not the label) and round-trips saved HTML", () => {
    const saved =
      '<p>Hola <span data-type="template-variable" data-variable-key="firstName" data-label="First Name">{{firstName}}</span>!</p>';
    const json = generateJSON(saved, extensions);
    const node = json.content[0].content[1];
    expect(node).toEqual({ type: "templateVariable", attrs: { key: "firstName", label: "First Name" } });
    const html = generateHTML(json, extensions);
    expect(html).toContain('data-variable-key="firstName"');
    expect(html).toContain(">{{firstName}}</span>");
  });

  it("drops foreign attributes from pasted chips", () => {
    const html = generateHTML(
      generateJSON('<p><span data-variable-key="company" class="evil" onclick="x()">Company</span></p>', extensions),
      extensions,
    );
    expect(html).toBe('<p><span data-type="template-variable" data-variable-key="company">{{company}}</span></p>');
  });
});
