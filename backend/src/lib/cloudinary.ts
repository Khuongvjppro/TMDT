import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export interface UploadResult {
  secure_url: string;
  public_id: string;
  format: string;
  bytes: number;
  created_at: string;
}

/**
 * Upload a buffer to Cloudinary as a raw file (CV/resume).
 * Returns the secure URL and metadata.
 */
export function uploadBuffer(
  buffer: Buffer,
  folder: string,
  filename: string
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: filename,
        resource_type: "raw",
        type: "upload",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result as UploadResult);
      }
    );
    uploadStream.end(buffer);
  });
}

/**
 * Delete a file from Cloudinary by public_id.
 */
export function deleteFile(publicId: string): Promise<void> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, { resource_type: "raw" }, (error) => {
      if (error) return reject(error);
      resolve();
    });
  });
}

/**
 * Extract the public_id from a Cloudinary URL.
 * Example: "https://res.cloudinary.com/tgex7tjh/raw/upload/v1234/cvs/user_1_cv.pdf"
 * -> "cvs/user_1_cv.pdf" (without extension)
 */
export function extractPublicId(url: string): string | null {
  try {
    const parts = url.split("/");
    const uploadIndex = parts.findIndex((p) => p === "upload");
    if (uploadIndex === -1) return null;
    // Everything after upload/... is the path (skip version number if present)
    const pathParts = parts.slice(uploadIndex + 1);
    // Remove version number if present (v1234567890)
    if (pathParts[0]?.startsWith("v")) {
      pathParts.shift();
    }
    // Remove file extension from the last part
    const lastPart = pathParts[pathParts.length - 1];
    const dotIndex = lastPart?.lastIndexOf(".");
    if (dotIndex && dotIndex > 0) {
      pathParts[pathParts.length - 1] = lastPart.substring(0, dotIndex);
    }
    return pathParts.join("/");
  } catch {
    return null;
  }
}

export default cloudinary;
