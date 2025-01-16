import { downloadContentFromMessage, downloadMediaMessage } from "@whiskeysockets/baileys";
import { writeFile } from "fs/promises";
import { pt } from "./idiomas/total-idiomas.js";
import { connectionMethod, timeZone } from "./config.js";
import { createCanvas, loadImage } from "canvas";
import pino from "pino";
import sharp from "sharp";
import fs from "fs";
import ffmpeg from 'fluent-ffmpeg';
import clc from "cli-color";
import axios from "axios";
import path from "path";
import * as tf from "@tensorflow/tfjs";
import * as nsfw from 'nsfwjs';
import bodyForm from "form-data";
import mimetype from "mime-types";
const logger = pino({ level: 'silent' });
const tempfolder = path.join('./src/tmp');
tf.enableProdMode();

const colorMap = {
    black: clc.black,
    red: clc.red,
    green: clc.green,
    yellow: clc.yellow,
    blue: clc.blue,
    magenta: clc.magenta,
    cyan: clc.cyan,
    white: clc.white, 
    blackBright: clc.blackBright,
    redBright: clc.redBright,
    greenBright: clc.greenBright,
    yellowBright: clc.yellowBright,
    blueBright: clc.blueBright,
    magentaBright: clc.magentaBright,
    cyanBright: clc.cyanBright,
    whiteBright: clc.whiteBright
};

const color = (text, color) => {
    if (!color) return clc.blueBright(text);
    return colorMap[color] ? colorMap[color](text) : clc.blueBright(text);
}

function getConnectionMethod() {
    if (connectionMethod == 'qr') return true;
    if (connectionMethod == 'pairing') return false;
}

function getDate() {
    const date = new Date();
    let currentDay = String(date.getDate()).padStart(2, '0');
    let currentMonth = String(date.getMonth()+1).padStart(2,"0");
    let currentYear = date.getFullYear();
    let currentDate = `${currentDay}/${currentMonth}/${currentYear}`;
    return currentDate;
}

function getHours() {
    let hours = new Date().toLocaleTimeString("en-US",
    {timeZone:`${timeZone}`,hour: "2-digit", minute: "2-digit",hourCycle:'h24'});
    return hours;
}

function getGroupAdmins(participants) {
    const admins = [];
    for (let i of participants) {
        if(i.admin == 'admin') admins.push(i.id);
        if(i.admin == 'superadmin') admins.push(i.id);
    }
    return admins;
}

function logAction(action, admin, user, groupName) {
    const messages = {
        add: admin
            ? pt['adminLogsMsg1'](user, groupName)
            : pt['adminLogsMsg2'](admin, user, groupName),
        remove: admin
            ? pt['adminLogsMsg3'](user, groupName)
            : pt['adminLogsMsg4'](admin, user, groupName),
        promote: pt['adminLogsMsg5'](admin, user, groupName),
        demote: pt['adminLogsMsg6'](admin, user, groupName)
    };
    return messages[action];
}

function TelegraPh (Path) {
	return new Promise (async (resolve, reject) => {
		if (!fs.existsSync(Path)) return reject(new Error("File not Found"))
		try {
			const form = new bodyForm();
			form.append("file", fs.createReadStream(Path))
			const data = await  axios({
				url: "https://telegra.ph/upload",
				method: "POST",
				headers: {
					...form.getHeaders()
				},
				data: form
			})
			return resolve("https://telegra.ph" + data.data[0].src)
		} catch (err) {
			return reject(new Error(String(err)))
		}
	})
}

async function UploadFileUgu (input) {
	return new Promise (async (resolve, reject) => {
			const form = new bodyForm();
			form.append("files[]", fs.createReadStream(input))
			await axios({
				url: "https://uguu.se/upload.php",
				method: "POST",
				headers: {
					"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.212 Safari/537.36",
					...form.getHeaders()
				},
				data: form
			}).then((data) => {
				resolve(data.data.files[0])
			}).catch((err) => reject(err))
	})
}

async function downloadMedia(baileysMessage, fileName) {
    const messageContent = baileysMessage.message || baileysMessage?.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!messageContent) return null;
    const mediaTypes = ['imageMessage', 'videoMessage', 'audioMessage', 'stickerMessage', 'documentMessage'];
    let content, mediaType;
    for (const type of mediaTypes) {
        if (messageContent[type]) {
            content = messageContent[type];
            mediaType = type;
            break;
        }
    }
    if (!content) return null;
    const stream = await downloadContentFromMessage(content, mediaType.replace('Message', ''));
    const getExtension = async (type) => mimetype.extension(type);
    const extension = await getExtension(content.mimetype || '');
    let buffer = Buffer.from([]);
    for await (const chunk of stream) {
        buffer = Buffer.concat([buffer, chunk]);
    }
    const filePath = path.join(tempfolder, `${fileName}.${extension}`);
    await writeFile(filePath, buffer);
    return filePath;
}

