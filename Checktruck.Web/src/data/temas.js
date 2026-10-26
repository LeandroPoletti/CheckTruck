// Temas de cor (enum TemaDeCor da API). Cada pessoa escolhe o dela, que fica na conta: vale no site e no app.
// As cores de cada tema estão no index.css (data-tema no <html>); aqui ficam o nome e a amostra da janela de escolha.
export const TEMAS = [
  { id: 'Verde', nome: 'Verde', topo: '#073823', destaque: '#f2c230' },
  { id: 'Azul', nome: 'Azul', topo: '#0f1d4d', destaque: '#f2c230' },
  { id: 'Amarelo', nome: 'Amarelo', topo: '#ffc72c', destaque: '#1e2126' },
  { id: 'Preto', nome: 'Preto', topo: '#141518', destaque: '#f2c230' },
]

// O último tema usado fica guardado à parte da sessão, para a tela de login (antes de entrar) já abrir com ele
const CHAVE = 'checktruck-tema'

export function aplicarTema(tema) {
  const valido = TEMAS.some((t) => t.id === tema) ? tema : 'Verde'
  if (valido === 'Verde') delete document.documentElement.dataset.tema
  else document.documentElement.dataset.tema = valido.toLowerCase()
  try {
    localStorage.setItem(CHAVE, valido)
  } catch {
    // sem localStorage (janela anônima): o tema só não fica guardado para o próximo login
  }
}

export function temaGuardado() {
  try {
    return localStorage.getItem(CHAVE) ?? 'Verde'
  } catch {
    return 'Verde'
  }
}
