// Categorias de produto (Home e Produtos). Slugs = os do filtro de Produtos e de `?produtos=`.
// Os exemplos de cada categoria repetem só o que a descrição já cita: nada de item inventado.
// Enquanto CONFIRMADO.exemplosProduto for false, a PRODUÇÃO usa `textoSemExemplos` (a frase sem os itens: diz para
// que serve, sem citar produto) e não desenha a lista de exemplos
// (MOSTRAR_EXEMPLOS no CartaoCategoria). O array `exemplos` continua no dado: a página Produtos usa "tem exemplo"
// para decidir quais categorias aparecem.
// Dev, prévia e teste mostram tudo, com o selo "Exemplos a confirmar".
import { CONFIRMADO, mostrarPendencias } from '@/config/site'

export const MOSTRAR_EXEMPLOS = CONFIRMADO.exemplosProduto || mostrarPendencias

const BASE = [
  {
    chave: 'paes',
    titulo: 'Pães',
    texto: 'O pão do giro diário do balcão: francês, de forma, de leite e pães pra lanche.',
    textoSemExemplos: 'O pão do giro diário do balcão.',
    link: 'Ver pães',
    exemplos: ['Pão francês', 'Pão de forma', 'Pão de leite', 'Pães pra lanche'],
    foto: 'categoria-paes', // chave no mapa único de fotos (src/data/fotos.js)
  },
  {
    chave: 'bolos',
    titulo: 'Bolos',
    texto: 'Bolo inteiro ou em fatia, simples ou com cobertura, pra vitrine e café da tarde.',
    textoSemExemplos: 'Bolo pra vitrine e pro café da tarde.',
    link: 'Ver bolos',
    exemplos: ['Bolo inteiro', 'Bolo em fatia', 'Bolo simples', 'Bolo com cobertura'],
    foto: 'categoria-bolos', // chave no mapa único de fotos (src/data/fotos.js)
  },
  {
    chave: 'salgados-assados',
    titulo: 'Salgados assados',
    texto: 'Salgado assado pra estufa e lanche: esfiha, enroladinho, empada e afins.',
    textoSemExemplos: 'Salgado assado pra estufa e pro lanche.',
    link: 'Ver salgados assados',
    exemplos: ['Esfiha', 'Enroladinho', 'Empada'],
    foto: 'categoria-salgados-assados', // chave no mapa único de fotos (src/data/fotos.js)
  },
  {
    chave: 'massas-frescas',
    titulo: 'Massas frescas',
    texto: 'Massa pra quem finaliza na casa: pizza, pastel e outras, já porcionadas.',
    textoSemExemplos: 'Massa já porcionada, pra quem finaliza na casa.',
    link: 'Ver massas frescas',
    exemplos: ['Massa de pizza', 'Massa de pastel'],
    foto: 'categoria-massas-frescas', // chave no mapa único de fotos (src/data/fotos.js)
  },
]

export const CATEGORIAS = BASE.map(({ textoSemExemplos, ...c }) => (MOSTRAR_EXEMPLOS ? c : { ...c, texto: textoSemExemplos }))

/** A frase de cada categoria, sem a lista de exemplos — a Início usa a de Pães em toda build. */
export const FRASE_CATEGORIA = Object.fromEntries(BASE.map((c) => [c.chave, c.textoSemExemplos]))

export const SLUGS_CATEGORIA = CATEGORIAS.map((c) => c.chave)
export const categoriaPorSlug = (slug) => CATEGORIAS.find((c) => c.chave === slug) ?? null
