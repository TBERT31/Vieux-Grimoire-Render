const sharp = require('sharp');
const fs = require('fs');

sharp.cache(false);

const imageOptimizer = (req, res, next) => {
  if (!req.file) {
    return next();
  }

  const options = {
    fit: sharp.fit.inside,
    withoutEnlargement: true,
    width: 405,
    height: 570,
    quality: 80,
  };

  sharp(req.file.path)
    .resize(options)
    .toBuffer()
    .then((buffer) => {
      fs.writeFile(req.file.path, buffer, (err) => {
        if (err) {
          console.error(`Erreur lors de l'écriture du fichier optimisé : ${err}`);
          return next();
        }
        next();
      });
    })
    .catch((err) => {
      console.error(`Erreur lors de l'optimisation de l'image : ${err}`);
      return next();
    });
};

module.exports = imageOptimizer;
