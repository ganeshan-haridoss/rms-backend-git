import express from 'express';
import { changePassword, login } from '../controllers/common/login';

const router = express.Router();

router.post('/login', login);
router.put('/change-password', changePassword);

export default router;
