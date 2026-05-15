import * as assert from "node:assert/strict";
import { test } from "node:test";
import { buildUploadedDocumentInput, detectDocumentKind, extractTextFromUploadBytes, isSupportedUploadName } from "./cactus-file-intake";
import { sampleDealDocument } from "./cactus-extraction";

test("detects supported CRE upload file kinds from names", () => {
  assert.equal(detectDocumentKind("Ocean Drive OM.pdf"), "pdf");
  assert.equal(detectDocumentKind("rent-roll.csv"), "csv");
  assert.equal(detectDocumentKind("T12.xlsx"), "excel");
  assert.equal(detectDocumentKind("broker note.txt"), "note");
  assert.equal(isSupportedUploadName("photo.png"), false);
});

test("extracts text from UTF-8 text-like uploads", () => {
  const bytes = new TextEncoder().encode(sampleDealDocument);
  const text = extractTextFromUploadBytes(bytes, "ocean-drive.txt", "text/plain");
  assert.match(text, /1450 Ocean Drive/);
  assert.match(text, /Year 1 NOI/i);
});

test("extracts usable text from simple PDF byte streams without storing binary", () => {
  const fakePdf = `%PDF-1.4\n1 0 obj <<>> stream\nBT (Address: 1450 Ocean Drive, Miami Beach, FL) Tj ET\nBT (Yr 1 NOI: $1.18M) Tj ET\nendstream\n%%EOF`;
  const text = extractTextFromUploadBytes(new TextEncoder().encode(fakePdf), "Ocean Drive OM.pdf", "application/pdf");
  assert.match(text, /1450 Ocean Drive/);
  assert.match(text, /Yr 1 NOI/);
  assert.equal(text.includes("%PDF"), false);
});

test("builds backend document input with redacted text and size guardrails", () => {
  const input = buildUploadedDocumentInput({
    name: "Ocean Drive OM.pdf",
    type: "application/pdf",
    bytes: new TextEncoder().encode(`${sampleDealDocument}\nSecret sk-proj-abcdefghijklmnopqrstuvwxyz123456`),
  });
  assert.equal(input.kind, "pdf");
  assert.equal(input.source, "direct file upload");
  assert.equal(input.text.includes("abcdefghijklmnopqrstuvwxyz123456"), false);
  assert.match(input.text, /1450 Ocean Drive/);
});

test("rejects unsupported or empty uploads with clear errors", () => {
  assert.throws(() => buildUploadedDocumentInput({ name: "image.png", type: "image/png", bytes: new Uint8Array([1, 2, 3]) }), /Unsupported file type/);
  assert.throws(() => buildUploadedDocumentInput({ name: "empty.txt", type: "text/plain", bytes: new Uint8Array() }), /empty/);
});
