// server.js
import express from "express";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const app = express();
app.use(express.json());

// --- Supabase Setup ---
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error("❌ Missing Supabase credentials. Check your environment variables.");
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// --- API Routes ---

// Health check
app.get("/", (req, res) => {
  res.send("🚀 PhoneCom backend is running!");
});

// Fetch messages
app.get("/messages", async (req, res) => {
  const { data, error } = await supabase.from("messages").select("*").order("created_at", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Add a new message
app.post("/messages", async (req, res) => {
  const { sender, content } = req.body;
  if (!sender || !content) {
    return res.status(400).json({ error: "Sender and content are required" });
  }

  const { data, error } = await supabase.from("messages").insert([{ sender, content }]).select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data[0]);
});

// --- Realtime Subscription ---
function setupRealtime() {
  supabase
    .channel("public:messages")
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
      console.log("📩 New message received:", payload.new);
    })
    .subscribe();
}

setupRealtime();

// --- Server Start ---
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
