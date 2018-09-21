'use strict';

var express = require('express');
var http = require('http');
var StateMachine = require('javascript-state-machine');
var Scene = require('mongoose').model('Scene');
var synaptic = require('synaptic');
var fs = require('fs');

// ###############################################################################################
// # Modelo
// ###############################################################################################

// um minuto
const ONE_MINUTE = 1000 * 60;

// frequência que as amostras são salvas no banco de dados
const SAMPLE_FREQUENCY = 20 * ONE_MINUTE;

// frequência que a rede toma decisões
var DECISION_FREQUENCY = 10 * ONE_MINUTE;

// endereço ip do dispositivo (wemos, arduino, etc)
const DEVICE_ADDR = '192.168.0.200';

// arquivo que armazena a rede neural
const NETWORK_FILE = 'network.json';

// mapa de comandos
let COMMANDS = [
    'nothing',    
    'increase-temperature',
    'decrease-temperature',
    'turn-on',
    'turn-off'
];

// cache para armazenar as leituras do dispositivo
var environmentCache = {
    temperature: 0,
    humidity: 0,
    luminosity: 0,
    soundIntensity: 0
};

// função auxiliar para enviar comandos ao dispositivo (e ter certeza de que foram recebidos)
let sendCommand = function(command, currentTry, maxTries) {
    http.get('http://' + DEVICE_ADDR + '/' + command)
    .on('error', (err) => {
        if (currentTry < maxTries) {
            sendCommand(command, currentTry + 1, maxTries);
        }
    });
}

// função auxiliar para ler dados do dispositivo (e ter certeza de que foram recebidos)
let getSensor = function(sensor, currentTry, maxTries) {
    http.get('http://' + DEVICE_ADDR + '/' + sensor, (socket) => {
        socket.on('data', (data) => {
            environmentCache[sensor] = parseInt(data.toString('utf8'));
        });
    }).on('error', (err) => {
        if (currentTry < maxTries) {
            getSensor(sensor, currentTry + 1, maxTries);
        }
    });
};

// máquina de estado que descreve o estado do serviço
var machine = new StateMachine({
    init: 'deactivated',
    transitions: [
        { name: 'activate', from: 'deactivated', to: 'activated' },
        { name: 'deactivate', from: 'activated', to: 'deactivated' }
    ],
    methods: {
        onActivate: function() {

            // função para ler dados e armazenar em cache
            let readData = function() {
                let sensors = ['temperature', 'humidity', 'luminosity', 'soundIntensity'];
                for (let sensor of sensors) {
                    getSensor(sensor, 0, 30);
                }
                if (machine.state === 'activated') {
                    setTimeout(readData, 500);
                }
            }
            readData();            

            // função para salvar os dados no banco
            let saveData = function() {                
                var scene = new Scene({
                    timestamp: new Date(),
                    environment: environmentCache,
                    action: COMMANDS.indexOf('nothing')
                });
                scene.save(err => {});
                if (machine.state === 'activated') {
                    setTimeout(readData, SAMPLE_FREQUENCY);
                }
            }
            saveData();
        }
    }
});

// rede neural que aprende a controlar a máquina
var file = fs.readFileSync(NETWORK_FILE);
var jsonFile = JSON.parse(file);
var network = new synaptic.Network.fromJSON(jsonFile);
var networkTrainer = new synaptic.Trainer(network);

// máquina de estado que descreve o estado do controlador
var smartController = new StateMachine({
    init: 'deactivated',
    transitions: [
        { name: 'activate', from: '*', to: 'activated' },
        { name: 'deactivate', from: '*', to: 'deactivated' }
    ],
    methods: {
        onActivate: function() {
            let decide = function() {

                // recebe as condições
                let input = [ 
                    environmentCache.temperature,
                    environmentCache.humidity,
                    environmentCache.luminosity,
                    environmentCache.soundIntensity
                ];

                // ativa a rede
                let activation = network.activate(input);

                // vê qual é a ação a ser tomada e aplica
                let maxValue = activation[0];
                for (let value of activation) {
                    maxValue = Math.max(maxValue, value);
                }
                let action = activation.indexOf(maxValue);
                sendCommand(COMMANDS[action], 0, 20);
                
                // repete
                if (smartController.state === 'activated') {
                    setTimeout(decide, DECISION_FREQUENCY);
                }
            };
            decide();
        }
    }
});

// ###############################################################################################
// # Rotas
// ###############################################################################################

// roteador
var router = express.Router();

// retorna os dados do dispositivo
router.get('/', function(req, res) {
    res.json(environmentCache)
});

// ativa o serviço de proxy do dispositivo
router.get('/activate', function(req, res) {
    machine.activate();
    res.send(machine.state);
});

// desativa o serviço de proxy do dispositivo
router.get('/deactivate', function(req, res) {
    machine.deactivate();
    res.send(machine.state);
});

// liga o ar condicionado
router.get('/turn-on', function(req, res) {
    sendCommand('turn-on', 0, 30);
    var scene = new Scene({
        timestamp: new Date(),
        environment: environmentCache,
        action: COMMANDS.indexOf('turn-on')
    });
    scene.save(err => {});
    res.json(environmentCache);
});

// desliga o ar condicionado
router.get('/turn-off', function(req, res) {
    sendCommand('turn-off', 0, 30);
    var scene = new Scene({
        timestamp: new Date(),
        environment: environmentCache,
        action: COMMANDS.indexOf('turn-off')
    });
    scene.save(err => {});
    res.json(environmentCache);
});

// aumenta a temperatura
router.get('/increase-temperature', function(req, res) {
    sendCommand('increase-temperature', 0, 30);
    var scene = new Scene({
        timestamp: new Date(),
        environment: environmentCache,
        action: COMMANDS.indexOf('increase-temperature')
    });
    scene.save(err => {});
    res.json(environmentCache);
});

// diminui a temperatura
router.get('/decrease-temperature', function(req, res) {
    sendCommand('decrease-temperature', 0, 30);
    var scene = new Scene({
        timestamp: new Date(),
        environment: environmentCache,
        action: COMMANDS.indexOf('decrease-temperature')
    });
    scene.save(err => {});
    res.json(environmentCache);
});

// ativa o serviço de controle automatico
router.get('/activate-controller', function(req, res) {
    smartController.activate();
    res.send(smartController.state);
});

// desativa o serviço de controle automatico
router.get('/deactivate-controller', function(req, res) {
    smartController.deactivate();
    res.send(smartController.state);
});

// treina a rede neural
router.get('/train-controller', function(req, res) {
    Scene.find({}, function(err, scenes) {
        if (err) {
            res.send(err);
        }
        
        // dataset de treino
        let trainingset = [];
        for (let scene of scenes) {
                        
            let action = [];
            for (let i = 0; i < 3; i++) {
                if (i == scene.action) {
                    action.push(1.0);
                } else {
                    action.push(0.0);
                }
            }

            trainingset.push({
                input: [ 
                    scene.temperature, 
                    scene.humidity,
                    scene.luminosity,
                    scene.soundIntensity
                ],
                output: action
            });        
        }

        // treina
        networkTrainer.train(trainingset);

        // salva a rede
        let networkJson = network.toJSON();
        fs.writeFile(NETWORK_FILE, JSON.stringify(networkJson), 'utf8');
        res.send("trained");
    });
});

module.exports = router;
