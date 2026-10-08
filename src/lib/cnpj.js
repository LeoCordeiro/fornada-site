// CNPJ com letras (Receita Federal, novas inscrições a partir de 31/07/2026): as 12 primeiras posições
// aceitam [0-9A-Z]; os 2 dígitos verificadores continuam números. DV por mod 11 com valor = código ASCII − 48.

const PESOS_1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
const PESOS_2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]

/** Maiúsculas, só [0-9A-Z], no máximo 14 caracteres. */
export const normalizarCnpj = (valor) => String(valor ?? '').toUpperCase().replace(/[^0-9A-Z]/g, '').slice(0, 14)

const dv = (base, pesos) => {
  const soma = [...base].reduce((s, c, i) => s + (c.charCodeAt(0) - 48) * pesos[i], 0)
  const resto = soma % 11
  return resto < 2 ? 0 : 11 - resto
}

/** null = válido · 'vazio' · 'incompleto' · 'dv' (mensagens em data/formularios.js). */
export function validarCnpj(valor) {
  const c = normalizarCnpj(valor)
  if (!c) return 'vazio'
  if (c.length !== 14 || !/^[0-9A-Z]{12}\d{2}$/.test(c)) return 'incompleto'
  if (/^(.)\1{13}$/.test(c)) return 'dv'
  const d1 = dv(c.slice(0, 12), PESOS_1)
  const d2 = dv(c.slice(0, 12) + d1, PESOS_2)
  return c.endsWith(`${d1}${d2}`) ? null : 'dv'
}

export const cnpjValido = (valor) => validarCnpj(valor) === null

/** 68998077000136 → 68.998.077/0001-36 · 12abc34501de35 → 12.ABC.345/01DE-35 */
export function formatarCnpj(valor) {
  const c = normalizarCnpj(valor)
  const m = c.match(/^(.{2})(.{3})(.{3})(.{4})(.{2})$/)
  return m ? `${m[1]}.${m[2]}.${m[3]}/${m[4]}-${m[5]}` : c
}

/** Opções da diretiva v-maska: X = letra ou número (vira maiúscula), # = dígito. */
export const MASCARA_CNPJ = {
  mask: 'XX.XXX.XXX/XXXX-##',
  tokens: { X: { pattern: /[0-9A-Za-z]/, transform: (c) => c.toUpperCase() } },
}
