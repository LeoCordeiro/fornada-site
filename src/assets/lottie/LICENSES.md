# Licenças e origem das animações Lottie

Todas as animações desta pasta são **criação original para a Fornada Conecta**, geradas por código a partir da
geometria do ícone oficial. Nenhuma vem de banco de animações nem de projeto de terceiro. Não há asset raster,
fonte nem expressão embutida.

- **Gerador:** `scripts/lottie-build.mjs` (Node puro, determinístico). Regerar: `npm run lottie:build`.
  Nunca editar os JSON à mão — editar o gerador e regerar; `manifest.json` sai do mesmo comando.
- **Conferência:** `npm run lottie:check` (paleta, peso, fr, curvas e manifest). Roda também em todo `npm run build`.
- **Base geométrica:** logo oficial `assets/logo/fornada-conecta-icone.svg` — arco "C" (centro 100,100,
  r 70, traço 20 arredondado, aberto ±40° à direita), pontos r 6 a cada 18 em (176, 82/100/118).
  A logo não é redesenhada: `pontos-conecta` contém só os pontos; o C das molduras é o mesmo arco, sem o F.

| Arquivo | Origem | Licença de terceiro |
|---|---|---|
| `pontos-conecta.json` (serve também no fundo marrom: só dourado) | original — gerador | nenhuma |
| `pao-cresce.json` · `pao-cresce-invertida.json` | original — gerador | nenhuma |
| `passo-1-pedido.json` · `passo-1-pedido-invertida.json` | original — gerador | nenhuma |
| `passo-2-atribuicao.json` · `passo-2-atribuicao-invertida.json` | original — gerador | nenhuma |
| `passo-3-fornada.json` · `passo-3-fornada-invertida.json` | original — gerador | nenhuma |
| `passo-4-entrega.json` · `passo-4-entrega-invertida.json` | original — gerador | nenhuma |
| `selo-sanitario.json` · `selo-sanitario-invertida.json` | original — gerador | nenhuma |
| `rota-entrega.json` | original — gerador | nenhuma |
| `enviado-sucesso.json` · `enviado-sucesso-invertida.json` | original — gerador | nenhuma |
| `catalogo-vazio.json` | original — gerador | nenhuma |
| `whatsapp-nudge.json` | original — gerador | nenhuma |

Animação de terceiro que entrar no futuro: registrar aqui autor, URL, licença (texto ou link permanente)
e data da verificação, **recolorir para a paleta** e passar no `npm run lottie:check`.
