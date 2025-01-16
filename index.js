import {
    makeWASocket,
    makeInMemoryStore,
    makeCacheableSignalKeyStore,
    DisconnectReason,
    useMultiFileAuthState,
    fetchLatestBaileysVersion,
    downloadMediaMessage,
    Browsers
} from "@whiskeysockets/baileys";
import {
    credsFolder,
    autoRestart,
    connectionMethod,
    ownerNumber,
    prefix,
    dataStoreInMemoryLocally,
    dataStoreInMemoryFolder
} from "./src/config.js";
import {
    getConnectionMethod,
    getGroupAdmins,
    logAction
} from "./src/func.js";
import { Boom } from "@hapi/boom";
import { translateLang, pt } from "./src/idiomas/total-idiomas.js";
import pino from "pino";
import nodeCache from "node-cache";
import readline from "readline";
import fs from "fs";
import path from "path";
const antipv = JSON.parse(fs.readFileSync("./src/db/antipv.json"));
const antilink = JSON.parse(fs.readFileSync("./src/db/antilink.json"));
const antilinkgroup = JSON.parse(fs.readFileSync("./src/db/antilink-grupo.json"));
const adminlogs = JSON.parse(fs.readFileSync('./src/db/admin-logs.json'));
const adminlogsinfo = JSON.parse(fs.readFileSync('./src/db/admin-info.json'));
const autoaccept = JSON.parse(fs.readFileSync('./src/db/auto-aceitar.json'));
const count = JSON.parse(fs.readFileSync('./src/db/contador.json'));
const countMessages = JSON.parse(fs.readFileSync('./src/db/contador-mensagens.json', 'utf-8'));
const cache  = new nodeCache();
const logger = pino({ level: 'silent' });
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

