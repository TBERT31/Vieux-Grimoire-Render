const User = require('../models/Users.model');
const bcrypt = require("bcrypt");
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

exports.signup = (req, res, next) => {
    // Vérification de l'email
    const emailRegex = /^[A-Za-z0-9._%-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,4}$/;
    if (!req.body.email || !emailRegex.test(req.body.email)) {
        return res.status(400).json({ message: "L'adresse email n'est pas valide." });
    }

    // Vérification de la longueur du mot de passe, 
    // ici les critères sont un peu nul pour avoir des mdp fort, 
    // en PROD nous aurions forcé au moins 1 
    // majuscule, minuscule, nombre et caractère spécial.
    if (!req.body.password || req.body.password.length < 8) {
        return res.status(400).json({ message: "Le mot de passe doit faire au moins 8 caractères." });
    }

    bcrypt.hash(req.body.password, 10)
        .then(hash => {
            const user = new User({
                email: req.body.email,
                password: hash
            });
            user.save()
                .then(() => {
                    res.status(201).json({message: "Utilisateur ajouté !"});
                })
                .catch(error => res.status(400).json({error}));
        })
        .catch(error => res.status(500).json({error}));
};

exports.login = (req, res, next) => {
    User.findOne({email: req.body.email})
        .then(user => {
            if(user === null){
                res.status(401).json({message: "Email ou mot de passe incorrecte."});
            }else{
                bcrypt.compare(req.body.password, user.password)
                    .then(valid => {
                        if(!valid){
                            res.status(401).json({message: "Email ou mot de passe incorrecte."});
                        }else{
                            res.status(200).json({
                                userId: user._id,
                                token: jwt.sign(
                                    {userId: user._id},
                                    process.env.SECRET_KEY_JWT,
                                    {expiresIn: '24h'}
                                )
                            })
                        }
                    })
                    .catch(error => res.status(500).json(error));
            }
        })
        .catch(error => res.status(500).json(error));
};

/******************************************************************
Pas forcément utile dans le cadre de l'app actuelle, mais je pense
que ces deux fonctions peuvent être très utile dans le cadre RGPD (delete) 
ou mdp oublié/changer d'email (modify)
et seront à implémenter dans le futur de l'application.
*******************************************************************/

// Peux être utiliser dans le cas d'un password oublié ou pour changer d'adresse mail
exports.modifyUser = (req, res, next) => {
    const userId = req.params.id; 

    if (req.auth.userId !== userId) {
        return res.status(403).json({ message: "Accès non autorisé." });
    }

    const updatedUser = {};
    if (req.body.email) {
        updatedUser.email = req.body.email;
        updateUser();
    }else if (req.auth.password) {
        bcrypt.hash(req.body.password, 10)
            .then(hash => {
                updatedUser.password = hash;
                updateUser();
            })
            .catch(error => res.status(500).json({ error }));
    }else{
        return res.status(400).json({ message: "Veuillez renseigner ce que vous voulez modifier." });
    }

    function updateUser() {
        User.findByIdAndUpdate(userId, updatedUser) 
            .then(updatedUser => {
                if (!updatedUser) {
                    return res.status(404).json({ message: "Utilisateur non trouvé." });
                }
                res.status(200).json({ message: "Utilisateur mis à jour avec succès." });
            })
            .catch(error => res.status(500).json({ error }));
    }
};

exports.deleteUser = (req, res, next) => {
    const userId = req.params.id; 

    if (req.auth.userId !== userId) {
        return res.status(403).json({ message: "Accès non autorisé." });
    }

    User.findByIdAndRemove(userId)
        .then(deletedUser => {
            if (!deletedUser) {
                return res.status(404).json({ message: "Utilisateur non trouvé." });
            }
            res.status(200).json({ message: "Utilisateur supprimé avec succès." });
        })
        .catch(error => res.status(500).json({ error }));
};

