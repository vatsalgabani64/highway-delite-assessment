import { Router } from 'express';
import { signup, verifyOtp,login,verifyLoginOtp, googleLogin, getCurrentUser  } from '../controllers/authController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

router.post('/signup', signup);
router.post('/verify-otp', verifyOtp);

router.post('/login', login);  
router.post('/verify-login-otp', verifyLoginOtp);  
router.post('/google',googleLogin);

router.get('/me', authMiddleware, getCurrentUser);

export default router;