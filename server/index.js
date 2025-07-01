require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 5000;

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

app.use(cors());
app.use(express.json());

// Get all recipes
app.get('/api/recipes', async (req, res) => {
  const { data, error } = await supabase.from('recipes').select('*');
  if (error) return res.status(500).json({ error });
  res.json(data);
});

// Add new recipe
app.post('/api/recipes', async (req, res) => {
  const { title, difficulty, time, ingredients, instructions, user_id } = req.body;
  const { data, error } = await supabase
    .from('recipes')
    .insert([{ title, difficulty, time, ingredients, instructions, user_id }]);
  if (error) return res.status(500).json({ error });
  res.json(data);
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));