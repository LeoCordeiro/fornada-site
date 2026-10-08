// Vetores de CNPJ e telefone (CNPJ com letras desde 31/07/2026).
import { describe, expect, it } from 'vitest'
import { cnpjValido, formatarCnpj, validarCnpj } from '@/lib/cnpj'
import { formatarTelefone, normalizarTelefone, validarTelefone } from '@/lib/telefone'

describe('CNPJ', () => {
  it('68.998.077/0001-36 (o da Fornada) é válido; com e sem máscara', () => {
    expect(cnpjValido('68.998.077/0001-36')).toBe(true)
    expect(cnpjValido('68998077000136')).toBe(true)
    expect(formatarCnpj('68998077000136')).toBe('68.998.077/0001-36')
  })
  it('68.998.077/0001-37 não confere', () => expect(validarCnpj('68.998.077/0001-37')).toBe('dv'))
  it('12.ABC.345/01DE-35 (alfanumérico) é válido; minúscula vira maiúscula', () => {
    expect(cnpjValido('12.ABC.345/01DE-35')).toBe(true)
    expect(formatarCnpj('12abc34501de35')).toBe('12.ABC.345/01DE-35')
    expect(cnpjValido('12abc34501de35')).toBe(true)
  })
  it('14 caracteres iguais é inválido', () => expect(validarCnpj('11.111.111/1111-11')).toBe('dv'))
  it('incompleto e vazio', () => {
    expect(validarCnpj('68.998.077/0001')).toBe('incompleto')
    expect(validarCnpj('')).toBe('vazio')
    expect(validarCnpj('12.ABC.345/01DE-3X')).toBe('incompleto') // DV tem que ser número
  })
})

describe('Telefone (WhatsApp do usuário)', () => {
  it('digitar 11912345678 → (11) 91234-5678', () => expect(formatarTelefone('11912345678')).toBe('(11) 91234-5678'))
  it('colar +55 11 91234-5678 → mesmo número', () => {
    expect(normalizarTelefone('+55 11 91234-5678')).toBe('11912345678')
    expect(validarTelefone('+55 11 91234-5678')).toBeNull()
  })
  it('DDD com zero (011…) perde o zero', () => expect(normalizarTelefone('011912345678')).toBe('11912345678'))
  it('DDD inexistente: 1091234567 e (10)… — e já com 2 dígitos', () => {
    expect(validarTelefone('1091234567')).toBe('ddd')
    expect(validarTelefone('(10) 91234-5678')).toBe('ddd')
    expect(validarTelefone('(10)')).toBe('ddd')
    expect(validarTelefone('2')).toBe('formato') // 1 dígito: o DDD ainda não existe
  })
  it('11 dígitos sem o 9 na 3ª posição → formato', () => expect(validarTelefone('11812345678')).toBe('formato'))
  it('fixo com 10 dígitos (WhatsApp Business) é aceito', () => {
    expect(validarTelefone('1123456789')).toBeNull()
    expect(formatarTelefone('1123456789')).toBe('(11) 2345-6789')
  })
  it('vazio e curto', () => {
    expect(validarTelefone('')).toBe('vazio')
    expect(validarTelefone('119123')).toBe('formato')
  })
})
