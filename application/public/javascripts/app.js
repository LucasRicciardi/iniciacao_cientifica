'use strict';

// ##############################################################################
// # Configurações
// ##############################################################################

// tamanho do buffer para mostrar nos gráficos
const BUFFER_LENGTH = 10;

// ##############################################################################
// # Template de gráfico do site
// ##############################################################################

// cria uma label
let createLabel = function() {
    return new Array(BUFFER_LENGTH).fill(0);
}

// cria um conjunto de dados vazio
let createData = function() {
    return new Array(BUFFER_LENGTH).fill(0);
}

let createChart = function(canvasid, chartlabel, min, max) {
    let ctx = document.getElementById(canvasid).getContext("2d"); 
    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: createLabel(),
            datasets: [{
                label: chartlabel,
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                borderColor: 'rgba(0, 0, 0, 1.0)',
                data: createData()
            }]
        },
        options: {
            scales: {
                xAxes: [{
                    display: false
                }],
                yAxes: [ {
                    display: true,
                    ticks: {
                        min: min,
                        max: max
                    }
                }]
            }
        }
    });
}

// ##############################################################################
// # Variáveis de estado do cliente
// ##############################################################################

// Gráficos
let temperatureChart = createChart('temperature-chart', 'Temperatura (°C)', 0, 40);
let humidityChart = createChart('humidity-chart', 'Umidade Relativa do Ar (%)', 0, 100);
let luminosityChart = createChart('luminosity-chart', 'Luminosidade (lux)', 0, 160);
let soundChart = createChart('sound-chart', 'Intensidade do Som (db)', 0, 160);

// estado da inteligência artificial
let ia = { activated: false, training: false };

// ##############################################################################
// # Registra os callbacks da página
// ##############################################################################

// atualiza a página
setInterval(function() {
    $.get('api/device-proxy', function(data) {
        
        // atualiza o mostrador de temperatura
        $("#temperature-display").text(data.temperature + '°C');

        // função que atualiza os gráficos
        let updateChart = function(chart, newValue) {
            for (let i = 1; i < BUFFER_LENGTH; i++) {
                chart.data.labels[i-1] = chart.data.labels[i];
                chart.data.datasets[0].data[i-1] = chart.data.datasets[0].data[i]; 
            }
            chart.data.labels[BUFFER_LENGTH-1] = new Date();
            chart.data.datasets[0].data[BUFFER_LENGTH-1] = newValue;
        }
        updateChart(temperatureChart, data.temperature);
        updateChart(humidityChart, data.humidity);
        updateChart(luminosityChart, data.luminosity);
        updateChart(soundChart, data.sound_intensity);

        // atualiza os grafícos
        temperatureChart.update();
        humidityChart.update();
        luminosityChart.update();
        soundChart.update();
    });

}, 1000);

$("#activate-proxy").click(function() {    
    $.get('api/device-proxy/activate', function(data) {

    });
});

$("#deactivate-proxy").click(function() {
    $.get('api/device-proxy/deactivate', function(data) {

    });
});

// diminui a temperatura do ar condicionado
$("#decrease-temperature").click(function() {
    $.get('api/device-proxy/increase-temperature', function(data) {

    });
});

// aumenta a temperatura do ar condicionado
$("#increase-temperature").click(function() {
    $.get('api/device-proxy/increase-temperature', function(data) {

    });
});

// desativa a inteligência artificial
$("#deactivate-ai").click(function() {
    $.get('api/device-proxy/deactivate-controller', function(data) {

    });
});

// ativa a inteligência artificial
$("#activate-ai").click(function() {
    $.get('api/device-proxy/activate-controller', function(data) {

    });
});

// treina a ia
$("#train-ai").click(function() {
    $.get('api/device-proxy/train-controller', function(data) {

    });
});

// liga o ar condicionado
$("#turn-on").click(function() {
    $.get('api/device-proxy/turn-on', function(data) {

    });
});

// desliga o ar condicionado
$("#turn-off").click(function() {
    $.get('api/device-proxy/turn-off', function(data) {

    });
});

