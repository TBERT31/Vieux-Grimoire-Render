const mongoose = require('mongoose');

// Si j'envoie une note je veux que les deux informations soient remplies
const ratingSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  grade: { type: Number, required: true },
});

const bookSchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  year: { type: Number, required: true },
  genre: { type: String, required: true },
  averageRating: { type: Number, required: false }, // Le front force ces infos mais je ne les considère pas obligatoire fonctionnellement à confirmer.
  ratings: { type: [ratingSchema], required: false }, // Le front force ces infos mais je ne les considère pas obligatoire fonctionnellement à confirmer.
  userId: { type: String, required: true },
  imageUrl: { type: String, required: false }, // Le front force ces infos mais je ne les considère pas obligatoire fonctionnellement à confirmer.
});

module.exports = mongoose.model('Book', bookSchema);