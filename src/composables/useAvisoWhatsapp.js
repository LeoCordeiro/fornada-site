// Aviso único "WhatsApp em configuração…": todo CTA de WhatsApp com o número
// pendente vira <button> sem href e chama avisarWhatsappPendente(); o WhatsAppFab desenha o aviso (role="status").
import { reactive, readonly } from 'vue'

export const TEXTO_AVISO_WHATSAPP = 'WhatsApp em configuração: o número da Fornada ainda não foi cadastrado no site.'

const aviso = reactive({ texto: '', vez: 0 })
let tmr = 0

export function avisarWhatsappPendente(mensagem = '') {
  clearTimeout(tmr)
  aviso.texto = ''
  // texto trocado num 2º tique: leitor de tela anuncia de novo mesmo quando o aviso já estava na tela
  requestAnimationFrame(() => {
    aviso.texto = TEXTO_AVISO_WHATSAPP
    aviso.vez++
  })
  // dev: mostra o que SERIA aberto; some do build de prévia/produção
  if (import.meta.env.DEV && mensagem) console.info('[WhatsApp pendente] mensagem que abriria:\n' + mensagem)
  tmr = setTimeout(() => (aviso.texto = ''), 6000)
}

export const avisoWhatsapp = readonly(aviso)
