// Mapa único das fotos do site. Todo FotoReal lê daqui pela `chave`: trocar uma foto é trocar o arquivo em
// src/assets/fotos/ e a entrada aqui — página nenhuma muda.
// Enquanto as fotos reais não chegam, a Início e Produtos usam fotos de banco de imagens: na abertura e na segurança,
// cenas de processo (massa crua em padaria profissional); nas categorias e nas duas portas, fotos ilustrativas de
// produto e de ambiente — as seções que mostram produto trazem a nota "Imagens ilustrativas."
// (NOTA_FOTOS_CATEGORIAS, em data/categorias). Nenhuma foto de banco leva legenda nem crédito na página, e nenhuma
// mostra rosto, adorno em quem manipula alimento, letreiro ou marca legível.
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
  // ---- Início ----
  'inicio-abertura-caixas': {
    // as de banco descrevem o que está na foto, nunca "da Fornada"
    alt: 'Mãos riscando pães crus na boca de um forno de lastro, antes de assar',
    legenda: '', // com a foto real: 'Feita numa entrega de verdade, com a luz da manhã.'
    descricao: 'caixas plásticas de entrega com pães, empilhadas na porta de um comércio de manhã',
    // banco: a fornada riscada antes de entrar num forno de lastro profissional; só antebraços e mãos, sem adorno.
    // < 1024: 4:3 (no tablet o quadro é 3:2 e corta em cima e embaixo) · 1024–1859: 4:5, sangrando à direita, até a
    // altura máxima do quadro · ≥ 1860 o quadro passa de quadrado e entra o 4:3 (`largo`), que perde menos da cena
    imagens: { base: serie('inicio-abertura-4x3'), desktop: serie('inicio-abertura-4x5'), largo: serie('inicio-abertura-4x3') },
    foco: '50% 55%', // mãos e pães, quando o quadro corta em cima e embaixo
  },
  'inicio-qualidade-etiqueta': {
    alt: '',
    legenda: '', // com a foto real: 'Close na etiqueta: a conferência que acontece antes da rota.'
    descricao: 'etiqueta de lote colada na caixa de entrega, mão anotando a data',
    // banco: massa fermentando em fileiras nas tábuas de lona (processo, sem produto prometido); os dois recortes
    // ficam longe das marcas pintadas no pano
    imagens: { base: serie('inicio-seguranca-4x3'), desktop: serie('inicio-seguranca-4x5'), largo: serie('inicio-seguranca-4x3') },
  },
  'inicio-ponta-comercio': {
    alt: 'Balcão de padaria com pães ensacados e o forno ao fundo',
    legenda: '', // sem legenda também com a foto real: a Início não afirma de quem é o balcão
    descricao: 'caixa da manhã sendo recebida no balcão de uma lanchonete, só as mãos',
    imagens: { base: serie('porta-comercio-3x2') }, // banco; recorte sem o quadro com inscrição e o relógio da parede
  },
  'inicio-ponta-produtor': {
    alt: 'Mãos de luva abrindo massa com rolo numa bancada de madeira',
    legenda: '', // sem legenda também com a foto real: a Início não afirma de quem é o forno
    descricao: 'assadeira com pães na porta do forno, mão de luva',
    imagens: { base: serie('porta-produtor-3x2') }, // banco: uniforme branco e luvas, sem rosto
  },

  // ---- Categorias (Início e Produtos): fotos ilustrativas de banco; com a foto real, a legenda do comentário ----
  'categoria-paes': {
    alt: 'Pãezinhos num cesto forrado com papel',
    legenda: '', // com a foto real: 'Produto da rede, do jeito que chega.'
    descricao: 'pães de forma fatiados na caixa de entrega',
    imagens: { base: serie('categoria-paes-4x3') },
  },
  'categoria-bolos': {
    alt: 'Fatia de pão de ló num prato, com o bolo inteiro ao fundo',
    legenda: '',
    descricao: 'bolo inteiro sendo embalado para entrega',
    imagens: { base: serie('categoria-bolos-4x3') },
  },
  'categoria-salgados-assados': {
    alt: 'Salgados assados dourados sobre uma tábua',
    legenda: '',
    descricao: 'salgados assados organizados em bandeja de entrega',
    imagens: { base: serie('categoria-salgados-4x3') },
  },
  'categoria-massas-frescas': {
    alt: 'Mãos abrindo bolas de massa numa bancada de inox',
    legenda: '',
    descricao: 'massa de pizza porcionada em caixa plástica com tampa',
    // banco; recorte sem o rótulo do spray, o bordado da manga e os pães prontos do fundo; retoque: anel do dedo
    imagens: { base: serie('categoria-massas-4x3') },
  },

  // ---- Páginas internas: só foto real; até chegar, o espaço da prévia ----
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
