const express = require('express');
const router = express.Router();
const FAQ = require('../models/FAQ');
const auth = require('../middleware/auth');
const { autoGenerateFAQs } = require('../ml/openaiService');

// Get all FAQs
router.get('/', auth, async (req, res) => {
  try {
    const faqs = await FAQ.find({ businessId: req.business._id }).sort({ useCount: -1 });
    res.json({ faqs });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create FAQ
router.post('/', auth, async (req, res) => {
  try {
    const { question, answer, category, tags } = req.body;
    if (!question || !answer) return res.status(400).json({ error: 'Question and answer required' });
    const faq = await FAQ.create({ businessId: req.business._id, question, answer, category, tags });
    res.status(201).json({ faq });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Bulk create FAQs
router.post('/bulk', auth, async (req, res) => {
  try {
    const { faqs } = req.body;
    if (!Array.isArray(faqs)) return res.status(400).json({ error: 'FAQs must be an array' });
    const created = await FAQ.insertMany(faqs.map(f => ({ ...f, businessId: req.business._id })));
    res.status(201).json({ faqs: created, count: created.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Auto-generate FAQs using AI
router.post('/auto-generate', auth, async (req, res) => {
  try {
    const { businessInfo } = req.business;
    const generatedFaqs = await autoGenerateFAQs(businessInfo, req.business.businessName);
    
    if (generatedFaqs.length === 0) {
      return res.status(400).json({ error: 'Could not generate FAQs. Please add more business info.' });
    }
    
    const created = await FAQ.insertMany(
      generatedFaqs.map(f => ({ ...f, businessId: req.business._id }))
    );
    res.json({ faqs: created, message: `Generated ${created.length} FAQs successfully!` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update FAQ
router.put('/:id', auth, async (req, res) => {
  try {
    const faq = await FAQ.findOneAndUpdate(
      { _id: req.params.id, businessId: req.business._id },
      req.body,
      { new: true }
    );
    if (!faq) return res.status(404).json({ error: 'FAQ not found' });
    res.json({ faq });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete FAQ
router.delete('/:id', auth, async (req, res) => {
  try {
    await FAQ.findOneAndDelete({ _id: req.params.id, businessId: req.business._id });
    res.json({ message: 'FAQ deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
