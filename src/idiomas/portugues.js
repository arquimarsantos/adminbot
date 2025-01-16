import { color, getDate, getHours } from "../func.js";
const lang = () => { return 'pt' }
const dateHours = "(" + getDate() + " - " + getHours() + ")";
/*
* cores disponíveis:
- black
- red
- green
- yellow
- blue
- magenta
- cyan
- white
- blackBright
- redBright
- greenBright
- yellowBright
- blueBright
- magentaBright
- cyanBright
- whiteBright
* as cores só funciona nas mensagens do console
*/

const consoleMsg1 = () => { return `${color(dateHours, 'white')} ${color(`Aguardando conexão por QR Code...`, 'yellow')}` }
const consoleMsg2 = () => { return `\n${color('Digite o número do WhatsApp:\nExemplo: 55119725553036', 'blue')}\n/> ` }
const consoleMsg3 = () => { return `${color('Não deixe o número em branco, reiniciando conexão!', 'red')}` }
const consoleMsg4 = () => { return `${color('Digite somente números, reiniciando conexão!', 'red')}` }
const consoleMsg5 = (code) => { return `${color('Seu código de conexão:', 'blue')} ${color(code, 'white')}\n` }
const consoleMsg6 = () => { return `${color('Abra seu WhatsApp, entre em Dispositivos conectados > Conectar dispositivo > Conectar com número de telefone.', 'blue')}` }
const consoleMsg7 = (reason) => { return `${color('Conexão com o bot foi encerrada! motivo:', 'yellow')} ${color(reason, 'yellow')}` }
const consoleMsg8 = () => { return `${color(dateHours, 'white')} ${color('Conectado com sucesso!', 'green')}` }
const consoleMsg9 = () => { return `${color(dateHours, 'white')} ${color('Nenhuma mídia em visualização única encontrada na mensagem citada por alguém, talvez a mídia foi expirada.', 'yellow')}` }
const consoleMsg10 = () => { return `${color(dateHours, 'white')} ${color(`Baixando mídia em visualização única...`, 'yellow')}` }
const consoleMsg11 = () => { return `${color(dateHours, 'white')} ${color(`Baixando e analisando uma mídia em visualização única...`, 'yellow')}` }
const onlyGroupsMsg = () => { return `[❗] Esse comando só funciona em grupos!` }
const onlyOwnersMsg = () => { return `[❗] Esse comando só pode ser usado pelo proprietário do bot.` }
const onlyAdminsMsg = () => { return `[❗] Esse comando só pode ser usado pelos administradores.` }
const botAdminMsg = () => { return `[❗] Para o comando funcionar o bot deve ser administrador do grupo!` }
const onlyNumbersMsg = () => { return `[❗] Use apenas números para essa ação!` }
const noUseArgsMsg = (prefix, cmd) => { return `[❗] Não use argumentos para realizar essa ação!\n\nuse apenas *${prefix}${cmd}*` }
const adminLogsMsg1 = (user, groupName) => { return `+${user} entrou no grupo : ${groupName} ${dateHours}` }
const adminLogsMsg2 = (admin, user, groupName) => { return `+${user} foi adicionado por +${admin} : ${groupName} ${dateHours}` }
const adminLogsMsg3 = (user, groupName) => { return `+${user} saiu do grupo : ${groupName} ${dateHours}` }
const adminLogsMsg4 = (admin, user, groupName) => { return `+${user} foi removido por +${admin} : ${groupName} ${dateHours}` }
const adminLogsMsg5 = (admin, user, groupName) => { return `+${admin} deu administrador a +${user} : ${groupName} ${dateHours}` }
const adminLogsMsg6 = (admin, user, groupName) => { return `+${admin} tirou o administrador de +${user} : ${groupName} ${dateHours}` }
const adminLogsMsg7 = (prefix, cmd, status) => { return `[❗] Use *${prefix}${cmd} 1 | 0*\n\nestado atual: ${status}` }
const adminLogsMsg8 = () => { return `[❗] AdminLogs já está ativo! ⚠️` }
const adminLogsMsg9 = () => { return `AdminLogs foi ativado com sucesso neste grupo. ✔` }
const adminLogsMsg10 = () => { return `[❗] AdminLogs já está desligado.` }
const adminLogsMsg11 = () => { return `AdminLogs foi desativado! ❌` }
const adminLogsMsg12 = () => { return `[❗] 1 para ativar, 0 para desativar` }
const antiPrivateMsg1 = (prefix, cmd, status) => { return `[❗] Use *${prefix}${cmd} 1 | 0*\n\nestado atual: ${status}` }
const antiPrivateMsg2 = () => { return `[❗] AntiPrivado já está ativo!` }
const antiPrivateMsg3 = () => { return `「 AntiPrivado 」ativado com sucesso. ✔` }
const antiPrivateMsg4 = () => { return `[❗] AntiPrivado já está desligado.` }
const antiPrivateMsg5 = () => { return `AntiPrivado foi desativado! ❌` }
const antiPrivateMsg6 = () => { return `[❗] 1 para ativar, 0 para desativar` }
const antiLinkMsg1 = (prefix, cmd, status) => { return `[❗] Use *${prefix}${cmd} 1 | 0*\n\nestado atual: ${status}` }
const antiLinkMsg2 = () => { return `[❗] AntiLink já está ativo!` }
const antiLinkMsg3 = () => { return `「 AntiLink 」foi ativado com sucesso. ✔` }
const antiLinkMsg4 = () => { return `[❗] AntiLink já está desligado.` }
const antiLinkMsg5 = () => { return `AntiLink foi desativado! ❌` }
const antiLinkMsg6 = () => { return `[❗] 1 para ativar, 0 para desativar` }
const antiLinkMsg7 = () => { return `[❗] A função AntiLink-Grupo está ativada no momento, desative-o para continuar!` }
const antiLinkGrupoMsg1 = (prefix, cmd, status) => { return `[❗] Use *${prefix}${cmd} 1 | 0*\n\nestado atual: ${status}` }
const antiLinkGrupoMsg2 = () => { return `[❗] AntiLink-Grupo já está ativo!` }
const antiLinkGrupoMsg3 = () => { return `「 AntiLink-Grupo 」foi ativado com sucesso. ✔` }
const antiLinkGrupoMsg4 = () => { return `[❗] AntiLink-Grupo já está desligado.` }
const antiLinkGrupoMsg5 = () => { return `AntiLink-Grupo foi desativado! ⚡` }
const antiLinkGrupoMsg6 = () => { return `[❗] 1 para ativar, 0 para desativar` }
const antiLinkGrupoMsg7 = () => { return `[❗] A função AntiLink está ativada no momento, desative-o para continuar!` }
const antiNSFWMsg1 = (prefix, cmd, status) => { return `[❗] Use *${prefix}${cmd} 1 | 0*\n\nestado atual: ${status}` }
const antiNSFWMsg2 = () => { return `[❗] AntiNSFW já está ativo! ⚠️` }
const antiNSFWMsg3 = () => { return `「 AntiNSFW 」foi ativado com sucesso. ✔🔞` }
const antiNSFWMsg4 = () => { return `[❗] AntiNSFW já está desligado.` }
const antiNSFWMsg5 = () => { return `AntiNSFW foi desativado! ❌` }
const antiNSFWMsg6 = () => { return `[❗] 1 para ativar, 0 para desativar` }
const autoAceitarMsg1 = (prefix, cmd, status) => { return `[❗] Use *${prefix}${cmd} 1 | 0*\n\nestado atual: ${status}` }
const autoAceitarMsg2 = () => { return `[❗] AutoAceitar já está ativo! ⚠️` }
const autoAceitarMsg3 = () => { return `AutoAceitar foi ativado com sucesso neste grupo. ✔` }
const autoAceitarMsg4 = () => { return `[❗] AutoAceitar já está desligado.` }
const autoAceitarMsg5 = () => { return `AutoAceitar foi desativado! ❌` }
const autoAceitarMsg6 = () => { return `[❗] 1 para ativar, 0 para desativar` }
const contadorMensagensMsg1 = (prefix, cmd, status) => { return `[❗] Use *${prefix}${cmd} 1 | 0*\n\nestado atual: ${status}` }
const contadorMensagensMsg2 = () => { return `[❗] ContadorMensagens já está ativo! ⚠️` }
const contadorMensagensMsg3 = () => { return `ContadorMensagens foi ativado com sucesso neste grupo, todas as mensagens dos membros serão contabilizadas no banco de dados. ✔` }
const contadorMensagensMsg4 = () => { return `[❗] ContadorMensagens já está desligado.` }
const contadorMensagensMsg5 = () => { return `ContadorMensagens foi desativado! ❌` }
const contadorMensagensMsg6 = () => { return `[❗] 1 para ativar, 0 para desativar` }
const banMsg1 = (prefix) => { return `[❗] Marque o membro ou a mensagem do membro que deseja banir\n\nuse ${prefix}ban | ${prefix}kick (marcar)` }
const banMsg2 = () => { return `[❗] Não pode banir você mesmo(a).` }
const banMsg3 = () => { return `[❗] Não pode banir o bot do grupo por comando, apenas normalmente caso queira!` }
const banMsg4 = () => { return `[❗] Não pode banir o criador/dono(a) do grupo!` }
const banMsg5 = () => { return `[❗] Esse membro não está no grupo.` }

