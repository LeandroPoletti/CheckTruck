import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { aplicarTema, temaGuardado } from './data/temas'
import { obterUsuario, recarregarUsuario } from './services/sessao'

// O tema aparece antes da primeira tela (o da sessão ou o último usado). Quem já entrou busca de novo os dados
// dele ao abrir o site, para pegar o que mudou pelo app (ex.: o tema); se falhar, segue com o que já tinha.
aplicarTema(obterUsuario()?.tema ?? temaGuardado())
if (obterUsuario()) recarregarUsuario().catch(() => {})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
