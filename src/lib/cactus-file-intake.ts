import type { CactusDocument } from "./cactus-backend";
import { redactPotentialSecrets } from "./cactus-settings";

const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
const TEXT_EXTENSIONS = new Set(["txt", "md", "markdown", "csv", "tsv", "json", "html", "htm", "eml"]);
const EXCEL_EXTENSIONS = new Set(["xls", "xlsx"]);

export type UploadedDocumentInput = {
  name: string;
  type?: string;
  bytes: Uint8Array;
  source?: string;
};

export function detectDocumentKind(name: string): CactusDocument["kind"] {
  const ext = extensionOf(name);
  if (ext === "pdf") return "pdf";
  if (ext === "csv" || ext === "tsv") return "csv";
  if (EXCEL_EXTENSIONS.has(ext)) return "excel";
  if (ext === "eml") return "email";
  return "note";
}

export function isSupportedUploadName(name: string): boolean {
  const ext = extensionOf(name);
  return ext === "pdf" || TEXT_EXTENSIONS.has(ext) || EXCEL_EXTENSIONS.has(ext);
}

export function extractTextFromUploadBytes(bytes: Uint8Array, name: string, mimeType = ""): string {
  if (!bytes.byteLength) throw new Error("Uploaded file is empty");
  if (bytes.byteLength > MAX_UPLOAD_BYTES) throw new Error("Uploaded file is too large for this local extraction demo");
  if (!isSupportedUploadName(name)) throw new Error("Unsupported file type. Upload PDF, TXT, CSV, XLS/XLSX, EML, Markdown, JSON, or HTML.");

  const kind = detectDocumentKind(name);
  const decoded = decodeBytes(bytes);
  if (kind === "pdf" || mimeType.includes("pdf")) return cleanExtractedPdfText(decoded);
  if (kind === "excel") return cleanSpreadsheetText(decoded, name);
  return cleanText(decoded);
}

export function buildUploadedDocumentInput(upload: UploadedDocumentInput): { name: string; text: string; kind: CactusDocument["kind"]; source: string } {
  const text = extractTextFromUploadBytes(upload.bytes, upload.name, upload.type);
  const redactedText = redactPotentialSecrets(text).slice(0, 120_000);
  if (!redactedText.trim()) throw new Error("No readable text found in upload. Try exporting the PDF/Excel to text or CSV first.");
  return {
    name: redactPotentialSecrets(upload.name || "Uploaded CRE source"),
    text: redactedText,
    kind: detectDocumentKind(upload.name),
    source: upload.source ?? "direct file upload",
  };
}

function extensionOf(name: string): string {
  return name.split(".").pop()?.toLowerCase().trim() || "";
}

function decodeBytes(bytes: Uint8Array): string {
  return new TextDecoder("utf-8", { fatal: false }).decode(bytes);
}

function cleanText(text: string): string {
  return text
    .replace(/\u0000/g, " ")
    .replace(/[\t ]+/g, " ")
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function cleanSpreadsheetText(text: string, name: string): string {
  const readable = cleanText(text);
  if (readable.replace(/[^\w$%.,:\-\n ]/g, "").trim().length < 25) {
    return `${name}\nSpreadsheet upload received. Binary Excel parsing will be handled by the production extractor; export CSV for local text extraction.`;
  }
  return readable;
}

function cleanExtractedPdfText(raw: string): string {
  const literalMatches = Array.from(raw.matchAll(/\(([^()]{2,500})\)\s*Tj/g)).map((match) => unescapePdfLiteral(match[1]));
  const arrayMatches = Array.from(raw.matchAll(/\[((?:\s*\([^()]{1,300}\)\s*)+)\]\s*TJ/g)).map((match) =>
    Array.from(match[1].matchAll(/\(([^()]+)\)/g)).map((part) => unescapePdfLiteral(part[1])).join(""),
  );
  const candidates = [...literalMatches, ...arrayMatches];
  if (candidates.join(" ").trim().length > 20) return cleanText(candidates.join("\n"));

  return cleanText(
    raw
      .replace(/%PDF-[\s\S]*?stream/g, " ")
      .replace(/endstream[\s\S]*?%%EOF/g, " ")
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]+/g, " ")
      .replace(/\b\d+\s+\d+\s+obj\b|endobj|xref|trailer|startxref/g, " "),
  );
}

function unescapePdfLiteral(value: string): string {
  return value.replace(/\\([nrtbf()\\])/g, (_match, code: string) => {
    const map: Record<string, string> = { n: "\n", r: "\r", t: "\t", b: "", f: "", "(": "(", ")": ")", "\\": "\\" };
    return map[code] ?? code;
  });
}
