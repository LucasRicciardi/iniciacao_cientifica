# Controlador de Ar Condicionado
## Projeto de Iniciação Científica, Senac
### 1 - Programação do MCU (Wemos)
#### 1.1 - Setup do Ambiente
Para começar, baixe o editor de texto Atom (https://atom.io/) e instale.
Depois, abra o editor de texto e depois abra o menu de configurações do editor (File -> Settings), 
e procure pela opção Install.

No menu que se abrir, digite na barra de buscas platformio-ide e instale a opção com o nome correspondente.
Durante a instalação será solicita a instalação do **CLANG**, quando isto acontecer **RECUSE** pois
não é necessário para gravação do firmware simples que faremos e além do mais, este **plugin (PlatformIO)** por
si só tende a ter problemas com as atualizações, o CLANG seria mais um componente para proliferar os bugs.

Após o uso deste **plugin (PlatformIO)** eu recomendo a desinstação do mesmo, caso queria continuar a usa o Atom como editor,
ou a instalação de um outro editor de texto, que é o que faremos a seguir.
Segue um link, em inglês, com imagens para auxiliar na instalação do PlatformIo (http://docs.platformio.org/en/latest/ide/atom.html#installation)
 
#### 1.2 - Download das bibliotecas
Com o editor de texto **Atom** aberto, procure no menu principal a opção **PlatformIO -> PlatformIO Home**.
Na página que se abrir, procure no menu pela opção **Libraries**, digite na barra de busca **"aREST"**
e instale **apenas a opção com o nome correspondente** (pode surgir uma opção com nome aREST UI ou bREST, não instale nenhuma destas).

#### 1.3 - Setup do Projeto
Vá até a página principal deste projeto e selecione a opção **"Clone or download -> Download Zip"** para fazer download deste projeto.
Extraia o conteúdo do zip, renomeie a pasta **"iniciacao-cientifica-master"** para **"iniciacao-cientifica"** e copie esta pasta
para o seu Desktop.

Com o editor de texto **Atom** aberto, vá novamente na opção **PlatformIO -> PlatformIO Home** e deste vez selecione no menu
a opção **Home**. Selecione no menu Quick Access a opção **"Open Project"**. Navegue até o diretório do projeto 
e abra o projeto **"Firmware"**. Caso tudo ocorrá bem, você verá a árvore do diretório no editor de texto.
Utilizando um cabo USB, conecte o Wemos ao computador e no menu do Atom, selecione a opção 
**PlatformIO -> Upload** para descarregar o firmware do Wemos. 

Caso tudo tenha ocorrido corretamente, você verá o led piscar rapidamente, indicando a gravação do código no MCU.

#### 1.4 - Configuração do Wemos
Abra no editor de texto o arquivo **main.cpp**, dentro da pasta src, e procure pelo seguinte trecho de código:
```cpp
  namespace wifi {
  
    // autenticação
    const char * ssid = "Minha Rede Wifi";
    const char * password = "Minha Senha";
   
    // Configurações de IP
    IPAddress ip(192, 168, 0, 200);
    IPAddress gateway(192, 168, 0, 1);
    IPAddress subnet(255, 255, 255, 0);
    
    // resto do código omitido ...
  }
```
Insira os dados da sua rede e descarrege (upload) o firmware novamente no dispositivo.

#### 1.5 - Verificação do Dispositivo
Para saber se tudo ocorreu bem, uma medida simples de relatório foi implementada usando o led embutido no **Wemos**.

Após a gravação do dispositivo, verifique o **led azul** piscando na placa. Caso ele esteja piscando **LENTAMENTE**,
ou mais especificamente, **em intervalos de 1 segundo**, o dispositivo está tendo problemas para se conectar à rede wifi.

Caso esteja piscando mais rapidamente, **em intervalos de 0.3 segundo**, o dispositivo está funcionando normalmente.

Resumindo, caso você consiga contar o **tempo que o led ficou aceso**, 
significa que as **configurações de rede estão incorretas**.

#### 1.6 - Verificação dos Endpoints
A biblioteca (aREST) que instalamos anteriormente expoe parâmetros do dispositivo como endpoints REST. Por exemplo,
no trecho de código encontrado no arquivo **"main.cpp"**, declaramos variáveis para armazenar o valor lido pelos sensores:
```cpp
namespace model {

  // variáveis para armazenar as leituras de sensores
  double temperature = 0.0;
  // ...  
  
  /*
  * Lê o sensor de temperatura
  */
  double readTemperature() {
    return random(0, 40);       // implementar aqui a função que realmente irá ler a temperatura
  }
}
```
Mais abaixo, na função `setup()` declaramos o seguinte trecho:
```cpp

// objeto de api rest e do servidor
WiFiServer server(80);
aREST rest = aREST();

void setup() {
  
  // trecho de código omitido ...
  
  rest.variable("temperature", &model:temperature);
  
  // ...
}
```
Este trecho de código cria um link entre o valor da variável temperature e o um endpoints rest no formato
`http://{ip do wemos}/temperature`. Para exemplificar, abra o navegador (Chrome, Edge, etc) e digite na barra de navegação
o endereço sugerido, substituindo **{ip do wemos}** pelo ip inserido no código:
```cpp
namespace wifi {
  
  // ...  
  IPAddress ip(192, 168, 0, 200);  // Este é o endereço do exemplo, você deve colocar de acordo com suas configurações de rede
  // ...
}
```
Você verá o valor 0. Este valor irá ficar assim pois declaramos a variável e ligamos ela ao endpoit mas ainda não
temos um método que atualiza ela, então vamos usar o método `double readTemperature()` no loop principal para atualizar
a variável `temperature` com o valor lido pelo sensor, ou seja; 
```cpp
void loop() {
  // ...
  
  model::temperature = model::readTemperature();
  
  // ...
  
}
```
