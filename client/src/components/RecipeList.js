import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../App';

export default function RecipeList() {
  const [recipes, setRecipes] = useState([]);
  const [filter, setFilter] = useState({ difficulty: 'all', time: 'all' });

  const fetchRecipes = useCallback(async () => {
    let query = supabase.from('recipes').select('*');
    
    if (filter.difficulty !== 'all') query = query.eq('difficulty', filter.difficulty);
    if (filter.time !== 'all') {
      const maxTime = filter.time === 'short' ? 30 : filter.time === 'medium' ? 60 : 120;
      query = query.lte('time', maxTime);
    }
    
    const { data, error } = await query;
    if (error) console.error(error);
    else setRecipes(data);
  }, [filter]);

  useEffect(() => {
    fetchRecipes();
  }, [fetchRecipes]);

  return (
    <div>
      <div className="filters">
        <select onChange={(e) => setFilter({...filter, difficulty: e.target.value})}>
          <option value="all">All Difficulties</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
        
        <select onChange={(e) => setFilter({...filter, time: e.target.value})}>
          <option value="all">Any Time</option>
          <option value="short">Quick (&lt;30 min)</option>
          <option value="medium">Medium (30-60 min)</option>
          <option value="long">Long (&gt;60 min)</option>
        </select>
      </div>
      
      <div className="recipe-grid">
        {recipes.map(recipe => (
          <div key={recipe.id} className="recipe-card">
            <h3>{recipe.title}</h3>
            <p>Difficulty: {recipe.difficulty}</p>
            <p>Time: {recipe.time} mins</p>
          </div>
        ))}
      </div>
    </div>
  );
}