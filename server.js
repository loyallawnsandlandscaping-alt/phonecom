// server.js
import express from "express";
import { supabase } from "./supabaseClient.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Root
app.get("/", (req, res) => {
  res.send("✅ Video Conference Backend Running");
});

// Health check: confirms env vars exist
app.get("/health", (req, res) => {
  const hasUrl = !!process.env.SUPABASE_URL;
  const hasKey = !!process.env.SUPABASE_ANON_KEY;
  res.json({
    ok: true,
    supabase_url_present: hasUrl,
    supabase_key_present: hasKey,
  });
});

// DB ping: try a simple query to verify DB connectivity
app.get("/db-ping", async (req, res) => {
  try {
    const { error } = await supabase.from("rooms").select("id").limit(1);
    if (error) {
      return res.status(500).json({ ok: false, error: error.message });
    }
    return res.json({ ok: true, message: "DB reachable ✅" });
  } catch (e) {
    return res.status(500).json({ ok: false, error: String(e) });
  }
});

// (sample) list users
app.get("/users", async (req, res) => {
  const { data, error } = await supabase.from("users").select("*");
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// (sample) add user
app.post("/users", async (req, res) => {
  const { name, email } = req.body || {};
  if (!name) return res.status(400).json({ error: "name is required" });
  const { data, error } = await supabase
    .from("users")
    .insert([{ name, email }])
    .select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
