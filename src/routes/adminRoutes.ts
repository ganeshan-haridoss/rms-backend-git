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
  getDeliveryById,
  updateVpDelivery,
} from '../controllers/admin/delivery';
import { verifyTokenForAdmin } from '../middlewares/verifyTokenAndRole';

// Add verifyTokenAndRole as middleware to any function as mentioned below
// router.get('/getAllUsers', verifyTokenForAdmin, getAllUsers);

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
router.get('/getDeliveryById/:id', getDeliveryById);

router.post('/login', login);

export default router;
