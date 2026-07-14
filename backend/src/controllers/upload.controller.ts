import { Request, Response } from "express";
import { uploadBuffer, deleteFile, extractPublicId } from "../lib/cloudinary";

/**
 * POST /api/upload/cv
 * Accepts a multipart file and uploads it to Cloudinary.
 * Returns the file URL for use in CV records.
 */
export async function uploadCvFile(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const userId = req.user.userId;
  const originalName = req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, "_");
  const timestamp = Date.now();
  const filename = `user_${userId}_${timestamp}_${originalName}`;

  try {
    const result = await uploadBuffer(req.file.buffer, "jobfinder-cvs", filename);

    return res.status(200).json({
      item: {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        size: result.bytes,
        originalName: req.file.originalname,
      },
    });
  } catch (error: any) {
    console.error("Cloudinary upload error:", error);
    return res.status(500).json({ message: "Failed to upload file" });
  }
}

/**
 * DELETE /api/upload/cv
 * Delete a file from Cloudinary by URL.
 */
export async function deleteCvFile(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const url = req.query.url as string | undefined;
  if (!url || typeof url !== "string") {
    return res.status(400).json({ message: "File URL is required" });
  }

  const publicId = extractPublicId(url);
  if (!publicId) {
    return res.status(400).json({ message: "Invalid Cloudinary URL" });
  }

  try {
    await deleteFile(publicId);
    return res.status(204).send();
  } catch (error: any) {
    console.error("Cloudinary delete error:", error);
    return res.status(500).json({ message: "Failed to delete file" });
  }
}
