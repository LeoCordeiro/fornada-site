// Mapa único das fotos do site. Todo FotoReal lê daqui pela `chave`: trocar uma foto é trocar o arquivo em
// src/assets/fotos/ e a entrada aqui — página nenhuma muda.
// Foto de banco nunca representa o produto que o cliente recebe — só abertura, ambiente e processo: pão pronto ao lado
// de um título vira promessa de produto, e quem manipula alimento na foto tem de estar dentro da boa prática que o site
// exige (ambiente profissional, sem adorno). Por isso a Início só tem duas de banco, as duas de massa CRUA em padaria
// profissional, e Produtos e as duas pontas ficam sem foto até a real chegar. As de banco vão sem crédito na página e
// sem legenda (a legenda descreve a foto real); decorativa = alt "".
// Sem `imagens` = ainda sem foto: na prévia o FotoReal mostra o espaço com o briefing (`descricao`); em produção não
// desenha nada e quem reservava o espaço pergunta `fotoNoAr(chave)` para fechar o layout.
import { mostrarPendencias } from '@/config/site'

/** Proporções que o espaço de foto aceita (FotoReal). */
export const PROPORCOES = ['4:3', '3:2', '1:1', '3:4', '4:5']

const ARQUIVOS = import.meta.glob('../assets/fotos/*.{webp,jpg}', { eager: true, query: '?url', import: 'default' })

/**
 * Série de larguras de um recorte: arquivos `{nome}-{largura}.{webp|jpg}`, o nome terminando na proporção (`4x5`).
 * Mesmas larguras nos dois formatos; o WebP vai na <source>, o JPEG é a reserva do <img>.
 * → { webp: 'url 480w, …', jpg: 'url 480w, …', src: o jpg do meio, w, h } — w × h do maior arquivo (width/height do
 * <img>: o navegador reserva a proporção antes de baixar, CLS 0).
 */
function serie(nome) {
  const itens = []
  for (const [caminho, url] of Object.entries(ARQUIVOS)) {
    const arquivo = caminho.slice(caminho.lastIndexOf('/') + 1)
    if (!arquivo.startsWith(`${nome}-`)) continue
    const [largura, ext] = arquivo.slice(nome.length + 1).split('.')
    itens.push({ largura: Number(largura), ext, url })
  }
  const [a, b] = nome.slice(nome.lastIndexOf('-') + 1).split('x').map(Number)
  const lista = (ext) =>
    itens
      .filter((i) => i.ext === ext)
      .sort((x, y) => x.largura - y.largura)
  const jpg = lista('jpg')
  const webp = lista('webp')
  // série quebrada não derruba o site: o espaço segue sem foto (prévia: o briefing; produção: some) e o teste acusa
  if (!jpg.length || jpg.length !== webp.length || !a || !b) {
    if (import.meta.env.DEV) console.error(`[fotos] série incompleta: ${nome}`)
    return null
  }
  const w = jpg[jpg.length - 1].largura
  const srcset = (l) => l.map((i) => `${i.url} ${i.largura}w`).join(', ')
  return { webp: srcset(webp), jpg: srcset(jpg), src: jpg[Math.min(1, jpg.length - 1)].url, w, h: Math.round((w * b) / a) }
}

