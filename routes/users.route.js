const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/users.controller');
const auth = require('../middlewares/auth');
const rateLimits = require('../middlewares/rate-limit');

router.post('/signup', rateLimits.rateLimitationSignup, userCtrl.signup);
router.post('/login', rateLimits.rateLimitationLogin, userCtrl.login);

//Pour aller plus loin
router.patch('/user/:id', auth, userCtrl.modifyUser);
router.delete('/user/:id', auth, userCtrl.deleteUser);

module.exports = router;