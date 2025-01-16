/*
* idiomas disponíveis
* português : 'pt' | espanhol : 'es'
* o idioma será alterado apenas no console
*/
const consoleLang = 'pt';
// nome da pasta onde as sessões serão salvas
const credsFolder = 'sessions';
// reiniciar o bot automaticamente se crashar
const autoRestart = true;
/*
* método de conexão
* QR code : 'qr' | código de emparelhamento : 'pairing'
*/
const connectionMethod = 'pairing';
// definindo uma timezone válida a data e horário do bot vai ser alterado de acordo com o local
const timeZone = 'America/Sao_Paulo';
const ownerNumber = ['557197108211'];
const prefix = '!';
// salvamento de dados localmente
const dataStoreInMemoryLocally = false;
// crie uma pasta de acordo com o nome do local de diretório do salvamento de dados ou irá crashar
// a pasta não gera automaticamente igual nas sessões caso não exista... por isso ocorre o crash
const dataStoreInMemoryFolder = './store/baileys_store.json';

export {
    consoleLang,
    credsFolder,
    autoRestart,
    connectionMethod,
    timeZone,
    ownerNumber,
    prefix,
    dataStoreInMemoryLocally,
    dataStoreInMemoryFolder,
};
