#include <Arduino.h>
#include <ESP8266WiFi.h>

#define LIGHTWEIGHT 1   // manter esta ordem
#include <aREST.h>

/*
* Led que vem na placa do Wemos, útil para ver que está funcionando
*/
namespace statusLed {

  void init() {
    pinMode(LED_BUILTIN, OUTPUT);
  }

  void on() {
    digitalWrite(LED_BUILTIN, LOW);
  }

  void off() {
    digitalWrite(LED_BUILTIN, HIGH);
  }

  void toggle() {
    digitalWrite(LED_BUILTIN, !digitalRead(LED_BUILTIN));
  }

}

/*
* Configurações de rede WiFi
*/
namespace wifi {

  // autenticação
  const char * ssid = "casa2";
  const char * password = "casa1234";

  // Configurações de IP
  IPAddress ip(192, 168, 0, 200);
  IPAddress gateway(192, 168, 0, 1);
  IPAddress subnet(255, 255, 255, 0);

  // conecta-se à rede
  void connect() {
    WiFi.config(ip, gateway, subnet, gateway);
    WiFi.begin(ssid, password);
  }

  bool isConnected() {
    return WiFi.status() == WL_CONNECTED;
  }

}

/*
* Modelo conténdo as informações do dispositivo disponíveis
*/
namespace model {

  // variáveis para armazenar as leituras de sensores
  double temperature = 0.0;
  double humidity = 0.0;
  double luminosity = 0.0;
  double soundIntensity = 0.0;

  /*
  * Lê o sensor de temperatura
  */
  double readTemperature() {
    return random(0, 40);
  }

  /*
  * Lê o sensor de humidade
  */
  double readHumidity() {
    return random(0, 100);
  }

  /*
  * Lê o sensor de luminosidade
  */
  double readLuminosity() {
    return random(0, 160);
  }

  /*
  * Lê o sensor de sonoridade
  */
  double readSoundIntensity() {
    return random(0, 160);
  }

}

namespace controllers {

  /*
  * Liga o ar condicionado
  */
  int turnOn(String) {
    statusLed::on();
    delay(5000);
    statusLed::off();
    return 0;
  }

  /*
  * Desliga o ar condicionado
  */
  int turnOff(String) {
    statusLed::on();
    delay(5000);
    statusLed::off();
    return 0;
  }

  /*
  * Aumenta em uma unidade a temperatura do ar condicionado
  */
  int increaseTemperature(String) {
    statusLed::on();
    delay(5000);
    statusLed::off();
    return 0;
  }

  /*
  * Diminui em uma unidade a temperatura do ar condicionado
  */
  int decreaseTemperature(String) {
    statusLed::on();
    delay(5000);
    statusLed::off();
    return 0;
  }

}

// objeto de api rest e do servidor
WiFiServer server(80);
aREST rest = aREST();

void setup() {

  // inicia o led de estado
  statusLed::init();

  // inicia os pinos e as bibliotecas para ler os sensores

  // adiciona as variáveis de leitura
  rest.variable("temperature", &model::temperature);
  rest.variable("humidity", &model::humidity);
  rest.variable("luminosity", &model::luminosity);
  rest.variable("soundIntensity", &model::soundIntensity);

  // adiciona funções de controle
  rest.function("turn-on", controllers::turnOn);
  rest.function("turn-off", controllers::turnOff);
  rest.function("increase-temperature", controllers::increaseTemperature);
  rest.function("decrease-temperature", controllers::decreaseTemperature);

  // adiciona os identificadores
  rest.set_id("unique_device_id");
  rest.set_name("wemos");

  // inicia o servidor
  server.begin();
}

void loop() {

  // garante que o wemos está conectado à rede
  while (not wifi::isConnected()) {
    statusLed::off();
    wifi::connect();
    for (int i = 0; i < 5 and not wifi::isConnected(); i++) {
      statusLed::toggle();
      delay(1000);
    }
    statusLed::on();
  }

  // Lê os dados dos sensores
  model::temperature = model::readTemperature();
  model::humidity = model::readHumidity();
  model::luminosity = model::readLuminosity();
  model::soundIntensity = model::readSoundIntensity();

  // atualiza o servidor aREST
  WiFiClient client = server.available();
  if (client) {
    rest.handle(client);
    client.stop();
  }

  // pisca o led para indicar bom funcionamento
  static unsigned long lastUpdate = 0;
  unsigned long updateInterval = 300;
  unsigned long elapsedTime = millis() - lastUpdate;
  if (elapsedTime > updateInterval) {
    statusLed::toggle();
    delay(100);
    statusLed::toggle();
    lastUpdate += elapsedTime;
  }
}
