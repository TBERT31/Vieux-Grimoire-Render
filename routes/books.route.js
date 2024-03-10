const express = require('express');
const router = express.Router();
const bookCtrl = require('../controllers/books.controller');
const auth = require('../middlewares/auth');
const multer = require('../middlewares/multer-config');
const imageOptimizer = require('../middlewares/sharp-img-optimizer');
const rateLimits = require('../middlewares/rate-limit');

// Dans la doc il est demandé d'avoir pour chaque route des livres une auth, 
// Cependant sans headers avec authorisation pour les requêtes côté front 
// ça va être compliqué ...
router.get('/', /*auth,*/ bookCtrl.getAllBooks); 
router.get('/bestrating', /*auth,*/ bookCtrl.getBestRatingBooks); // Ici Attention à l'ordre sinon la route /:id peut prendre le dessus sur /bestrating
router.get('/:id', /*auth,*/ bookCtrl.getOneBook);
router.post('/', auth, rateLimits.rateLimitationBook, multer, imageOptimizer, bookCtrl.createBook);
router.put('/:id', auth, rateLimits.rateLimitationBook, multer, imageOptimizer, bookCtrl.modifyBook);
router.delete('/:id', auth, rateLimits.rateLimitationBook, bookCtrl.deleteBook);
router.post('/:id/rating', auth, rateLimits.rateLimitationBook, bookCtrl.addBookRate); 

// Non demandé mais pratique à faire dans le futur, 
// la différenciation entre le call post ou put doit-être fait côté frontend
router.put('/:id/rating', auth, rateLimits.rateLimitationBook, bookCtrl.modifyBookRate);

module.exports = router;