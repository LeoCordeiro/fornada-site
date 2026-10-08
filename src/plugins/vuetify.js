import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi-svg' // ícone por import de path SVG; sem webfont @mdi/font
import { pt } from 'vuetify/locale' // textos internos do Vuetify em português
import { mdiAlertCircleOutline, mdiCheck, mdiChevronDown, mdiClose, mdiMenu } from '@mdi/js'
import { PALETA as P } from '@/styles/paleta'

// mais/menos dos painéis com o traço da marca: barras de 2 px (no ícone de 24) de pontas redondas, como o
// stroke-linecap round do arco C — não o glifo de pontas retas do Material. Mesmo tamanho do mdiPlus (14 px).
const MAIS = 'M6 11h5V6a1 1 0 0 1 2 0v5h5a1 1 0 0 1 0 2h-5v5a1 1 0 0 1-2 0v-5H6a1 1 0 0 1 0-2z'
const MENOS = 'M6 11h12a1 1 0 0 1 0 2H6a1 1 0 0 1 0-2z'

// Toda cor nomeada precisa do on-* explícito: sem ele o Vuetify calcula #fff/#000 (fora da paleta).
const nomeadas = {
  ...P,
  'on-creme': P.marrom, 'on-creme-2': P.marrom, 'on-marrom': P.creme, 'on-marrom-profundo': P.creme,
  'on-marrom-medio': P.creme, 'on-dourado': P['marrom-profundo'], 'on-dourado-hover': P['marrom-profundo'],
  'on-dourado-pressed': P['marrom-profundo'], 'on-fio': P.marrom,
}
// Estados por camada (overlay de currentColor) não chegam nos hex exatos dos estados do botão → camada zerada; o estado vem do CSS.
// Ênfase 1: rótulo/ajuda esmaecidos derrubariam os contrastes calculados (9,32 vira ~5).
const semCamada = {
  'hover-opacity': 0, 'focus-opacity': 0, 'pressed-opacity': 0, 'selected-opacity': 0, 'activated-opacity': 0,
  'dragged-opacity': 0, 'high-emphasis-opacity': 1, 'medium-emphasis-opacity': 1, 'disabled-opacity': 1,
}
// Sem `rounded`: `0` vira .rounded-0 (com !important, campo reto) e `true` vira pílula; o raio-base do .v-field é o
// 4 px.
const campo = {
  variant: 'outlined', density: 'comfortable', color: 'marrom', baseColor: 'marrom-medio',
  hideDetails: 'auto', persistentHint: true,
}

