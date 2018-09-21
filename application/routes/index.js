var express = require('express');
var router = express.Router();

// todos os serviços usados pela api
router.use('/api/scenes', require('./api/scene-model'));
router.use('/api/device-proxy', require('./api/device-proxy'));

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { 
    title: 'Controlador de Ar Condicionado',
    ai: {
      activated: false
    }
  });
});

module.exports = router;
