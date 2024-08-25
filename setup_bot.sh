#!/bin/bash

# Nome do script: setup_bot.sh

# Atualiza o sistema
sudo apt update && sudo apt upgrade -y

# Instala Node.js e npm
curl -sL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt install -y nodejs

# Verifica se Node.js e npm foram instalados corretamente
node -v
npm -v

# Instala o Chrome (versão mais recente)
wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
sudo dpkg -i google-chrome-stable_current_amd64.deb
sudo apt-get -f install -y  # Corrige quaisquer dependências quebradas

# Verifica a instalação do Chrome
google-chrome --version

# Baixa e instala o ChromeDriver
# Primeiro, encontre a versão do Chrome instalada
CHROME_VERSION=$(google-chrome --version | grep -oP '\d+\.\d+\.\d+')
CHROME_DRIVER_VERSION=$(curl -sS https://chromedriver.storage.googleapis.com/LATEST_RELEASE_$CHROME_VERSION)

wget https://chromedriver.storage.googleapis.com/$CHROME_DRIVER_VERSION/chromedriver_linux64.zip
sudo apt install -y unzip  # Garantir que unzip está instalado
unzip chromedriver_linux64.zip
sudo mv chromedriver /usr/local/bin/
sudo chmod +x /usr/local/bin/chromedriver

# Verifica a instalação do ChromeDriver
chromedriver --version

# Instala o PM2 globalmente
sudo npm install -g pm2

# Clona o repositório do bot (substitua pela URL do seu repositório)
git clone https://github.com/JhonasRG/m4lware-bot

# Navega até a pasta do bot
cd m4lware-bot

# Instala as dependências do projeto
npm install

# Inicia o bot com PM2
pm2 start index.js --name "m4lware-bot"

# Configura o PM2 para iniciar o bot na inicialização do sistema
pm2 startup systemd

# Salva a configuração atual do PM2
pm2 save

# Exibe o status do PM2 para confirmar que o bot está rodando
pm2 status

echo "Bot configurado e rodando com PM2!"
