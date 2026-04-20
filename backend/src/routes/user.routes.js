const { isAuth } = require('../middleware/auth.middleware');
const upload = require('../middleware/upload');

const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

router.get('/me', isAuth, userController.getMyProfile);
router.put('/me/profile-picture', isAuth, upload.single('profilePicture'), userController.updateMyProfilePicture);
router.get('/users', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.put('/:id', userController.updateUsername);

module.exports = router;