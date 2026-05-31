const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const converterController = require('../controllers/converterController');
const authenticate = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

// [POST] Create & Action
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/convert', authenticate, upload.single('image'), converterController.convertImage);
router.post('/upgrade', authenticate, authController.upgradeToPro);

// [GET, PUT, DELETE] CRUD Profile
router.get('/profile', authenticate, authController.getProfile);
router.put('/profile', authenticate, authController.updateProfile);       // Endpoint Update
router.delete('/profile', authenticate, authController.deleteProfile);    // Endpoint Delete

module.exports = router;