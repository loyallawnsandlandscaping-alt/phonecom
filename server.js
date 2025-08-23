// server.js
import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const upload = multer({ dest: "uploads/" });

// --- Supabase setup ---
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // ⚠️ service role key, not anon
);

// --- Cloudinary setup ---
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// --- Simple health check ---
app.get("/", (req, res) => {
  res.send("✅ Server running");
});

// --- Upload a file ---
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path);

    // Save record in Supabase
    const { data, error } = await supabase.from("uploads").insert([
      {
        url: result.secure_url,
        public_id: result.public_id,
        created_at: new Date(),
      },
    ]);

    if (error) throw error;

    res.json({ success: true, url: result.secure_url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed" });
  }
});

// --- List all uploads ---
app.get("/uploads", async (req, res) => {
  try {
    const { data, error } = await supabase.from("uploads").select("*");
    if (error) throw error;
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not fetch uploads" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
