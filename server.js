const http = require('http');
const app = require('./app');
const dotenv = require('dotenv');
dotenv.config();

// Cette fonction est utilisée pour normaliser le port sur lequel le serveur écoutera.
const normalizePort = val => {
  // Tente de convertir val en entier (base 10).
  const port = parseInt(val, 10);

  // Si la valeur n'est pas convertible en entier retourne val
  if (isNaN(port)) {
    return val;
  }
  // Si port est bien supp ou égal à 0 on renvoi le port convertit en entier
  if (port >= 0) {
    return port;
  }

  // Si les deux cas précédent ont échoué on renvoi faux
  return false;
};

// On utilise normalizePort pour assigné 4000 ou la variable d'environnement PORT à la nouvelle variable
const port = normalizePort(process.env.PORT || '4000');

// On paramètre le port de notre app express sur la variable port.
app.set('port', port);

// Cette fonction est destinée à gérer les erreurs lors du démarrage du serveur.
const errorHandler = error => {
  // Si l'erreur n'est pas liée à l'écoute du serveur, pn déclenche une exception.
  if (error.syscall !== 'listen') {
    throw error;
  }

  const address = server.address();
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port: ' + port;

  switch (error.code) {
    // Erreur due à des privilèges insuffisants
    case 'EACCES':
      console.error(bind + ' requires elevated privileges.');
      process.exit(1);
      break;
    // Erreur due au port déjà en cours d'utilisation 
    case 'EADDRINUSE':
      console.error(bind + ' is already in use.');
      process.exit(1);
      break;
    // Autre erreur, on déclanche un exception
    default:
      throw error;
  }
};

const server = http.createServer(app);

// Gestionnaire d'erreur: en cas d'erreur lors du démarrage du serveur. Il exécute la fonction errorHandler pour gérer les erreurs.
server.on('error', errorHandler);

// Gestionnaire d'écoute: lorsque le serveur commence à écouter sur un port. Il affiche un message pour indiquer sur quel port le serveur écoute.
server.on('listening', () => {
  const address = server.address();
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port;
  console.log('Listening on ' + bind);
});

// Démarrage du serveur
server.listen(port);