export const FOTOS = {
  // ---- Início: fotos de banco (abertura, ambiente e processo) até a real chegar ----
  'inicio-abertura-caixas': {
    // a única informativa (é a abertura); as de banco descrevem o que está na foto, nunca "da Fornada"
    alt: 'Mãos riscando pães crus na boca de um forno de lastro, antes de assar',
    legenda: '', // com a foto real: 'Feita numa entrega de verdade, com a luz da manhã.'
    descricao: 'caixas plásticas de entrega com pães, empilhadas na porta de um comércio de manhã',
    // banco: a fornada riscada antes de entrar num forno de lastro profissional — produção, não vitrine; massa crua
    // (não é produto pronto), só antebraços e mãos, sem adorno, sem rosto, sem marca
    // < 1024: 4:3 (no tablet o espaço é 3:2 e corta em cima e embaixo) · ≥ 1024: 4:5, sangrando à direita.
    imagens: { base: serie('inicio-abertura-4x3'), desktop: serie('inicio-abertura-4x5') },
  },
  'inicio-qualidade-etiqueta': {
    alt: '',
    legenda: '', // com a foto real: 'Close na etiqueta: a conferência que acontece antes da rota.'
    descricao: 'etiqueta de lote colada na caixa de entrega, mão anotando a data',
    // banco: massa fermentando em fileiras nas tábuas de lona (processo, sem produto prometido); os dois recortes
    // ficam longe das marcas pintadas no pano
    imagens: { base: serie('inicio-seguranca-4x3'), desktop: serie('inicio-seguranca-4x5') },
  },
  'inicio-produtos-forno': {
    alt: '',
    legenda: '', // processo, não produto: nunca legenda que apresente a foto como produto da rede
    descricao: 'fornada saindo do forno da rede, na assadeira',
    // sem banco: colada em "O que sai das fornadas da rede", qualquer pão assado vira o produto da rede
  },
  'inicio-ponta-comercio': {
    alt: '',
    legenda: '',
    descricao: 'caixa da manhã sendo recebida no balcão de uma lanchonete, só as mãos',
    // sem banco: nenhum balcão do acervo é de bairro sem rosto, texto legível ou produto em destaque
  },
  'inicio-ponta-produtor': {
    alt: '',
    legenda: '', // sem legenda também com a foto real: a Início não afirma de quem é o forno
    descricao: 'assadeira com pães na porta do forno, mão de luva',
    // sem banco: as duas portas andam juntas — com uma só, ficariam desiguais
  },

  // ---- Páginas internas: só foto real (cada uma mostra uma coisa da Fornada); até chegar, o espaço da prévia ----
  'categoria-paes': {
    alt: 'Pães de forma fatiados dentro da caixa de entrega',
    legenda: 'Produto da rede, do jeito que chega.',
    descricao: 'pães de forma fatiados na caixa de entrega',
  },
  'categoria-bolos': {
    alt: 'Mãos embalando um bolo inteiro para a entrega',
    legenda: 'Produto da rede, do jeito que chega.',
    descricao: 'bolo inteiro sendo embalado para entrega',
  },
  'categoria-salgados-assados': {
    alt: 'Salgados assados enfileirados numa bandeja de entrega',
    legenda: 'Produto da rede, do jeito que chega.',
    descricao: 'salgados assados organizados em bandeja de entrega',
  },
  'categoria-massas-frescas': {
    alt: 'Discos de massa de pizza porcionados numa caixa plástica com tampa',
    legenda: 'Produto da rede, do jeito que chega.',
    descricao: 'massa de pizza porcionada em caixa plástica com tampa',
  },
  'comercios-balcao': {
    alt: 'Caixa de entrega sendo recebida no balcão de uma lanchonete, de manhã',
    legenda: 'O momento em que a fornada chega no balcão.',
    descricao: 'balcão de lanchonete recebendo a caixa da entrega da manhã',
  },
  'qualidade-conferencia': {
    alt: 'Fornada sendo conferida na bancada antes de seguir para a entrega',
    legenda: 'A fornada passa pela conferência antes de entrar na rota.',
    descricao: 'conferência da fornada na bancada antes da rota',
  },
  'sobre-forno': {
    alt: 'Assadeira com pães saindo do forno da Fornada Conecta', // vale quando a foto real chegar
    legenda: 'O nosso forno, de onde sai parte da produção da rede.',
    descricao: 'o forno do núcleo de fabricação com uma fornada saindo',
  },
}

/** A chave tem arquivo de imagem? */
export const temFoto = (chave) => Boolean(FOTOS[chave]?.imagens?.base)

/** O espaço da foto existe nesta build? Prévia: sempre (o briefing); produção: só com a foto. */
export const fotoNoAr = (chave) => temFoto(chave) || mostrarPendencias
