import { Router, Request, Response } from "express";
import { storage } from "@/lib/firebase";
import { ref, getBytes } from "firebase/storage";

const router = Router();

router.post("/download", async (req: Request, res: Response) => {
  try {
    const { storagePath } = req.body;

    if (!storagePath) {
      return res.status(400).json({ error: "Storage path is required" });
    }

    const MAX_RETRIES = 3;
    const INITIAL_DELAY = 1000;

    const downloadWithRetry = async (retryCount = 0): Promise<Uint8Array> => {
      try {
        const fileRef = ref(storage, storagePath);
        const maxDownloadBytes = 500 * 1024 * 1024;
        const bytes = await getBytes(fileRef, maxDownloadBytes);
        return bytes;
      } catch (storageError) {
        const errorMsg =
          storageError instanceof Error
            ? storageError.message
            : String(storageError);

        if (
          (errorMsg.includes("retry-limit-exceeded") ||
            errorMsg.includes("network") ||
            errorMsg.includes("timeout")) &&
          retryCount < MAX_RETRIES
        ) {
          const delay = INITIAL_DELAY * Math.pow(2, retryCount);
          await new Promise((resolve) => setTimeout(resolve, delay));
          return downloadWithRetry(retryCount + 1);
        }

        throw storageError;
      }
    };

    const bytes = await downloadWithRetry();
    res.set("Content-Type", "application/octet-stream");
    res.send(Buffer.from(bytes));
  } catch (error) {
    console.error("File download error:", error);
    const errorMsg =
      error instanceof Error ? error.message : "Unknown error";

    if (errorMsg.includes("auth/unauthenticated")) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    if (errorMsg.includes("permission-denied")) {
      return res.status(403).json({ error: "Access denied" });
    }
    if (errorMsg.includes("object-not-found")) {
      return res.status(404).json({ error: "File not found" });
    }

    res.status(500).json({ error: "Download failed" });
  }
});

export { router as fileDownloadRouter };
