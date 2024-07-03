import { Router } from 'express';
import usersController from '../controllers/users.controller.js';

const router = Router();

router.post('/register', usersController.registerUser);
router.post('/login', usersController.loginUser);
router.get('/favorites', usersController.getFavoriteMovies);
router.post('/addFavorite', usersController.addFavoriteMovie);
router.delete('/removeFavorite', usersController.removeFavoriteMovie);

export default router;