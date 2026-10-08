import { randomUUID } from "node:crypto";
import sharp from "sharp";

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB
export const IMAGE_BUCKET = "project-images";
export const ALLOWED_IMAGE_MIMES = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);

/** File extensions accepted by the picker. SVG is deliberately NOT allowed. */
export const UPLOAD_ACCEPT = ".jpg,.jpeg,.png,.webp,.avif";

const MAGIC: { mime: string; offset: number; bytes: number[] }[] = [
  { mime: "image/jpeg", offset: 0, bytes: [0xff, 0xd8, 0xff] },
  { mime: "image/png", offset: 0, bytes: [0x89, 0x50, 0x4e, 0x47] },
  { mime: "image/webp", offset: 8, bytes: [0x57, 0x45, 0x42, 0x50] }, // RIFF....WEBP
  { mime: "image/avif", offset: 4, bytes: [0x66, 0x74, 0x79, 0x70] }, // ....ftyp
];

/**
 * Sniffs real image type from magic bytes — never trust client mime/ext,
 * which attackers control trivially (an .exe renamed to .png).
 */
export function detectImageMime(buf: Buffer): string | null {
  for (const m of MAGIC) {
    if (buf.length >= m.offset + m.bytes.length && m.bytes.every((b, i) => buf[m.offset + i] === b)) return m.mime;
  }
  return null;
}

/** Validates the raw upload bytes. Returns an error message or `null`. */
export function validateImageUpload(buf: Buffer, sizeLimit = MAX_IMAGE_BYTES): string | null {
  if (buf.length === 0) return "Empty file";
  if (buf.length > sizeLimit) return `File is larger than ${Math.round(sizeLimit / 1024 / 1024)}MB`;
  const mime = detectImageMime(buf);
  if (!mime) return "Unsupported or corrupt image (magic bytes check failed)";
  if (!ALLOWED_IMAGE_MIMES.has(mime)) return `Image type not allowed (${mime})`;
  return null;
}

/**
 * Server-side processing: rotates per EXIF, caps longest edge at 1600px,
 * strips all metadata (including EXIF/GPS), and re-encodes to webp.
 */
export async function processImage(buf: Buffer, maxSize = 1600, quality = 85): Promise<Buffer> {
  // sharp strips EXIF/GPS metadata by default; rotate() applies the EXIF
  // orientation first so output is upright but clean.
  return sharp(buf, { failOn: "error" })
    .rotate()
    .resize({ width: maxSize, height: maxSize, fit: "inside", withoutEnlargement: true })
    .webp({ quality, effort: 4 })
    .toBuffer();
}

/** Random uuid filename — no user-supplied names ever reach the bucket. */
export function randomImageName(): string {
  return `${randomUUID()}.webp`;
}