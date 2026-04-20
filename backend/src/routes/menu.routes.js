const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const menuController = require('../controllers/menu.controller');
const { isAuth } = require('../middleware/auth.middleware');
const { isAdmin } = require('../middleware/isAdmin.middleware');

router.get('/', menuController.getAllMenu);
router.get('/:id', menuController.getMenuById);
router.post('/add', isAuth, isAdmin, upload.single('image'), menuController.addMenu);
router.put('/:id', isAuth, isAdmin, menuController.updateMenu);
router.delete('/all', isAuth, isAdmin, menuController.deleteAllMenu);
router.delete('/:id', isAuth, isAdmin, menuController.deleteMenuById);


module.exports = router;