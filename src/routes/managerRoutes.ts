import express from 'express';
import {
  createProject,
  getAllProjects,
  updateProjectStatus,
} from '../controllers/manager/project';

const router = express.Router();

router.post('/create-project', createProject);
router.get('/getAllProjects', getAllProjects);
router.put('/update-project-status', updateProjectStatus);

export default router;
