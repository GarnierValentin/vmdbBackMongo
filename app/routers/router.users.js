import { Router } from 'express';
import usersController from '../controllers/users.controller.js';

const router = Router();

router.post('/register', usersController.registerUser);

export default router;