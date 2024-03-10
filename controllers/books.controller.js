const Book = require("../models/Books.model");
const fs = require("fs");

exports.getAllBooks = (req,res,next) => {
    Book.find()
      .then(books => res.status(200).json(books))
      .catch(error => res.status(400).json({error}));
};

exports.getOneBook = (req,res,next) => {
    Book.findOne({_id: req.params.id})
    .then(book => res.status(200).json(book))
    .catch(error => res.status(404).json({error}));
};

// Les méthodes sort + limit comme ceci évite de findAll puis de parcourir la liste en JS
// Ce qui serait bien trop consommateur de ressources avec de grande qté de livres
exports.getBestRatingBooks = async (req, res, next) => {
    try {
      const books = await Book.find()
        .sort({ averageRating: -1 }) // Tri par note moyenne décroissante
        .limit(3); // Limiter les résultats à 3
      res.status(200).json(books);
    } catch (error) {
      res.status(500).json({error});
    }
};

exports.createBook = (req, res, next) => {
    console.log(req.body);
    const bookObject = JSON.parse(req.body.book);

    const { title, author, year, genre, ratings} = bookObject;

    if (!title || !author || !year || !genre) {
      res.status(400).json({ message: "Veuillez fournir toutes les informations requises pour créer un livre." });
      return;
    }

    if (Array.isArray(ratings) && ratings.length > 0) {
      for (const rating of ratings) {
          if (rating.grade < 0 || rating.grade > 5 || typeof rating.grade !== 'number' || !Number.isInteger(rating.grade)) {
              res.status(400).json({ message: "La note attribuée au livre doit être un entier entre 0 et 5." });
              return;
          }
      }
    }

    const book = new Book({
      title,
      author,
      year,
      genre,
      userId: req.auth.userId,
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
      ratings: ratings,
      averageRating: calculateAverageRating(ratings),
    });

    book.save()
      .then(() => {
        res.status(201).json({
          message: 'Livre ajouté !',
          book: book
        });
      })
      .catch(error => res.status(400).json({error}))
};

exports.modifyBook = (req, res, next) => {
    const bookObject = req.file ? {
      ...JSON.parse(req.body.book),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
    } : {...req.body};

    delete bookObject._userId;
    Book.findOne({_id: req.params.id})
      .then(book => {

        if(book.userId !== req.auth.userId){
          res.status(403).json({message: 'Non authorisé à modifier ce livre.'});
        }
        else
        {
          if(bookObject.imageUrl === book.imageUrl){
            updateBook();
          }else{
            const filename = book.imageUrl.split('/images/')[1];
            fs.unlink(`images/${filename}`, () => {
              updateBook();
            });
          }
        }
      })
      .catch(error => res.status(400).json({error}));

      function updateBook(){
        Book.updateOne({_id: req.params.id}, {...bookObject, _id: req.params.id})
        .then(() => {
          res.status(200).json({message: 'Livre modifié !'});
        })
        .catch(error => res.status(400).json({error}));
      }
};

exports.deleteBook = (req, res, next) => {
    Book.findOne({_id: req.params.id})
      .then(book => {
        if(book.userId !== req.auth.userId){
          res.status(403).json({message: 'Non authorisé à supprimer ce livre.'});
        }else{
          const filename = book.imageUrl.split('/images/')[1];
          fs.unlink(`images/${filename}`, () => {
            Book.deleteOne({_id: req.params.id})
            .then(() => {
              res.status(200).json({message: 'Livre supprimé !', book: book});
            })
            .catch(error => res.status(400).json({error}));
          });
        }
      })
      .catch(error => res.status(500).json({error}));
};

exports.addBookRate = async (req, res, next) => {
  try{
    const id = req.params.id;

    //Gère le problème côté front, après un fail request les infos du book passe en 'undefined'
    if(id == null || id == 'undefined'){
      res.status(400).json({message: "L'id du livre est manquant."});
      return;
    }

    const book = await Book.findById(id);

    // Gère l'erreur où l'id du livre est inexistant
    if(book === null){
      res.status(404).json({message: "Le livre que vous essayez de noter n'existe pas."});
      return;
    }

    // On va chercher la liste des notes pour le livre en question
    const ratingsInDb = book.ratings;

    // On cherche si l'utilisateur à déjà voté
    const alreadyRatingByUser = ratingsInDb.find(rating => rating.userId === req.auth.userId);

    if(alreadyRatingByUser){
      res.status(400).json({message: 'Vous avez déjà noté ce livre, essayez plutôt de modifier votre note.'});
    }else{
      const newRating = { userId: req.auth.userId, grade: req.body.rating};
      const updatedRatings = [...ratingsInDb, newRating];
      book.ratings = updatedRatings;
      book.averageRating = calculateAverageRating(updatedRatings);
      await book.save();
      res.status(201).json({message: 'Livre noté !', book: book});
    }

  }catch(error){
    res.status(500).json({error});
  }
};


exports.modifyBookRate = async (req, res, next) => {
  try {
    const id = req.params.id;

    if (id == null || id == 'undefined') {
      res.status(400).json({ message: "L'id du livre est manquant." });
      return;
    }

    const book = await Book.findById(id);

    if (book === null) {
      res.status(404).json({ message: "Le livre que vous essayez de noter n'existe pas." });
      return;
    }

    const ratingsInDb = book.ratings;

    const alreadyRatingByUser = ratingsInDb.find((rating) => rating.userId === req.auth.userId);

    if (alreadyRatingByUser) {
      const updatedRatings = ratingsInDb.filter((rating) => rating.userId !== req.auth.userId);

      const newRating = {
        userId: req.auth.userId,
        grade: req.body.rating,
      };

      updatedRatings.push(newRating);

      book.ratings = updatedRatings;
      book.averageRating = calculateAverageRating(updatedRatings);

      await book.save();

      res.status(200).json({ message: 'Note du livre mise à jour !', book: book });

    } else {
      res.status(400).json({ message: "Vous n'avez pas encore noté ce livre, il vous faut ajouter une 1ère note d'abord." });
    }
  } catch (error) {
    res.status(500).json({ error });
  }
};

function calculateAverageRating(ratings){
  const sumOfAllGrades = ratings.reduce((sum, rating) => {
    return (sum + rating.grade);
  }, 0);

  return sumOfAllGrades/(ratings.length);
}