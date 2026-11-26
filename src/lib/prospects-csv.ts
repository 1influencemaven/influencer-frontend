import { parseCsv } from "@/lib/email-accounts-csv";

export { parseCsv };

const strip = (value: string) =>
  value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

/** Common Spanish/English headers → Saleshandy system field keys. */
const SYNONYMS: Record<string, string> = {
  email: "email", correo: "email", correoelectronico: "email", mail: "email", emailaddress: "email",
  firstname: "firstName", nombre: "firstName", name: "firstName", primernombre: "firstName",
  lastname: "lastName", apellido: "lastName", apellidos: "lastName", surname: "lastName",
  company: "company", empresa: "company", compania: "company", marca: "company", brand: "company", organization: "company",
  companydomain: "companyDomain", dominio: "companyDomain", domain: "companyDomain",
  website: "website", web: "website", sitioweb: "website", url: "website", sitio: "website",
  jobtitle: "jobTitle", cargo: "jobTitle", puesto: "jobTitle", title: "jobTitle", position: "jobTitle",
  linkedin: "linkedIn", linkedinurl: "linkedIn", perfillinkedin: "linkedIn",
  country: "country", pais: "country",
  phone: "phoneNumber", phonenumber: "phoneNumber", telefono: "phoneNumber", celular: "phoneNumber",
};

/**
 * Suggests a field key for each CSV header (by key, label or synonym). Each
 * field is used at most once; unknown headers map to "" (do not import).
 */
export function autoMapHeaders(headers: string[], fields: Array<{ key: string; label: string }>): string[] {
  const byNormalized = new Map<string, string>();
  for (const f of fields) {
    byNormalized.set(strip(f.key), f.key);
    byNormalized.set(strip(f.label), f.key);
  }
  const available = new Set(fields.map((f) => f.key));
  const used = new Set<string>();
  return headers.map((header) => {
    const n = strip(header);
    const key = byNormalized.get(n) ?? SYNONYMS[n] ?? "";
    if (!key || used.has(key) || !available.has(key)) return "";
    used.add(key);
    return key;
  });
}

const EMAIL_RE = /^[^\s@<>()[\]\\,;:"]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;
export const looksLikeEmail = (value: string) => EMAIL_RE.test(value.trim());

/** Rows keyed by field key, skipping unmapped columns and blank cells. */
export function buildMappedRows(rows: string[][], mapping: string[]): Array<Record<string, string>> {
  return rows.map((row) => {
    const out: Record<string, string> = {};
    mapping.forEach((key, i) => {
      const value = row[i]?.trim();
      if (key && value) out[key] = value;
    });
    return out;
  });
}

export function errorsToCsv(errors: Array<{ row: number; email: string | null; reason: string }>): string {
  const esc = (v: string) => (/[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v);
  return ["row,email,reason", ...errors.map((e) => [String(e.row), e.email ?? "", e.reason].map(esc).join(","))].join("\n");
}
