import { Request, Response } from "express";
import { uploadBuffer, deleteFile, extractPublicId } from "../lib/cloudinary";
import fs from "fs";
import path from "path";

/**
 * POST /api/upload/cv
 * Accepts a multipart file and uploads it to Cloudinary (or locally if not configured).
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

  // Check if Cloudinary is configured
  const isCloudinaryConfigured =
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_CLOUD_NAME !== "your_cloud_name" &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_KEY !== "your_api_key" &&
    process.env.CLOUDINARY_API_SECRET &&
    process.env.CLOUDINARY_API_SECRET !== "your_api_secret";

  if (isCloudinaryConfigured) {
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
      return res.status(500).json({ message: "Failed to upload file to Cloudinary" });
    }
  } else {
    // Local storage fallback
    try {
      const uploadsDir = path.join(process.cwd(), "uploads");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const filePath = path.join(uploadsDir, filename);
      fs.writeFileSync(filePath, req.file.buffer);

      const serverUrl = `${req.protocol}://${req.get("host")}/uploads/${filename}`;

      return res.status(200).json({
        item: {
          url: serverUrl,
          publicId: filename,
          format: path.extname(originalName).substring(1),
          size: req.file.size,
          originalName: req.file.originalname,
        },
      });
    } catch (error: any) {
      console.error("Local upload error:", error);
      return res.status(500).json({ message: "Failed to upload file locally" });
    }
  }
}

/**
 * DELETE /api/upload/cv
 * Delete a file from Cloudinary (or local storage) by URL.
 */
export async function deleteCvFile(req: Request, res: Response) {
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const url = req.query.url as string | undefined;
  if (!url || typeof url !== "string") {
    return res.status(400).json({ message: "File URL is required" });
  }

  if (url.includes("/uploads/")) {
    try {
      const filename = url.split("/uploads/")[1];
      const filePath = path.join(process.cwd(), "uploads", filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      return res.status(204).send();
    } catch (error: any) {
      console.error("Local file delete error:", error);
      return res.status(500).json({ message: "Failed to delete local file" });
    }
  } else {
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
}
