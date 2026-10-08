// Tom da superfície ('creme' | 'marrom' | 'profundo'), HERDADO por inject('fcTom') de quem desenha o fundo
// (BlocoRota, CartaoCategoria, gaveta, rodapé). A prop `tom` explícita de um componente só sobrescreve.
import { computed, inject, provide, unref } from 'vue'

export const TEMA_DO_TOM = { creme: 'fornada', marrom: 'fornadaMarrom', profundo: 'fornadaProfundo' }

/** Quem pinta o fundo fornece o tom para tudo o que está dentro (aceita ref/computed). */
export function provideTom(tom) {
  provide('fcTom', tom)
}

/** Tom efetivo: prop explícita → tom herdado → creme. */
export function useTom(props = {}) {
  const herdado = inject('fcTom', null)
  const tom = computed(() => props.tom || unref(herdado) || 'creme')
  const escuro = computed(() => tom.value !== 'creme')
  return { tom, escuro }
}
