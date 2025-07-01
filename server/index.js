require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);

// Middleware
app.use(cors());
app.use(express.json());

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: "Recipe API Server",
    endpoints: {
      getAllRecipes: "GET /api/recipes",
      getRecipe: "GET /api/recipes/:id",
      createRecipe: "POST /api/recipes",
      updateRecipe: "PUT /api/recipes/:id",
      deleteRecipe: "DELETE /api/recipes/:id"
    }
  });
});

// Enhanced recipe endpoints
app.get('/api/recipes', async (req, res) => {
  try {
    let query = supabase
      .from('recipes')
      .select('*')
      .order('created_at', { ascending: false });

    // Add filters if provided
    if (req.query.difficulty) {
      query = query.eq('difficulty', req.query.difficulty);
    }
    if (req.query.time) {
      query = query.lte('time', parseInt(req.query.time));
    }
    if (req.query.user_id) {
      query = query.eq('user_id', req.query.user_id);
    }

    const { data, error } = await query;
    
    if (error) throw error;
    res.json(data || []);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    res.status(500).json({ error: 'Failed to fetch recipes' });
  }
});

app.get('/api/recipes/:id', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (error) throw error;
    if (!data) return res.status(404).json({ error: 'Recipe not found' });
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching recipe:', error);
    res.status(500).json({ error: 'Failed to fetch recipe' });
  }
});

app.post('/api/recipes', async (req, res) => {
  try {
    const { title, difficulty, time, ingredients, instructions, user_id } = req.body;
    
    // Enhanced validation
    const missingFields = [];
    if (!title) missingFields.push('title');
    if (!ingredients) missingFields.push('ingredients');
    if (!instructions) missingFields.push('instructions');
    if (!user_id) missingFields.push('user_id');
    
    if (missingFields.length > 0) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        missingFields
      });
    }

    const recipeData = {
      title,
      difficulty: difficulty || 'easy',
      time: parseInt(time) || 30,
      ingredients,
      instructions,
      user_id,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('recipes')
      .insert([recipeData])
      .select();
    
    if (error) throw error;
    
    res.status(201).json(data[0]);
  } catch (error) {
    console.error('Error creating recipe:', error);
    res.status(500).json({ error: 'Failed to create recipe' });
  }
});

app.put('/api/recipes/:id', async (req, res) => {
  try {
    // First verify the recipe exists
    const { data: existing, error: fetchError } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (fetchError) throw fetchError;
    if (!existing) return res.status(404).json({ error: 'Recipe not found' });
    
    // Prepare update data
    const updates = {
      ...req.body,
      updated_at: new Date().toISOString()
    };

    // Remove fields that shouldn't be updated
    delete updates.id;
    delete updates.created_at;
    delete updates.user_id; // Prevent changing ownership

    const { data, error } = await supabase
      .from('recipes')
      .update(updates)
      .eq('id', req.params.id)
      .select();
    
    if (error) throw error;
    
    res.json(data[0]);
  } catch (error) {
    console.error('Error updating recipe:', error);
    res.status(500).json({ error: 'Failed to update recipe' });
  }
});

app.delete('/api/recipes/:id', async (req, res) => {
  try {
    // First verify the recipe exists
    const { data: existing, error: fetchError } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', req.params.id)
      .single();
    
    if (fetchError) throw fetchError;
    if (!existing) return res.status(404).json({ error: 'Recipe not found' });

    // Delete the recipe
    const { error } = await supabase
      .from('recipes')
      .delete()
      .eq('id', req.params.id);
    
    if (error) throw error;
    
    res.status(204).end();
  } catch (error) {
    console.error('Error deleting recipe:', error);
    res.status(500).json({ error: 'Failed to delete recipe' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Supabase URL: ${process.env.SUPABASE_URL}`);
});