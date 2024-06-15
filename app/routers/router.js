import { Router } from 'express';
import movieController from '../controllers/movie.controller.js';
const router = Router();

router.get('/', (req, res) => {
    console.log('Received a request at /');
    res.send('Server is running correctly');
});

router.get('/movie', movieController.getMoviesByTitle);
router.get('/top-rated', movieController.getTopRatedMovies);
router.get('/movie/:id', movieController.getMovieById);
router.get('/movie/:title', movieController.getMovieByTitle);

export default router;