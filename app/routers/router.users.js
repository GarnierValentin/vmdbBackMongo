import { Router } from 'express';
import { loginLimiter } from '../middlewares/limiters.js';
import usersController from '../controllers/users.controller.js';

const router = Router();

router.post('/register', loginLimiter, usersController.registerUser);
router.post('/login', loginLimiter ,usersController.loginUser);
router.get('/favorites', usersController.getFavoriteMovies);
router.post('/addFavorite', usersController.addFavoriteMovie);
router.delete('/removeFavorite', usersController.removeFavoriteMovie);

export default router;