var express = require('express');
var router = express.Router();

// ###############################################################################################
// # Model
// ###############################################################################################

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var SceneSchema = new Schema({
    timestamp: Date,
    environment: {
        temperature: Number,
        humidity: Number,
        luminosity: Number,
        soundIntensity: Number
    },
    action: Number
});

var Scene = mongoose.model('Scene', SceneSchema);

// ###############################################################################################
// # Routes
// ###############################################################################################

// retorna a lista com todas as cenas registradas
router.get('/', function(req, res) {
    Scene.find({}, function(err, scenes) {
        if (err) {
            res.send(err);
        }
        res.json(scenes);
    });
});

// cria uma nova cena e insere no banco de dados
router.post('/', function(req, res) {
    
    // cria uma nova cena
    let scene = new Scene({
        timestamp: new Date(),
        environment: {
            temperature: req.body.temperature,
            humidity: req.body.humidity,
            luminosity: req.body.luminosity,
            soundIntensity: req.body.soundIntensity
        },
        action: req.body.action
    });

    // salva no banco de dados e retorna
    scene.save(err => { 
        if (err) {
            res.send(err);
        }
        res.json(scene);
    });

});

module.exports = router;
