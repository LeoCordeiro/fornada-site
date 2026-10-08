// Tom e lado da foto de cada faixa de categoria em Produtos — FIXOS pela ordem original (a faixa que fica no FLIP não
// troca de cor): pares = marrom com a foto à esquerda, ímpares = creme com a foto à direita. Com o filtro creme em
// cima e o fim marrom embaixo, "Todos" tem costura em toda divisa.
const indice = (todas, cat) => todas.findIndex((c) => c.chave === cat.chave)
export const tomDaFaixa = (todas, cat) => (indice(todas, cat) % 2 === 0 ? 'marrom' : 'creme')
export const ladoDaFaixa = (todas, cat) => (indice(todas, cat) % 2 === 0 ? 'esquerda' : 'direita')
