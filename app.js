const express = require("express");
const mongoose = require("mongoose");
const app = express();
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();

// Import des routers
const bookRoutes = require("./routes/books.route");
const userRoutes = require("./routes/users.route");

// Connection à la BDD Mongodb Atlas
mongoose.connect(process.env.MONGODB_URI,
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !')
);

// Résout le problème de undefind dans le body
app.use(express.json());

// Peux se résoudre avec le package cors app.use(cors); 
// pour solutionner le problème de sécurité côté browser 
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000'); // Permet d'accéder à notre API depuis seulement l'url du frontend, mieu que * pour des raisons de sécurité !
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization'); // Permet d'ajouter les headers mentionnés aux requêtes envoyées vers notre API (Origin , X-Requested-With , etc.) ;
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS'); // Permet d'envoyer des requêtes avec les méthodes mentionnées ( GET ,POST , etc.)
    next();
});

// Settings routes
app.use('/api/books', bookRoutes);
app.use('/api/auth', userRoutes);
app.use('/images', express.static(path.join(__dirname, 'images')));

module.exports = app;