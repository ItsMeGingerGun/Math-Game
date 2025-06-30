const express = require('express');
const router = express.Router();

router.post('/', (req, res) => {
  res.json({ status: 'Game API working' });
});

module.exports = router;
