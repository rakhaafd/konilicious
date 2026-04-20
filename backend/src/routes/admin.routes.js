const express = require('express');
const router = express.Router();

const adminController = require('../controllers/admin.controller');
const { isAuth } = require('../middleware/auth.middleware');
const { isAdmin } = require('../middleware/isAdmin.middleware');
const upload = require('../middleware/upload');

router.use(isAuth, isAdmin);

// Dashboard
router.get('/dashboard', adminController.getDashboardSummary);

// User CRUD
router.get('/users', adminController.getUsers);
router.get('/users/:id', adminController.getUserById);
router.post('/users', adminController.createUser);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// Menu CRUD
router.get('/menus', adminController.getMenus);
router.get('/menus/:id', adminController.getMenuById);
router.post('/menus', upload.single('image'), adminController.createMenu);
router.put('/menus/:id', upload.single('image'), adminController.updateMenu);
router.delete('/menus/:id', adminController.deleteMenu);

// Rating CRUD
router.get('/ratings', adminController.getRatings);
router.get('/ratings/:id', adminController.getRatingById);
router.post('/ratings', adminController.createRating);
router.put('/ratings/:id', adminController.updateRating);
router.delete('/ratings/:id', adminController.deleteRating);

module.exports = router;
