import express from 'express'
import { supabase } from './supabaseClient.js'

const app = express()
app.use(express.json())

// ✅ Root route
app.get('/', (req, res) => {
  res.send('✅ Server is running and connected to Supabase')
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
