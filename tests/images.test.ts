import { describe, expect, it } from "vitest";
import sharp from "sharp";
import {
  MAX_IMAGE_BYTES,
  detectImageMime,
  processImage,
  validateImageUpload,
  randomImageName,
} from "../src/lib/upload";

function head(bytes: number[]): Buffer {
  return Buffer.from(bytes);
}

describe("image uploads", () => {
  it("detects real types from magic bytes", () => {
    expect(detectImageMime(head([0xff, 0xd8, 0xff, 0xe0]))).toBe("image/jpeg");
    expect(detectImageMime(head([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))).toBe("image/png");
    expect(detectImageMime(head([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50]))).toBe("image/webp");
    expect(detectImageMime(head([0, 0, 0, 0, 0x66, 0x74, 0x79, 0x70, 0x61, 0x76, 0x69, 0x66]))).toBe("image/avif");
  });

  it("rejects masqueraded files (SVG text, truncated, empty)", () => {
    expect(detectImageMime(Buffer.from("<svg xmlns=\"http://www.w3.org/2000/svg\"></svg>"))).toBeNull();
    expect(detectImageMime(Buffer.from("MZ\x90\x00 binary"))).toBeNull();
    expect(detectImageMime(Buffer.alloc(0))).toBeNull();
  });

  it("validateImageUpload rejects empty, oversized and non-image buffers", () => {
    expect(validateImageUpload(Buffer.alloc(0))).toMatch(/Empty/);
    expect(validateImageUpload(Buffer.alloc(MAX_IMAGE_BYTES + 1))).toMatch(/larger/i);
    expect(validateImageUpload(Buffer.from("hello world"))).toMatch(/unsupported|corrupt/i);
  });

  it("validateImageUpload accepts a real image under the limit", () => {
    const img = Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), Buffer.alloc(16)]);
    expect(validateImageUpload(img)).toBeNull();
  });

  it("processImage re-encodes to webp, caps at 1600px and strips EXIF", async () => {
    const src = await sharp({
      create: { width: 2000, height: 1200, channels: 3, background: { r: 180, g: 90, b: 40 } },
    })
      .withMetadata({ orientation: 6 })
      .jpeg()
      .toBuffer();

    const out = await processImage(src);
    const meta = await sharp(out).metadata();
    expect(meta.format).toBe("webp");
    expect(Math.max(meta.width ?? 0, meta.height ?? 0)).toBeLessThanOrEqual(1600);
    expect(out.length).toBeLessThan(src.length);
  });

  it("produces uuid-based filenames only", () => {
    const n = randomImageName();
    expect(n).toMatch(/^[0-9a-f-]{36}\.webp$/);
    expect(n).not.toContain("..");
  });
});