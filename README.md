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
**PlatformIO -> Upload** para descarregar o firmware do Wemos. Caso tudo tenha ocorrido corretamente, você verá o led piscar
rapidamente, indicando a gravação do código no mcu.

#### 1.4 - Configuração do Wemos
Abra no editor de texto o arquivo **main.cpp**, dentro da pasta src, e procure pelo seguinte trecho de código:
'''cpp
  namespace wifi {
  }
'''
