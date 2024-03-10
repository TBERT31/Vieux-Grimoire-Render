const multer = require('multer');
const uuid = require('uuid'); // Pour générer des noms de fichiers unique

// const MIME_TYPES = {
//   'image/jpg': 'jpg',
//   'image/jpeg': 'jpg',
//   'image/png': 'png', 
//   'image/webp': 'webp',
//   'image/avif': 'avif'
// };

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, 'images');
  },
  filename: (req, file, callback) => {
    let name = file.originalname.split(' ').join('_'); // On remplace les espaces par des underscore pour éviter les bugs dans le name
    name = name.split('.').slice(0, -1).join('.'); // On retire l'extension du nom de fichier
    //const extension = MIME_TYPES[file.mimetype]; // On passe au format avif ultra optimisé pour le web
    callback(null, name + uuid.v4() + '.' + 'avif'); // uuid > Date.now(), à grande échelle deux users peuvent très bien enregistrer un même nom d'image au meme moment.
  }
});

module.exports = multer({storage: storage}).single('image');