import express from 'express';
import {
  createProject,
  getAllProjects,
  updateProjectStatus,
} from '../controllers/manager/project';
import { verifyTokenAndRole } from '../middlewares/verifyTokenAndRole';

// Add verifyTokenAndRole as middleware to any function as mentioned below
// router.get('/getAllProjects', verifyTokenAndRole('MANAGER'), getAllProjects);

const router = express.Router();

router.post('/create-project', createProject);
router.get('/getAllProjects', getAllProjects);
router.put('/update-project-status', updateProjectStatus);

export default router;