export default createVuetify({
  locale: { locale: 'pt', fallback: 'pt', messages: { pt } },
  theme: {
    defaultTheme: 'fornada',
    variations: false,
    themes: {
      fornada: { // blocos creme
        dark: false,
        colors: {
          ...nomeadas,
          background: P.creme, 'on-background': P.marrom, surface: P.creme, 'on-surface': P.marrom,
          'surface-bright': P.creme, 'surface-light': P['creme-2'], 'surface-variant': P['creme-2'], 'on-surface-variant': P.marrom,
          primary: P.marrom, 'on-primary': P.creme, secondary: P.dourado, 'on-secondary': P['marrom-profundo'],
          error: P['marrom-profundo'], 'on-error': P.creme, success: P.marrom, 'on-success': P.creme,
          info: P.marrom, 'on-info': P.creme, warning: P['marrom-profundo'], 'on-warning': P.creme,
        },
        variables: { 'border-color': P['marrom-medio'], 'border-opacity': 1, ...semCamada, 'theme-code': P['creme-2'], 'theme-on-code': P.marrom },
      },
      fornadaMarrom: { // blocos marrom
        dark: true,
        colors: {
          ...nomeadas,
          background: P.marrom, 'on-background': P.creme, surface: P.marrom, 'on-surface': P.creme,
          'surface-bright': P.marrom, 'surface-light': P['marrom-profundo'], 'surface-variant': P['marrom-profundo'], 'on-surface-variant': P['creme-2'],
          primary: P.creme, 'on-primary': P['marrom-profundo'], secondary: P.dourado, 'on-secondary': P['marrom-profundo'],
          error: P.creme, 'on-error': P['marrom-profundo'], success: P.creme, 'on-success': P['marrom-profundo'],
          info: P.creme, 'on-info': P['marrom-profundo'], warning: P.creme, 'on-warning': P['marrom-profundo'],
        },
        variables: { 'border-color': P['creme-2'], 'border-opacity': 1, ...semCamada },
      },
      fornadaProfundo: { // rodapé marrom-profundo
        dark: true,
        colors: {
          ...nomeadas,
          background: P['marrom-profundo'], 'on-background': P.creme, surface: P['marrom-profundo'], 'on-surface': P.creme,
          'surface-bright': P['marrom-profundo'], 'surface-light': P.marrom, 'surface-variant': P.marrom, 'on-surface-variant': P['creme-2'],
          primary: P.creme, 'on-primary': P['marrom-profundo'], secondary: P.dourado, 'on-secondary': P['marrom-profundo'],
          error: P.creme, 'on-error': P['marrom-profundo'], success: P.creme, 'on-success': P['marrom-profundo'],
          info: P.creme, 'on-info': P['marrom-profundo'], warning: P.creme, 'on-warning': P['marrom-profundo'],
        },
        variables: { 'border-color': P.marrom, 'border-opacity': 1, ...semCamada },
      },
    },
  },
  display: { mobileBreakpoint: 'md', thresholds: { xs: 0, sm: 768, md: 1024, lg: 1280, xl: 1440, xxl: 2560 } }, // cortes da grade do site
  icons: {
    defaultSet: 'mdi',
    aliases: {
      ...aliases,
      fcChevron: mdiChevronDown, fcMais: MAIS, fcMenos: MENOS, fcAviso: mdiAlertCircleOutline,
      fcMenu: mdiMenu, fcFechar: mdiClose, fcCheck: mdiCheck,
    },
    sets: { mdi },
  },
  defaults: {
    global: { ripple: false },
    VBtn: { variant: 'flat', rounded: 'pill', elevation: 0, class: 'fc-vbtn' }, // o site usa BotaoMarca; isto só segura VBtn interno do Vuetify
    VSheet: { rounded: 0, elevation: 0 },
    VCard: { rounded: 0, elevation: 0, flat: true, variant: 'flat', color: 'transparent' }, // cartão Material proibido
    VToolbar: { flat: true, color: 'transparent' },
    VList: { bgColor: 'transparent', rounded: 0, density: 'comfortable' },
    VListItem: { rounded: 0, ripple: false, minHeight: 56, activeClass: 'fc-ativo' },
    VTextField: campo,
    VTextarea: { ...campo, autoGrow: true, rows: 3, counter: 500 },
    VSelect: { ...campo, menuIcon: '$fcChevron', menuProps: { contentClass: 'fc-menu', offset: 4 } },
    VRadioGroup: { color: 'marrom', hideDetails: 'auto', density: 'comfortable' },
    VRadio: { color: 'marrom', density: 'comfortable' },
    VCheckbox: { color: 'marrom', hideDetails: 'auto', density: 'comfortable' },
    VForm: { validateOn: 'invalid-input' },
    // ícone de estado de TODO painel (FAQ, "Neste documento"): o VExpansionPanels repassa os dele aos títulos e vencia o
    // default do título — o chevron do Material chegava à tela
    VExpansionPanels: { variant: 'accordion', flat: true, rounded: 0, static: true, bgColor: 'transparent', expandIcon: '$fcMais', collapseIcon: '$fcMenos' },
    VExpansionPanel: { elevation: 0, rounded: 0, bgColor: 'transparent' },
    VExpansionPanelTitle: { ripple: false, expandIcon: '$fcMais', collapseIcon: '$fcMenos' },
    VAlert: { variant: 'flat', color: 'creme-2', rounded: 0, density: 'compact', border: 'start', borderColor: 'marrom', icon: '$fcAviso' },
    VDivider: { color: 'fio', opacity: 1, thickness: 1 },
  },
})
