// Único lugar com hex no projeto (fora dos JSON de Lottie). Daqui saem: o tema do Vuetify, as variáveis
// --fc-* do :root (plugin tokens-da-paleta no vite.config) e o theme-color do index.html.
export const PALETA = {
  creme: '#FAF5EA', // fundo principal; texto sobre escuro
  'creme-2': '#F0E6D2', // superfície alternada; corpo sobre escuro; espaço de foto
  marrom: '#5B3A22', // texto sobre creme; traço do C; blocos escuros
  'marrom-profundo': '#3E2615', // texto do botão dourado; rodapé; numerais
  'marrom-medio': '#826853', // texto secundário SÓ sobre #FAF5EA (≥14 px); borda de campo
  dourado: '#D9A441', // botão, pontos, rota, F, check. NUNCA texto sobre creme
  'dourado-hover': '#C29033', // 4,91 com #3E2615
  'dourado-pressed': '#BD8B2F', // 4,62 com #3E2615
  fio: '#E1D7CA', // fio de 1 px sobre creme
}
// #B8862B fica FORA (4,34 com texto escuro: abaixo de 4,5).
