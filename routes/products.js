const express = require('express');
const { body, validationResult } = require('express-validator');
const Product = require('../models/Product');

const router = express.Router();

// Get all products (with industry filter)
router.get('/', async (req, res) => {
  try {
    const { industry, category, search } = req.query;
    let query = { isActive: true };

    if (industry) {
      query.industry = industry;
    }

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { sku: { $regex: search, $options: 'i' } }
      ];
    }

    const products = await Product.find(query).sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new product
router.post('/', [
  body('name').notEmpty().withMessage('Product name is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('cost').isFloat({ min: 0 }).withMessage('Cost must be a positive number'),
  body('industry').isIn(['food-beverage', 'healthcare', 'retail', 'manufacturing', 'services']).withMessage('Invalid industry')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      name,
      description,
      category,
      price,
      cost,
      sku,
      barcode,
      stockQuantity,
      minStockLevel,
      unit,
      supplier,
      industry
    } = req.body;

    // Generate SKU if not provided
    let finalSku = sku;
    if (!sku) {
      const count = await Product.countDocuments();
      finalSku = `SKU-${Date.now()}-${count + 1}`;
    }

    const product = new Product({
      name,
      description,
      category,
      price,
      cost,
      sku: finalSku,
      barcode,
      stockQuantity: stockQuantity || 0,
      minStockLevel: minStockLevel || 10,
      unit: unit || 'piece',
      supplier,
      industry
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    console.error('Create product error:', error);
    if (error.code === 11000) {
      return res.status(400).json({ message: 'SKU already exists' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

// Update product
router.put('/:id', [
  body('name').notEmpty().withMessage('Product name is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('price').isFloat({ min: 0 }).withMessage('Price must be a positive number'),
  body('cost').isFloat({ min: 0 }).withMessage('Cost must be a positive number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    res.json(updatedProduct);
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete product (soft delete)
router.delete('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.isActive = false;
    await product.save();

    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update stock quantity
router.patch('/:id/stock', [
  body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    product.stockQuantity = req.body.quantity;
    await product.save();

    res.json(product);
  } catch (error) {
    console.error('Update stock error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get low stock products
router.get('/low-stock/:industry', async (req, res) => {
  try {
    const products = await Product.find({
      industry: req.params.industry,
      isActive: true,
      $expr: { $lte: ['$stockQuantity', '$minStockLevel'] }
    });

    res.json(products);
  } catch (error) {
    console.error('Get low stock error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 