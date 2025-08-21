import express from "express";
import { supabase } from "./supabaseClient.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Root route
app.get("/", (req, res) => {
  res.send("✅ Video Conference Backend Running");
});

// Example: fetch users from Supabase
app.get("/users", async (req, res) => {
  const { data, error } = await supabase.from("users").select("*");
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Example: add a new user
app.post("/users", async (req, res) => {
  const { name, email } = req.body;
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