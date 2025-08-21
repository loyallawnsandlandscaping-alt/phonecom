# Video Conference Backend

This is a starter backend for your video conference app.

## Setup

1. Clone this repo:
   ```bash
   git clone https://github.com/YOUR_USERNAME/video-conference-backend.git
   cd video-conference-backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with your Supabase keys:
   ```
   SUPABASE_URL=your-supabase-url
   SUPABASE_ANON_KEY=your-supabase-anon-key
   ```

4. Run locally:
   ```bash
   npm start
   ```

5. Deploy to [Render](https://render.com/).  
   - Connect this repo.  
   - Add environment variables `SUPABASE_URL` and `SUPABASE_ANON_KEY` in Render settings.  

## API Endpoints

- `GET /users` → lists all users in Supabase  
- `POST /users` with `{ "name": "Alice", "email": "alice@test.com" }` → adds a new user  
