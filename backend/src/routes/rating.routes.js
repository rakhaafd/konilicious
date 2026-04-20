const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/rating.controller');
const { isAuth } = require('../middleware/auth.middleware');

router.get('/menu/:menuId', ratingController.getRatingsByMenu);
router.post('/menu/:menuId', isAuth, ratingController.createRating);
router.put('/:id', isAuth, ratingController.updateMyRating);
router.delete('/:id', isAuth, ratingController.deleteMyRating);

module.exports = router;