async function connect() {
    const { version } = await fetchLatestBaileysVersion();
    var sessionsConnection;
    var store;
    sessionsConnection = await useMultiFileAuthState(credsFolder);
    if (dataStoreInMemoryLocally) {
        store = makeInMemoryStore({ });
        store.readFromFile(dataStoreInMemoryFolder);
        setInterval(() => { store.writeToFile(dataStoreInMemoryFolder) }, 10_000);
    }
    const { state, saveCreds } = sessionsConnection;
    const bot = makeWASocket({
        printQRInTerminal: getConnectionMethod(),
        version,
        mobile: false,
        logger,
        cache,
        browser: Browsers.windows('Chrome'),
        defaultQueryTimeoutMs: undefined,
        shouldSyncHistoryMessage: () => true,
		syncFullHistory: false,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, logger)
        },
        markOnlineOnConnect: true,
        generateHighQualityLinkPreview: true,
        getMessage: async key => {
            if (store) {
                const msg = await store.loadMessage(key.remoteJid, key.id);
			    return msg?.message || undefined;
			} else {
			    const msg = await cache.get(`${key.remoteJid}_${key.id}`);
			    return msg?.message || undefined;
			}
        }
    });
    if (dataStoreInMemoryLocally) {
        store?.bind(bot.ev);
    }
    bot.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if(connection === 'connecting' && connectionMethod == 'qr') {
            console.log(translateLang['consoleMsg1']());
        } else if (connection === 'close') {
            const shouldReconnect = (lastDisconnect.error instanceof Boom) ? (lastDisconnect.error.output?.statusCode !== DisconnectReason.loggedOut) : false;
            console.log(translateLang['consoleMsg7'](lastDisconnect.error));
            if (shouldReconnect) {
                connect();
            }
        } else if (connection === 'open') {
            console.log(translateLang['consoleMsg8']());
        }
    });
    bot.ev.on('creds.update', saveCreds);
    if (connectionMethod == 'pairing' && !bot.authState.creds.registered) {
        const phoneNumber = await question(translateLang['consoleMsg2']());
        let code = await bot.requestPairingCode(phoneNumber);
        if (!phoneNumber) {
            console.log(translateLang['consoleMsg3']());
            setTimeout(async() => {
                fs.unlinkSync(path.join(`./${credsFolder}/creds.json`));
                connect();
            }, 3000);
        } else if (isNaN(phoneNumber)) {
            console.log(translateLang['consoleMsg4']());
            setTimeout(async() => {
                fs.unlinkSync(path.join(`./${credsFolder}/creds.json`));
                connect();
            }, 3000);
        } else {
            console.log(translateLang['consoleMsg5'](code));
            console.log(translateLang['consoleMsg6']());
        }
    }
    bot.ev.on('group-participants.update', async (g) => {
        try {
            const from = g.id;
            const isGroup = from.endsWith("@g.us");
            if (!isGroup) return;
            const isAdminLogs = adminlogs.includes(from);
            const isCountMessages = count.includes(from);
            let groupMetadata;
            try {
                groupMetadata = await bot.groupMetadata(from);
            } catch (err) {
                if (err.data === 403) {
                    return;
                } else {
                    return;
                }
            }
            const groupName = groupMetadata.subject;
            const participants = g.participants;
            const admin = g.author ? g.author.split('@')[0] : null;
            let groupData = countMessages.find(group => group.groupId === from);
            if (!groupData) {
                groupData = { groupId: from, groupName: groupName, users: [] };
                countMessages.push(groupData);
            }
            for (const num of participants) {
				let userNumber = num.split('@')[0];
                if (num && num.includes('@')) {
                    if (isCountMessages) {
                        const userExists = groupData.users.some(member => member.number === userNumber);
                        if (!userExists && userNumber) {
                            groupData.users.push({ number: userNumber, messages: 0 });
                            fs.writeFileSync('./src/db/contador-mensagens.json', JSON.stringify(countMessages, null, 2));
                        }
                    }
                }
                if (isAdminLogs) {
                    const msg = logAction(g.action, admin, userNumber, groupName);
                    adminlogsinfo.push(msg);
                    fs.writeFileSync('./src/db/admin-info.json', JSON.stringify(adminlogsinfo, null, 2));
                }
            }
        } catch (e) {
            console.log(e);
            if (autoRestart) {
                connect();
            }
        }
    });
    bot.ev.on('group.join-request', async (g) => {
        try {
            const from = g.id;
            const isGroup = from.endsWith("@g.us");
            if (!isGroup) return;
            const isAutoAccept = autoaccept.includes(from);
            const groupMetadata = await bot.groupMetadata(from);
            if (!groupMetadata) return;
            const botNumber = bot.user.id.split(":")[0]+"@s.whatsapp.net";
            const groupMembers = isGroup ? groupMetadata.participants : '';
            const groupAdmins = isGroup ? getGroupAdmins(groupMembers) : '';
            const isBotAdmins = groupAdmins.includes(botNumber) || false;
            if (isAutoAccept && isBotAdmins) {
                const participant = g.participant;
                if (!participant) return;
                const timerOptions = [3000, 4000, 5000];
                const randomTimer = timerOptions[Math.floor(Math.random() * timerOptions.length)];
                setTimeout(() => {
                    const fakeParticipant = participant.replace(/\D/g, "");
                    if(fakeParticipant.startsWith("234")) {
                        bot.groupRequestParticipantsUpdate(from, [participant], "reject")
                    } else {
                        bot.groupRequestParticipantsUpdate(from, [participant], "approve")
                    }
                }, randomTimer);
            }
        } catch (e) {
            console.log(e);
            if (autoRestart) {
                connect();
            }
        }
    });
    bot.ev.on('messages.upsert', async ({ messages }) => {
        try {
            const info = messages[0];
            if (!info.message) return;
            const key = {
                remoteJid: info.key.remoteJid,
                id: info.key.id, 
                participant: info.key.participant
            };
            if (info.key && info.key.remoteJid == 'status@broadcast') return;
            const altpdf = Object.keys(info.message);
            const type = altpdf.find(key => key !== 'senderKeyDistributionMessage' && key !== 'messageContextInfo') || altpdf[0];
            const from = info.key.remoteJid;
            let budy = (type === 'conversation') ? info.message.conversation : (type === 'extendedTextMessage') ? info.message.extendedTextMessage.text : '';
            let body = '';
            switch (type) {
                case 'conversation':
                    body = info.message.conversation;
                    break;
                case 'imageMessage':
                    body = info.message.imageMessage.caption || '';
                    break;
                case 'videoMessage':
                    body = info.message.videoMessage.caption || '';
                    break;
                case 'extendedTextMessage':
                    body = info.message.extendedTextMessage.text || '';
                    break;
                case 'buttonsResponseMessage':
                    body = info.message.buttonsResponseMessage.selectedButtonId || '';
                    break;
                case 'listResponseMessage':
                    body = info.message.listResponseMessage.singleSelectReply.selectedRowId || '';
                    break;
                case 'templateButtonReplyMessage':
                    body = info.message.templateButtonReplyMessage.selectedId || '';
                    break;
                case 'messageContextInfo':
                    body = info.message.buttonsResponseMessage?.selectedButtonId 
                        || info.message.listResponseMessage?.singleSelectReply.selectedRowId 
                        || info.text || '';
                    break;
                default:
                    body = '';
            }
            const isCmd = body.startsWith(prefix);
            const reply = async(txt) => {
                await bot.sendMessage(from, { text: txt }, { quoted: info });
            };
            const errorReply = async(txt) => {
                await bot.sendMessage(from, { react: { text: '❌', key: info.key }});
                await bot.sendMessage(from, { text: txt }, { quoted: info });
            };
            const isGroup = from.endsWith("@g.us");
            const groupMetadata = isGroup ? await bot.groupMetadata(from) : "";
            if (!groupMetadata) return;
            const isImage = type == 'imageMessage';
            const isVideo = type === 'videoMessage';
            const isSticker = type === 'stickerMessage';
            //const isViewOnce = type === "viewOnceMessage" || type === "viewOnceMessageV2" || type === "viewOnceMessageV2Extension";
            const isQuotedViewOnce = 
            info.message?.extendedTextMessage?.contextInfo?.quotedMessage && 
            (
                info.message.extendedTextMessage.contextInfo.quotedMessage.viewOnceMessage || 
                info.message.extendedTextMessage.contextInfo.quotedMessage.viewOnceMessageV2 || 
                info.message.extendedTextMessage.contextInfo.quotedMessage.viewOnceMessageV2Extension
            );
            const groupName = isGroup ? groupMetadata.subject : "";
            const groupOwner = isGroup ? groupMetadata.owner : ''
            const sender = isGroup ? info.key.participant : from;
            const groupMembers = isGroup ? groupMetadata.participants : '';
            const groupAdmins = isGroup ? getGroupAdmins(groupMembers) : '';
            const isAntiPv = (antipv.antiPrivate == true) ? true : false;
            const isAntiLink = isGroup ? antilink.includes(from) : false;
            const isAntiLinkGroup = isGroup ? antilinkgroup.includes(from) : false;
            const isAdminLogs = adminlogs.includes(from);
            const isAutoAccept = autoaccept.includes(from);
            const isCountMessages = count.includes(from);
            const cmd = isCmd ? body.slice(1).trim().split(/ +/).shift().toLocaleLowerCase() : null;
            const args = body.trim().split(/ +/).splice(1);
            const botNumber = bot.user.id.split(":")[0]+"@s.whatsapp.net";
            const text = args.join(' ');
            const isOwner = [ ...ownerNumber].map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(sender);
            const isBotAdmins = groupAdmins.includes(botNumber) || false;
            const isGroupAdmins = groupAdmins.includes(sender) || false;
            switch(cmd) {
                case 'antipv':
                    if (isAntiPv && !isGroup) return;
                    if (!isOwner) return;
                    if (args.length < 1) return;
                    if (Number(args[0]) === 1) {
                        if (isAntiPv) return errorReply(pt['antiPrivateMsg2']());
                        antipv.antiPrivate = true;
                        fs.writeFileSync('./src/db/antipv.json', JSON.stringify(antipv, null, '\t'));
                        reply(pt['antiPrivateMsg3']());
                    } else if (Number(args[0]) === 0) {
                        if (!isAntiPv) return errorReply(pt['antiPrivateMsg4']());
                        antipv.antiPrivate = false;
                        fs.writeFileSync('./src/db/antipv.json', JSON.stringify(antipv, null, '\t'));
                        bot.sendMessage(from, { text: pt['antiPrivateMsg5']() });
                    } else {
                        reply(pt['antiPrivateMsg6']());
                    }
                    break;
                case 'antilink':
                    if (isAntiPv && !isGroup) return;
                    if (!isGroup) return;
                    if (!isBotAdmins) return;
                    if (!isGroupAdmins) return;
                    if (args.length < 1) return;
                    if (!isAntiLinkGroup) {
                        if (Number(args[0]) === 1) {
                            if (isAntiLink) return errorReply(pt['antiLinkMsg2']());
                            antilink.push(from);
                            fs.writeFileSync('./src/db/antilink.json', JSON.stringify(antilink));
                            reply(pt['antiLinkMsg3']());
                        } else if (Number(args[0]) === 0) {
                            if (!isAntiLink) return errorReply(pt['antiLinkMsg4']());
                            antilink.splice(from, 1);
                            fs.writeFileSync('./src/db/antilink.json', JSON.stringify(antilink));
                            bot.sendMessage(from, { text: pt['antiLinkMsg5']() });
                        } else {
                            reply(pt['antiLinkMsg6']());    
                        }
                    } else {
                        errorReply(pt['antiLinkMsg7']());
                    }
                    break;
                case 'antilinkgrupo':
                    if (isAntiPv && !isGroup) return;
                    if (!isGroup) return;
                    if (!isBotAdmins) return;
                    if (!isGroupAdmins) return;
                    if (args.length < 1) return;
                    if (!isAntiLink) {
                        if (Number(args[0]) === 1) {
                            if (isAntiLinkGroup) return errorReply(pt['antiLinkGrupoMsg2']());
                            antilinkgroup.push(from);
                            fs.writeFileSync('./src/db/antilink-grupo.json', JSON.stringify(antilinkgroup));
                            reply(pt['antiLinkGrupoMsg3']());
                        } else if (Number(args[0]) === 0) {
                            if (!isAntiLinkGroup) return errorReply(pt['antiLinkGrupoMsg4']());
                            antilinkgroup.splice(from, 1);
                            fs.writeFileSync('./src/db/antilink-grupo.json', JSON.stringify(antilinkgroup));
                            bot.sendMessage(from, { text: pt['antiLinkGrupoMsg5']() });
                        } else {
                            reply(pt['antiLinkGrupoMsg6']());
                        }
                    } else {
                        errorReply(pt['antiLinkGrupoMsg7']());
                    }
                    break;
                case 'adminlogs':
                    if (isAntiPv && !isGroup) return;
                    if (!isGroup) return;
                    if (!isOwner) return;
                    if (args.length < 1) return;
                    if (Number(args[0]) === 1) {
                        if (isAdminLogs) return errorReply(pt['adminLogsMsg8']());
                        adminlogs.push(from);
                        fs.writeFileSync('./src/db/admin-logs.json', JSON.stringify(adminlogs));
                        reply(pt['adminLogsMsg9']());
                    } else if (Number(args[0]) === 0) {
                        if (!isAdminLogs) return errorReply(pt['adminLogsMsg10']());
                        adminlogs.splice(from, 1);
                        fs.writeFileSync('./src/db/admin-logs.json', JSON.stringify(adminlogs));
                        bot.sendMessage(from, { text: pt['adminLogsMsg11']() });
                    } else {
                        reply(pt['adminLogsMsg12']());
                    }
                    break;
                case 'autoaceitar':
                    if (isAntiPv && !isGroup) return;
                    if (!isGroup) return;
                    if (!isOwner) return;
                    if (args.length < 1) return;
                    if (Number(args[0]) === 1) {
                        if (isAutoAccept) return errorReply(pt['autoAceitarMsg2']());
                        autoaccept.push(from);
                        fs.writeFileSync('./src/db/auto-aceitar.json', JSON.stringify(autoaccept));
                        reply(pt['autoAceitarMsg3']());
                    } else if (Number(args[0]) === 0) {
                        if (!isAutoAccept) return errorReply(pt['autoAceitarMsg4']());
                        autoaccept.splice(from, 1);
                        fs.writeFileSync('./src/db/auto-aceitar.json', JSON.stringify(autoaccept));
                        bot.sendMessage(from, { text: pt['autoAceitarMsg5']() });
                    } else {
                        reply(pt['autoAceitarMsg6']());
                    }
                    break;
                case 'contadormensagens':
                    if (isAntiPv && !isGroup) return;
                    if (!isGroup) return;
                    if (!isOwner) return;
                    if (args.length < 1) return;
                    if (Number(args[0]) === 1) {
                        if (isCountMessages) return errorReply(pt['contadorMensagensMsg2']());
                        count.push(from);
                        fs.writeFileSync('./src/db/contador.json', JSON.stringify(count));
                        reply(pt['contadorMensagensMsg3']());
                    } else if (Number(args[0]) === 0) {
                        if (!isCountMessages) return errorReply(pt['contadorMensagensMsg4']());
                        count.splice(from, 1);
                        fs.writeFileSync('./src/db/contador.json', JSON.stringify(count));
                        bot.sendMessage(from, { text: pt['contadorMensagensMsg5']() });
                    } else {
                        reply(pt['contadorMensagensMsg6']());
                    }
                    break;
                case 'ban': case 'kick':
                    if (isAntiPv && !isGroup) return;
                    if (!isGroup) return;
                    if (!isBotAdmins) return;
                    if (!isGroupAdmins) return;
                    if (info.message.extendedTextMessage === undefined || info.message.extendedTextMessage === null) return reply(pt['banMsg1'](prefix));
                    let mentioned = info.message.extendedTextMessage.contextInfo.mentionedJid[0] ? 
                    info.message.extendedTextMessage.contextInfo.mentionedJid[0] : 
                    info.message.extendedTextMessage.contextInfo.participant;
                    if (mentioned.includes(sender)) return errorReply(pt['banMsg2']());
                    if (mentioned.includes(botNumber)) return errorReply(pt['banMsg3']());
                    if (mentioned.includes(groupOwner)) return errorReply(pt['banMsg4']());
                    let response = await bot.groupParticipantsUpdate(from, [mentioned], 'remove');
                    if (response[0].status === "404") return errorReply(pt['banMsg5']());
                    if (info.quoted && text) {
                        let mentioned2 = info.mentionedUser[0] ? info.mentionedUser[0] : info.quoted ? info.key.participant : text.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
                        if (text.includes(sender)) return errorReply(pt['banMsg2']());
                        if (text.includes(botNumber)) return errorReply(pt['banMsg3']());
                        if (mentioned2.includes(groupOwner)) return errorReply(pt['banMsg4']());
                        await bot.groupParticipantsUpdate(from, [mentioned2], 'remove');
                    }
                    break;
                default:
                    if (isGroup && isCountMessages) {
                        let groupData = countMessages.find(group => group.groupId === from);
                        if (!groupData) {
                            groupData = { groupId: from, groupName: groupName, users: [] };
                            countMessages.push(groupData);
                        }
                        let userNumber = sender.split('@')[0];
                        let userData = groupData.users.find(user => user.number === userNumber);
                        if (!userData) {
                            userData = { number: userNumber, messages: 0 };
                            groupData.users.push(userData);
                        }
                        userData.messages += 1;
                        fs.writeFileSync('./src/db/contador-mensagens.json', JSON.stringify(countMessages, null, 2));
                    }
                    if (isGroup && isAntiLinkGroup && budy.includes("https://chat.whatsapp.com/")) {
                        if (!isGroupAdmins) {
                            let user = `${sender.split("@")[0]}@s.whatsapp.net`;
                            bot.sendMessage(from, { delete: { remoteJid: from, fromMe: false, id: info.key.id, participant: [user] } });
			    await bot.groupParticipantsUpdate(from, [user], 'remove');
                        }
                    } else if (isGroup && isAntiLink) {
                        if (budy.includes("https://") || budy.includes("http://") || budy.includes(".com")) {
                            if (!isGroupAdmins) {
                                let user = `${sender.split("@")[0]}@s.whatsapp.net`;
                                bot.sendMessage(from, { delete: { remoteJid: from, fromMe: false, id: info.key.id, participant: [user] } });
                            }
                        }
                    }
            }
        } catch (e) {
            console.log(e);
            if (autoRestart) {
                connect();
            }
        }
    });
}

connect();
