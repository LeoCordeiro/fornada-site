// WhatsApp do usuário nos formulários. Máscara pela `maska` (o formatador caseiro pula o cursor).

// DDDs válidos no Brasil (lista oficial da Anatel)
const faixa = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i)
export const DDDS = new Set(
  [faixa(11, 19), [21, 22, 24, 27, 28], faixa(31, 35), [37, 38], faixa(41, 49), [51], faixa(53, 55), faixa(61, 69),
    [71], faixa(73, 75), [77, 79], faixa(81, 89), faixa(91, 99)].flat().map(String),
)

/** Só dígitos; tira o 55 de quem colou com país (12–13 dígitos) e o 0 de quem digitou o DDD com zero. */
export function normalizarTelefone(valor) {
  let d = String(valor ?? '').replace(/\D/g, '')
  if ((d.length === 12 || d.length === 13) && d.startsWith('55')) d = d.slice(2)
  if (d.startsWith('0')) d = d.replace(/^0+/, '')
  return d.slice(0, 11)
}

/** null = válido · 'vazio' · 'formato' · 'ddd' (a mensagem de cada um mora em data/formularios.js). Com 2 dígitos o DDD já é
 *  conhecido: ele é conferido antes do tamanho ("(10)" é erro de DDD, não de formato). */
export function validarTelefone(valor) {
  const d = normalizarTelefone(valor)
  if (!d) return 'vazio'
  if (d.length >= 2 && !DDDS.has(d.slice(0, 2))) return 'ddd'
  if (d.length !== 10 && d.length !== 11) return 'formato'
  if (d.length === 11 && d[2] !== '9') return 'formato'
  if (d.length === 10 && !'2345'.includes(d[2])) return 'formato'
  return null
}

/** 11912345678 → (11) 91234-5678 · 1123456789 → (11) 2345-6789 */
export function formatarTelefone(valor) {
  const d = normalizarTelefone(valor)
  const m = d.match(/^(\d{2})(\d{4,5})(\d{4})$/)
  return m ? `(${m[1]}) ${m[2]}-${m[3]}` : d
}

/** Opções da diretiva v-maska: a máscara troca entre fixo (10) e celular (11) pelo tamanho. */
export const MASCARA_TELEFONE = {
  mask: ['(##) ####-####', '(##) #####-####'],
  preProcess: (v) => {
    const d = normalizarTelefone(v)
    return d.length ? d : String(v ?? '').replace(/\D/g, '')
  },
}
