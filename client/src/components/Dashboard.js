import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../App';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const [userRecipes, setUserRecipes] = useState([]);
  const [newRecipe, setNewRecipe] = useState({
    title: '',
    difficulty: 'easy',
    time: 30,
    ingredients: '',
    instructions: ''
  });
  const navigate = useNavigate();

  const fetchUserRecipes = useCallback(async () => {
    const user = supabase.auth.user();
    if (!user) return navigate('/auth');

    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('user_id', user.id);

    if (error) console.error(error);
    else setUserRecipes(data || []);
  }, [navigate]);

  useEffect(() => {
    fetchUserRecipes();
  }, [fetchUserRecipes]);

  const handleAddRecipe = async (e) => {
    e.preventDefault();
    const user = supabase.auth.user();
    if (!user) return navigate('/auth');

    const { data, error } = await supabase
      .from('recipes')
      .insert([{ ...newRecipe, user_id: user.id }]);

    if (error) {
      console.error(error);
    } else {
      setUserRecipes([...userRecipes, data[0]]);
      setNewRecipe({
        title: '',
        difficulty: 'easy',
        time: 30,
        ingredients: '',
        instructions: ''
      });
    }
  };

  return (
    <div className="dashboard">
      <h2>Your Recipe Dashboard</h2>
      
      <form onSubmit={handleAddRecipe} className="recipe-form">
        <h3>Add New Recipe</h3>
        <input
          type="text"
          placeholder="Recipe Title"
          value={newRecipe.title}
          onChange={(e) => setNewRecipe({...newRecipe, title: e.target.value})}
          required
        />
        <select
          value={newRecipe.difficulty}
          onChange={(e) => setNewRecipe({...newRecipe, difficulty: e.target.value})}
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
        <input
          type="number"
          placeholder="Time (minutes)"
          value={newRecipe.time}
          onChange={(e) => setNewRecipe({...newRecipe, time: e.target.value})}
          min="1"
          required
        />
        <textarea
          placeholder="Ingredients (separate by commas)"
          value={newRecipe.ingredients}
          onChange={(e) => setNewRecipe({...newRecipe, ingredients: e.target.value})}
          required
        />
        <textarea
          placeholder="Instructions"
          value={newRecipe.instructions}
          onChange={(e) => setNewRecipe({...newRecipe, instructions: e.target.value})}
          required
        />
        <button type="submit">Add Recipe</button>
      </form>

      <div className="user-recipes">
        <h3>Your Recipes ({userRecipes.length})</h3>
        {userRecipes.length === 0 ? (
          <p>No recipes yet. Add one above!</p>
        ) : (
          <div className="recipe-list">
            {userRecipes.map(recipe => (
              <div key={recipe.id} className="recipe-card">
                <h4>{recipe.title}</h4>
                <p><strong>Difficulty:</strong> {recipe.difficulty}</p>
                <p><strong>Time:</strong> {recipe.time} minutes</p>
                <div className="ingredients">
                  <strong>Ingredients:</strong>
                  <ul>
                    {recipe.ingredients.split(',').map((item, i) => (
                      <li key={i}>{item.trim()}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}