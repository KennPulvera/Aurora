const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');

// In-memory storage for recipes (you can replace this with MongoDB later)
const recipes = new Map();

// @route   GET api/recipes
// @desc    Get all recipes for the user
// @access  Public (for now)
router.get('/', async (req, res) => {
  try {
    // For now, use a default user ID (later we'll implement proper auth)
    const userId = 'default-user';
    const userRecipes = recipes.get(userId) || [];
    res.json(userRecipes);
  } catch (error) {
    console.error('Error fetching recipes:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/recipes
// @desc    Create a new recipe
// @access  Public (for now)
router.post('/', [
  body('name').not().isEmpty().withMessage('Recipe name is required'),
  body('ingredients').isArray().withMessage('Ingredients must be an array'),
  body('servings').isInt({ min: 1 }).withMessage('Servings must be a positive number'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = 'default-user';
    const userRecipes = recipes.get(userId) || [];
    
    const {
      name,
      description,
      category,
      servings,
      prepTime,
      cookTime,
      instructions,
      ingredients
    } = req.body;

    // Calculate costs
    const totalCost = ingredients.reduce((sum, ingredient) => {
      const cost = parseFloat(ingredient.cost) || 0;
      const quantity = parseFloat(ingredient.quantity) || 0;
      return sum + (cost * quantity);
    }, 0);

    const costPerServing = totalCost / servings;

    const newRecipe = {
      id: Date.now().toString(),
      name,
      description,
      category,
      servings: parseInt(servings),
      prepTime,
      cookTime,
      instructions,
      ingredients,
      totalCost,
      costPerServing,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    userRecipes.push(newRecipe);
    recipes.set(userId, userRecipes);

    res.status(201).json(newRecipe);
  } catch (error) {
    console.error('Error creating recipe:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   PUT api/recipes/:id
// @desc    Update a recipe
// @access  Public (for now)
router.put('/:id', [
  body('name').not().isEmpty().withMessage('Recipe name is required'),
  body('ingredients').isArray().withMessage('Ingredients must be an array'),
  body('servings').isInt({ min: 1 }).withMessage('Servings must be a positive number'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = 'default-user';
    const recipeId = req.params.id;
    const userRecipes = recipes.get(userId) || [];
    
    const recipeIndex = userRecipes.findIndex(recipe => recipe.id === recipeId);
    
    if (recipeIndex === -1) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    const {
      name,
      description,
      category,
      servings,
      prepTime,
      cookTime,
      instructions,
      ingredients
    } = req.body;

    // Calculate costs
    const totalCost = ingredients.reduce((sum, ingredient) => {
      const cost = parseFloat(ingredient.cost) || 0;
      const quantity = parseFloat(ingredient.quantity) || 0;
      return sum + (cost * quantity);
    }, 0);

    const costPerServing = totalCost / servings;

    const updatedRecipe = {
      ...userRecipes[recipeIndex],
      name,
      description,
      category,
      servings: parseInt(servings),
      prepTime,
      cookTime,
      instructions,
      ingredients,
      totalCost,
      costPerServing,
      updatedAt: new Date()
    };

    userRecipes[recipeIndex] = updatedRecipe;
    recipes.set(userId, userRecipes);

    res.json(updatedRecipe);
  } catch (error) {
    console.error('Error updating recipe:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   DELETE api/recipes/:id
// @desc    Delete a recipe
// @access  Public (for now)
router.delete('/:id', async (req, res) => {
  try {
    const userId = 'default-user';
    const recipeId = req.params.id;
    const userRecipes = recipes.get(userId) || [];
    
    const recipeIndex = userRecipes.findIndex(recipe => recipe.id === recipeId);
    
    if (recipeIndex === -1) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    userRecipes.splice(recipeIndex, 1);
    recipes.set(userId, userRecipes);

    res.json({ message: 'Recipe deleted successfully' });
  } catch (error) {
    console.error('Error deleting recipe:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   GET api/recipes/:id/cost-breakdown
// @desc    Get detailed cost breakdown for a recipe
// @access  Public (for now)
router.get('/:id/cost-breakdown', async (req, res) => {
  try {
    const userId = 'default-user';
    const recipeId = req.params.id;
    const userRecipes = recipes.get(userId) || [];
    
    const recipe = userRecipes.find(recipe => recipe.id === recipeId);
    
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    const breakdown = recipe.ingredients.map(ingredient => {
      const cost = parseFloat(ingredient.cost) || 0;
      const quantity = parseFloat(ingredient.quantity) || 0;
      const totalIngredientCost = cost * quantity;
      const percentageOfTotal = recipe.totalCost > 0 ? (totalIngredientCost / recipe.totalCost) * 100 : 0;

      return {
        name: ingredient.name,
        quantity: quantity,
        unit: ingredient.unit,
        costPerUnit: cost,
        totalCost: totalIngredientCost,
        percentageOfTotal: percentageOfTotal.toFixed(2)
      };
    });

    res.json({
      recipeId: recipe.id,
      recipeName: recipe.name,
      totalCost: recipe.totalCost,
      costPerServing: recipe.costPerServing,
      servings: recipe.servings,
      breakdown
    });
  } catch (error) {
    console.error('Error getting cost breakdown:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// @route   POST api/recipes/sync-menu-item
// @desc    Sync recipe cost with menu item
// @access  Public (for now)
router.post('/sync-menu-item', [
  body('recipeId').not().isEmpty().withMessage('Recipe ID is required'),
  body('menuItemId').not().isEmpty().withMessage('Menu item ID is required'),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = 'default-user';
    const { recipeId, menuItemId } = req.body;
    const userRecipes = recipes.get(userId) || [];
    
    const recipe = userRecipes.find(r => r.id === recipeId);
    
    if (!recipe) {
      return res.status(404).json({ message: 'Recipe not found' });
    }

    // Here you would update the menu item (product) with the recipe cost
    // For now, we'll return the cost data that can be used to update the menu item
    res.json({
      recipeId: recipe.id,
      recipeName: recipe.name,
      costPerServing: recipe.costPerServing,
      totalCost: recipe.totalCost,
      servings: recipe.servings,
      menuItemId
    });
  } catch (error) {
    console.error('Error syncing menu item:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;