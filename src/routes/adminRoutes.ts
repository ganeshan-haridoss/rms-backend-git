import express from 'express';
import {
  createAdmin,
  createUser,
  getAllUsers,
  getPotentialVp,
  login,
} from '../controllers/admin/user';
import { createLevel, getAllLevels } from '../controllers/admin/level';
import {
  createDelivery,
  getAllDelivery,
  updateVpDelivery,
} from '../controllers/admin/delivery';

const router = express.Router();

router.post('/create-admin', createAdmin);
router.post('/create-user', createUser);
router.get('/getAllUsers', getAllUsers);
router.get('/getPotentialVp', getPotentialVp);

router.post('/create-level', createLevel);
router.get('/getAllLevels', getAllLevels);

router.post('/create-delivery', createDelivery);
router.put('/updateVp', updateVpDelivery);
router.get('/getAllDelivery', getAllDelivery);

router.post('/login', login);

export default router;