export default {
    lang,
    consoleMsg1,
    consoleMsg2,
    consoleMsg3,
    consoleMsg4,
    consoleMsg5,
    consoleMsg6,
    consoleMsg7,
    consoleMsg8,
    consoleMsg9,
    consoleMsg10,
    consoleMsg11,
    onlyGroupsMsg,
    onlyOwnersMsg,
    onlyAdminsMsg,
    botAdminMsg,
    onlyNumbersMsg,
    noUseArgsMsg,
    adminLogsMsg1,
    adminLogsMsg2,
    adminLogsMsg3,
    adminLogsMsg4,
    adminLogsMsg5,
    adminLogsMsg6,
    adminLogsMsg7,
    adminLogsMsg8,
    adminLogsMsg9,
    adminLogsMsg10,
    adminLogsMsg11,
    adminLogsMsg12,
    antiPrivateMsg1,
    antiPrivateMsg1,
    antiPrivateMsg2,
    antiPrivateMsg3,
    antiPrivateMsg4,
    antiPrivateMsg5,
    antiPrivateMsg6,
    antiLinkMsg1,
    antiLinkMsg2,
    antiLinkMsg3,
    antiLinkMsg4,
    antiLinkMsg5,
    antiLinkMsg6,
    antiLinkMsg7,
    antiLinkGrupoMsg1,
    antiLinkGrupoMsg2,
    antiLinkGrupoMsg3,
    antiLinkGrupoMsg4,
    antiLinkGrupoMsg5,
    antiLinkGrupoMsg6,
    antiLinkGrupoMsg7,
    antiNSFWMsg1,
    antiNSFWMsg2,
    antiNSFWMsg3,
    antiNSFWMsg4,
    antiNSFWMsg5,
    antiNSFWMsg6,
    autoAceitarMsg1,
    autoAceitarMsg2,
    autoAceitarMsg3,
    autoAceitarMsg4,
    autoAceitarMsg5,
    autoAceitarMsg6,
    contadorMensagensMsg1,
    contadorMensagensMsg2,
    contadorMensagensMsg3,
    contadorMensagensMsg4,
    contadorMensagensMsg5,
    contadorMensagensMsg6,
    banMsg1,
    banMsg2,
    banMsg3,
    banMsg4,
    banMsg5
}; 