async function downloadViewOnce(baileysMessage, fileName) {
    try {
        const key = {
            remoteJid: baileysMessage.key.remoteJid,
            id: baileysMessage.key.id, 
            participant: baileysMessage.key.participant
        };
        const quotedMessage = baileysMessage.message.extendedTextMessage.contextInfo.quotedMessage;
        if (!quotedMessage) {
            return;
        }
        const mediaMessage =
            quotedMessage.viewOnceMessage?.message ||
            quotedMessage.viewOnceMessageV2?.message ||
            quotedMessage.viewOnceMessageV2Extension?.message;
        if (!mediaMessage) {
            console.log(pt['consoleMsg9']());
            return;
        }
        console.log(pt['consoleMsg10']());
        const buffer = await downloadMediaMessage(
            { message: mediaMessage, key: key },
            "buffer",
            {},
            { logger }
        );
        if (buffer) {
            const filePath = path.resolve(
                "./src/tmp",
                `${fileName}.${mediaMessage.imageMessage ? "jpeg" : "mp4"}`
            );
            fs.writeFileSync(filePath, buffer);
            //console.log(`Mídia salva com sucesso em: ${filePath}`);
        }
    } catch (e) {
        console.log(e);
    }
}

async function checkMedia(mediaPath) {
    const model = await nsfw.load("MobileNetV2");
    let imageBuffer;
    try {
        if (mediaPath.endsWith('.webp')) {
            imageBuffer = await sharp(mediaPath).toFormat('jpeg').toBuffer();
        } else {
            imageBuffer = fs.readFileSync(mediaPath);
        }
        const img = await loadImage(imageBuffer);
        const canvas = createCanvas(img.width, img.height);
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);
        const predictions = await model.classify(canvas);
        const isNSFW = predictions.some(prediction => 
            (prediction.className === 'Porn' || prediction.className === 'Hentai' || prediction.className === 'Sexy') && prediction.probability > 0.8
        );
        return {
            isNSFW,
            predictions,
        };
    } catch (e) {
        console.log(e);
        return { isNSFW: false, predictions: [] };
    }
}

async function analyzeVideo(videoPath) {
    const uniqueTempFolder = path.join(tempfolder, `video-${Date.now()}`);
    if (!fs.existsSync(uniqueTempFolder)) fs.mkdirSync(uniqueTempFolder);
    return new Promise((resolve, reject) => {
        ffmpeg(videoPath)
            .output(path.join(uniqueTempFolder, 'frame-%d.jpg'))
            //.outputOptions(['-vf fps=1'])
            .outputOptions(['-frames:v 20'])
            .on('end', async () => {
                const files = fs.readdirSync(uniqueTempFolder);
                const imageFiles = files.filter(file => file.endsWith('.jpg') || file.endsWith('.jpeg'));
                let nsfwResult = null;
                for (const file of imageFiles) {
                    const filePath = path.join(uniqueTempFolder, file);
                    try {
                        const { isNSFW, predictions } = await checkMedia(filePath);
                        fs.rmSync(filePath);
                        if (isNSFW) {
                            nsfwResult = { frame: file, predictions };
                            break;
                        }
                    } catch (err) {
                        fs.rmSync(filePath);
                        reject(err);
                        return;
                    }
                }
                const remainingFiles = fs.readdirSync(uniqueTempFolder);
                remainingFiles.forEach(file => fs.rmSync(path.join(uniqueTempFolder, file)));
                fs.rmdirSync(uniqueTempFolder);
                resolve(nsfwResult ? [nsfwResult] : []);
            })
            .on('error', (err) => {
                const files = fs.readdirSync(uniqueTempFolder);
                files.forEach(file => fs.rmSync(path.join(uniqueTempFolder, file)));
                fs.rmdirSync(uniqueTempFolder);
                reject(err);
            })
            .run();
    });
}

export {
    tempfolder,
    color,
    getConnectionMethod,
    getDate,
    getHours,
    getGroupAdmins,
    logAction,
    TelegraPh,
    UploadFileUgu,
    downloadMedia,
    downloadViewOnce,
    checkMedia,
    analyzeVideo
};
