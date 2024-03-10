const rateLimit = require('express-rate-limit');

// 20 tentatives, après on considères que c'est du spam pour essayer de cracker un mot de passe
const rateLimitationLogin = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 heure
    max: 20, // 20 tentatives
    message: 'Trop de requêtes de connexion depuis cette IP, veuillez réessayer plus tard.',
});

// 5 création de compte maxi par jour, au delà c'est suscpect.
const rateLimitationSignup = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 1 jour
    max: 5, // 5 tentative
    message: 'Trop de requêtes d\'inscription depuis cette IP, veuillez réessayer plus tard.',
});

// 30 créations, modifs, delete par minutes pour la même route, au délà cela ressemble beaucoup à des actions réalisées par des bots
const rateLimitationBook = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 30, // Limite à 30 requêtes par minute
    message: 'Trop de requêtes de gestion de livres depuis cette IP, veuillez réessayer plus tard.',
});

module.exports = {
    rateLimitationLogin,
    rateLimitationSignup,
    rateLimitationBook,
};
