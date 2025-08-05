import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Plus, Edit, Trash2, Calculator, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatPeso } from '../utils/currency';

const Recipes = () => {
  const [recipes, setRecipes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    servings: '',
    prepTime: '',
    cookTime: '',
    instructions: '',
    ingredients: []
  });

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = () => {
    const savedRecipes = localStorage.getItem(`recipes_${user.id}`);
    if (savedRecipes) {
      setRecipes(JSON.parse(savedRecipes));
    }
  };

  const saveRecipes = (newRecipes) => {
    localStorage.setItem(`recipes_${user.id}`, JSON.stringify(newRecipes));
    setRecipes(newRecipes);
  };

  const addIngredient = () => {
    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, { name: '', quantity: '', unit: '', cost: '' }]
    });
  };

  const updateIngredient = (index, field, value) => {
    const newIngredients = [...formData.ingredients];
    newIngredients[index][field] = value;
    setFormData({ ...formData, ingredients: newIngredients });
  };

  const removeIngredient = (index) => {
    const newIngredients = formData.ingredients.filter((_, i) => i !== index);
    setFormData({ ...formData, ingredients: newIngredients });
  };

  const calculateRecipeCost = (ingredients = formData.ingredients) => {
    return ingredients.reduce((total, ingredient) => {
      const cost = parseFloat(ingredient.cost) || 0;
      const quantity = parseFloat(ingredient.quantity) || 0;
      return total + (cost * quantity);
    }, 0);
  };

  const calculateCostPerServing = () => {
    const totalCost = calculateRecipeCost();
    const servings = parseFloat(formData.servings) || 1;
    return totalCost / servings;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.category || !formData.servings) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.ingredients.length === 0) {
      toast.error('Please add at least one ingredient');
      return;
    }

    const recipe = {
      id: editingRecipe ? editingRecipe.id : Date.now(),
      ...formData,
      servings: parseInt(formData.servings),
      prepTime: parseInt(formData.prepTime) || 0,
      cookTime: parseInt(formData.cookTime) || 0,
      totalCost: calculateRecipeCost(),
      costPerServing: calculateCostPerServing(),
      createdAt: editingRecipe ? editingRecipe.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    let newRecipes;
    if (editingRecipe) {
      newRecipes = recipes.map(r => r.id === editingRecipe.id ? recipe : r);
      toast.success('Recipe updated successfully');
    } else {
      newRecipes = [recipe, ...recipes];
      toast.success('Recipe added successfully');
    }

    saveRecipes(newRecipes);
    resetForm();
  };

  const handleEdit = (recipe) => {
    setEditingRecipe(recipe);
    setFormData({
      name: recipe.name,
      description: recipe.description || '',
      category: recipe.category,
      servings: recipe.servings.toString(),
      prepTime: recipe.prepTime.toString(),
      cookTime: recipe.cookTime.toString(),
      instructions: recipe.instructions || '',
      ingredients: recipe.ingredients
    });
    setShowModal(true);
  };

  const handleDelete = (recipeId) => {
    if (window.confirm('Are you sure you want to delete this recipe?')) {
      const newRecipes = recipes.filter(r => r.id !== recipeId);
      saveRecipes(newRecipes);
      toast.success('Recipe deleted successfully');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      servings: '',
      prepTime: '',
      cookTime: '',
      instructions: '',
      ingredients: []
    });
    setEditingRecipe(null);
    setShowModal(false);
  };

  const categories = ['Appetizers', 'Main Course', 'Desserts', 'Beverages', 'Sides', 'Sauces'];
  const units = ['grams', 'kg', 'ml', 'liters', 'cups', 'pieces', 'tbsp', 'tsp'];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
            <BookOpen className="text-primary-600" size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Recipes & Costing</h1>
            <p className="text-gray-600">Manage recipes and calculate food costs</p>
          </div>
        </div>
        
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus size={20} />
          Add Recipe
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-xl border border-gray-200"
        >
          <div className="text-2xl font-bold text-gray-900 mb-1">{recipes.length}</div>
          <div className="text-sm text-gray-600">Total Recipes</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-6 rounded-xl border border-gray-200"
        >
          <div className="text-2xl font-bold text-green-600 mb-1">
            {formatPeso(recipes.reduce((sum, recipe) => sum + recipe.costPerServing, 0) / (recipes.length || 1))}
          </div>
          <div className="text-sm text-gray-600">Avg Cost/Serving</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-xl border border-gray-200"
        >
          <div className="text-2xl font-bold text-blue-600 mb-1">
            {Math.round(recipes.reduce((sum, recipe) => sum + recipe.prepTime + recipe.cookTime, 0) / (recipes.length || 1))}
          </div>
          <div className="text-sm text-gray-600">Avg Time (min)</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-xl border border-gray-200"
        >
          <div className="text-2xl font-bold text-purple-600 mb-1">
            {new Set(recipes.map(r => r.category)).size}
          </div>
          <div className="text-sm text-gray-600">Categories</div>
        </motion.div>
      </div>

      {/* Recipes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {recipes.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No recipes yet</h3>
            <p className="text-gray-500 mb-4">Add your first recipe to start managing costs!</p>
            <button
              onClick={() => setShowModal(true)}
              className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors"
            >
              Add Recipe
            </button>
          </div>
        ) : (
          recipes.map(recipe => (
            <motion.div
              key={recipe.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-xl border border-gray-200 p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{recipe.name}</h3>
                  <p className="text-sm text-gray-500 mb-2">{recipe.description}</p>
                  <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    {recipe.category}
                  </span>
                </div>
                
                <div className="flex gap-1">
                  <button
                    onClick={() => handleEdit(recipe)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(recipe.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calculator className="text-green-600" size={16} />
                  <span className="text-sm text-gray-600">Cost per serving:</span>
                  <span className="font-semibold text-green-600">{formatPeso(recipe.costPerServing)}</span>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="text-blue-600" size={16} />
                  <span className="text-sm text-gray-600">
                    {recipe.prepTime + recipe.cookTime} min total
                  </span>
                </div>
                
                <div className="text-sm text-gray-600">
                  <span>Serves {recipe.servings}</span>
                  <span className="mx-2">•</span>
                  <span>{recipe.ingredients.length} ingredients</span>
                </div>

                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xs text-gray-600 mb-1">Ingredients:</div>
                  <div className="text-sm space-y-1">
                    {recipe.ingredients.slice(0, 3).map((ingredient, index) => (
                      <div key={index} className="flex justify-between">
                        <span>{ingredient.name}</span>
                        <span>{ingredient.quantity} {ingredient.unit}</span>
                      </div>
                    ))}
                    {recipe.ingredients.length > 3 && (
                      <div className="text-xs text-gray-500">
                        +{recipe.ingredients.length - 3} more...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Add/Edit Recipe Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <h2 className="text-xl font-bold mb-4">
              {editingRecipe ? 'Edit Recipe' : 'Add New Recipe'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Recipe Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Servings *
                  </label>
                  <input
                    type="number"
                    value={formData.servings}
                    onChange={(e) => setFormData({...formData, servings: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    min="1"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prep Time (minutes)
                  </label>
                  <input
                    type="number"
                    value={formData.prepTime}
                    onChange={(e) => setFormData({...formData, prepTime: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    min="0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cook Time (minutes)
                  </label>
                  <input
                    type="number"
                    value={formData.cookTime}
                    onChange={(e) => setFormData({...formData, cookTime: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    min="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  rows="2"
                />
              </div>

              {/* Ingredients Section */}
              <div>
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    Ingredients *
                  </label>
                  <button
                    type="button"
                    onClick={addIngredient}
                    className="text-sm bg-primary-600 text-white px-3 py-1 rounded-lg hover:bg-primary-700"
                  >
                    Add Ingredient
                  </button>
                </div>

                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {formData.ingredients.map((ingredient, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-center">
                      <input
                        type="text"
                        placeholder="Ingredient name"
                        value={ingredient.name}
                        onChange={(e) => updateIngredient(index, 'name', e.target.value)}
                        className="col-span-4 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-primary-500"
                      />
                      <input
                        type="number"
                        step="0.1"
                        placeholder="Qty"
                        value={ingredient.quantity}
                        onChange={(e) => updateIngredient(index, 'quantity', e.target.value)}
                        className="col-span-2 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-primary-500"
                      />
                      <select
                        value={ingredient.unit}
                        onChange={(e) => updateIngredient(index, 'unit', e.target.value)}
                        className="col-span-2 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-primary-500"
                      >
                        <option value="">Unit</option>
                        {units.map(unit => (
                          <option key={unit} value={unit}>{unit}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Cost per unit"
                        value={ingredient.cost}
                        onChange={(e) => updateIngredient(index, 'cost', e.target.value)}
                        className="col-span-3 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-1 focus:ring-primary-500"
                      />
                      <button
                        type="button"
                        onClick={() => removeIngredient(index)}
                        className="col-span-1 p-1 text-red-600 hover:bg-red-50 rounded"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Instructions
                </label>
                <textarea
                  value={formData.instructions}
                  onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  rows="4"
                  placeholder="Step by step cooking instructions..."
                />
              </div>

              {/* Cost Calculation */}
              {formData.ingredients.length > 0 && formData.servings && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Cost Calculation</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="flex justify-between">
                        <span>Total cost:</span>
                        <span>{formatPeso(calculateRecipeCost())}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Servings:</span>
                        <span>{formData.servings || 1}</span>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between font-semibold">
                        <span>Cost per serving:</span>
                        <span className="text-green-600">{formatPeso(calculateCostPerServing())}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                >
                  {editingRecipe ? 'Update' : 'Add'} Recipe
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
};

export default Recipes;