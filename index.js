const qrcode = require('qrcode-terminal');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const axios = require('axios');
const fs = require('fs');
const path = require('path'); // Adicionado para manipulação de caminhos
const { v4: uuidv4 } = require('uuid');

// Função para fazer o download do áudio
async function downloadAudio(url, nomeDoArquivo) {
    const payload = {
        url: url,
        isAudioOnly: 'true'
    };

    const apiUrl = "https://olly.imput.net/api/json";

    try {
        const response = await axios.post(apiUrl, payload, {
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        const data = response.data;

        if (['success', 'stream'].includes(data.status)) {
            const videoUrl = data.url;
            const requisitionResponse = await axios.get(videoUrl, { responseType: 'arraybuffer' });

            if (requisitionResponse.status === 200) {
                const uniqueFilename = `${nomeDoArquivo}-${uuidv4()}.mp3`;
                const filePath = path.join(__dirname, uniqueFilename);
                fs.writeFileSync(filePath, requisitionResponse.data);
                console.log(`Download do MP3 concluído com sucesso!`);
                return filePath;
            } else {
                console.log('Falha ao baixar o áudio.');
                return 'Falha ao baixar o áudio.';
            }
        } else if (data.status === 'error') {
            console.log('Erro ao processar a solicitação:', data.text || 'Erro desconhecido.');
            return `Erro ao processar a solicitação: ${data.text || 'Erro desconhecido.'}`;
        } else {
            console.log('Status de resposta desconhecido:', data.status);
            return `Status de resposta desconhecido: ${data.status}`;
        }
    } catch (error) {
        console.error('Falha ao enviar a solicitação para a API:', error.message);
        return `Falha ao enviar a solicitação para a API: ${error.message}`;
    }
}

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: false,
        args: [
            '--no-sandbox',
            '--disable-gpu',
        ],
    }
});

let userState = {}; // Variável para rastrear o estado do usuário

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', async msg => {
    const chatId = msg.from; // Identifica o chat para manter o estado por usuário

    if (!userState[chatId]) {
        userState[chatId] = 'INITIAL'; // Estado inicial
    }

    if (userState[chatId] === 'INITIAL') {
        if (msg.body.toLowerCase() === 'menu') {
            msg.reply('Selecione uma opção:\n* 1 - O que é você?\n* 2 - O que você faz?\n* 3 - Baixar um Áudio');
            userState[chatId] = 'MENU'; // Atualiza o estado do usuário
        } else {
            msg.reply('Digite "Menu" para ver as opções.');
        }
    } else if (userState[chatId] === 'MENU') {
        switch (msg.body) {
            case '1':
                ImagefilePath = path.join(__dirname, 'malware-sombra-skull.jpg')
                const media = MessageMedia.fromFilePath(ImagefilePath);
                try {
                    await client.sendMessage(chatId, media, {
                        caption: 'Meu nome é M4lware, um bot de testes sendo desenvolvido atualmente por Kaze!'
                    });
                } catch (error) {
                    console.log(`Falha ao enviar imagem para ${chatId}`, error);
                    msg.reply('Falha ao enviar imagem');
                }
                break;
            case '2':
                msg.reply('Atualmente, como minhas interações e funções ainda estão sendo desenvolvidas, minha única utilidade é baixar suas músicas favoritas através de uma URL do YouTube!');
                break;
            case '3':
                msg.reply('Por favor, envie a URL da música que deseja baixar.');
                userState[chatId] = 'AUDIODOWNLOAD';
                break;
            default:
                msg.reply('Opção inválida. Por favor, digite 1, 2, 3 ou 4.');
                break;
        }
    } else if (userState[chatId] === 'AUDIODOWNLOAD') {
        if (msg.body) {
            // Adiciona um delay de 5 segundos (5000 ms)
            await sleep(5000);

            const nomeDoArquivo = `Audio-${chatId}`;
            const filePath = await downloadAudio(msg.body, nomeDoArquivo);
            if (filePath) {
                const media = MessageMedia.fromFilePath(filePath);
                try {
                    await client.sendMessage(chatId, media, { sendAudioAsVoice: false });
                    console.log(`Áudio enviado para ${chatId}`);
                    msg.reply('Download Concluído! 👾');
                } catch (error) {
                    console.log(`Falha ao enviar áudio para ${chatId}`, error);
                    msg.reply('Falha ao enviar a sua música :(');
                }
                // Remove o arquivo após o envio
                fs.unlinkSync(filePath);
            } else {
                msg.reply('Falha ao baixar o seu áudio.');
            }
        } else {
            msg.reply('URL inválida ou não recebida.');
        }
        userState[chatId] = 'MENU'; // Retorna ao estado inicial após o download
    }
});

client.initialize();
