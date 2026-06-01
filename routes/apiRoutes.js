const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const converterController = require('../controllers/converterController');
const authenticate = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

//auth
router.post('/register', authController.register);
router.post('/login', authController.login);

//konversi upgrade
router.post('/convert', authenticate, upload.single('image'), converterController.convertImage);
router.post('/upgrade', authenticate, authController.upgradeToPro);

//crud
router.get('/profile', authenticate, authController.getProfile);
router.put('/profile', authenticate, authController.updateProfile);       
router.delete('/profile', authenticate, authController.deleteProfile);    

//riwayat
router.get('/history', authenticate, authController.getConversionHistory);
router.get('/upgrade-logs', authenticate, authController.getUpgradeLogs);

module.exports = router;