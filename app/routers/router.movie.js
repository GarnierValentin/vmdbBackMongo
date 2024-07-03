import { Router } from 'express';
import movieController from '../controllers/movie.controller.js';

const router = Router();

router.get('/top-rated', movieController.getTopRatedMovies);
router.get('/movie/:id', movieController.getMovieById);
router.get('/movie', movieController.getMoviesByTitle);

export default router;