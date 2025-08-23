import express from 'express'
import multer from 'multer'
import { v2 as cloudinary } from 'cloudinary'
import { supabase } from './supabaseClient.js'

const app = express()
app.use(express.json())

// ✅ Multer for handling uploads
const upload = multer({ dest: 'uploads/' })

// ✅ Cloudinary config
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_URL.split('@')[1], // cloud name comes after '@'
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// ✅ Root route
app.get('/', (req, res) => {
  res.send('✅ Server is running and connected to Supabase + Cloudinary')
})

// ✅ Insert a message into Supabase
app.post('/send', async (req, res) => {
  const { sender, content } = req.body
  const { data, error } = await supabase
    .from('messages')
    .insert([{ sender, content }])

  if (error) return res.status(400).json({ error: error.message })
  res.json(data)
})

// ✅ Fetch all messages from Supabase
app.get('/messages', async (req, res) => {
  const { data, error } = await supabase
    .from('messages')
    .select('*')
    .order('created_at', { ascending: true })

  if (error) return res.status(400).json({ error: error.message })
  res.json(data)
})

// ✅ Upload annotated image to Cloudinary & store metadata in Supabase
app.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: 'annotations',
    })

    // Save reference in Supabase
    const { data, error } = await supabase
      .from('uploads')
      .insert([{ url: result.secure_url, public_id: result.public_id }])

    if (error) return res.status(400).json({ error: error.message })

    res.json({ url: result.secure_url, id: result.public_id })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// ✅ Save structured annotation data (JSON)
app.post('/annotation', async (req, res) => {
  const { user_id, tool, data } = req.body

  const { error } = await supabase
    .from('annotations')
    .insert([{ user_id, tool, data }])

  if (error) return res.status(400).json({ error: error.message })
  res.json({ success: true })
})

// ✅ Realtime subscription (logs to Render console)
supabase
  .channel('room1')
  .on(
    'postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'messages' },
    (payload) => {
      console.log('📩 New message:', payload.new)
    }
  )
  .subscribe()

// ✅ Server listen
const port = process.env.PORT || 10000
app.listen(port, () => console.log(`🚀 Server running on port ${port}`))
