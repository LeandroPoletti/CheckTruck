import { useEffect, useState } from 'react'
import { Pause, Play } from 'lucide-react'
import Logo from '../../components/marca/Logo'
import foto01 from '../../assets/login/caminhao-01.webp'
import foto02 from '../../assets/login/caminhao-02.jpg'
import foto03 from '../../assets/login/caminhao-03.jpg'
import foto04 from '../../assets/login/caminhao-04.jpg'
import foto05 from '../../assets/login/caminhao-05.webp'
import foto06 from '../../assets/login/caminhao-06.jpg'
import foto07 from '../../assets/login/caminhao-07.jpg'
import foto08 from '../../assets/login/caminhao-08.webp'
import foto09 from '../../assets/login/caminhao-09.jpg'
import foto10 from '../../assets/login/caminhao-10.jpg'

// Fotos que passam no login, na ordem: as grandes com 1800 de altura (nítidas até em tela retina) e as do WhatsApp
// como vieram, sem comprimir de novo. foco: onde está o caminhão na largura da foto, para ele não sair do corte
// quando a foto deitada fica numa área em pé (e para onde a foto aproxima). movimento: o andar lento da foto
// (index.css), variando de uma para a outra
const FOTOS = [
  { src: foto01, foco: '50%', movimento: 'foto-aproximar' },
  { src: foto02, foco: '55%', movimento: 'foto-esquerda' },
  { src: foto03, foco: '75%', movimento: 'foto-afastar' },
  { src: foto04, foco: '50%', movimento: 'foto-direita' },
  { src: foto05, foco: '40%', movimento: 'foto-aproximar' },
  { src: foto06, foco: '30%', movimento: 'foto-afastar' },
  { src: foto07, foco: '50%', movimento: 'foto-esquerda' },
  { src: foto08, foco: '60%', movimento: 'foto-aproximar' },
  { src: foto09, foco: '60%', movimento: 'foto-direita' },
  { src: foto10, foco: '50%', movimento: 'foto-afastar' },
]
const TROCA_MS = 7000
const DISSOLVER_MS = 2000
// A primeira foto em 40 px, já no código: aparece borrada na hora em que a tela abre, enquanto a de verdade baixa
const PREVIA_DA_PRIMEIRA = 'data:image/webp;base64,UklGRooBAABXRUJQVlA4IH4BAABwCQCdASooABsAPrVMokwnJCMiKrgKAOAWiWYAnTKEhSerqj8+2pmNSDpAz8QcsRL/NyIbiMuNWUT9ZLejJ+PWEcGWSdwteZLzZrv3JYp6cLURaQAA/rINnrdNnO4Fo1Ze2azGQpeXNxUF6wHbmOgW8wr8/SMgYgEmYO5k3FzGBT6oEnZRJ+baqOqgnzdL7DYQ0eTvDyI+Lq/6sFTaRovtH1Fb+8jrudplgqZ5ue9YK9es28f1eeLRNyfHuD0jKdNiKLjmENxPki1Fwvr6qFN1n5v10p/PKkfVSeGG1mKIYuj0OZYLjmMpfQM/NJqbFjyeY2IelniiNwA9LiIxNcOKm8oraveSMtXI//PoL1hwotIxYKrLfcYV08OUb1utgFbaPB+XOGA+sQKphGapQZg9oC5+3m8/8sXp4lcVz03vSKFtHMHd55La+oUSTBRl97CfH/UL9rnQbkex5Id6O3ZcSDLYXwYxEL/xo3foiOmQFluOSDG3WZ5qlQFYAAAA'
const PAUSADAS = 'checktruck.fotosPausadas'

function lerPausadas() {
  try {
    return localStorage.getItem(PAUSADAS) === '1'
  } catch {
    return false
  }
}

// As fotos trocando a cada 7 segundos, como nos slideshows da Apple (efeito Ken Burns): cada foto anda devagar e a
// próxima aparece aos poucos por cima dela (2 segundos), com as duas ainda em movimento. Só baixa a foto da vez e a
// próxima. A tela já abre com a primeira foto (borrada até ela baixar). O botão de pausa para tudo (e fica lembrado
// neste navegador); quem pediu menos movimento no sistema vê só a primeira, parada e sem o botão.
function FotosDeCaminhao({ className }) {
  const [menosMovimento] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  const [pausadas, setPausadas] = useState(lerPausadas)
  const [passo, setPasso] = useState(0)
  const [primeiraBaixou, setPrimeiraBaixou] = useState(false)

  useEffect(() => {
    if (menosMovimento || pausadas) return undefined
    const relogio = setInterval(() => setPasso((p) => p + 1), TROCA_MS)
    return () => clearInterval(relogio)
  }, [menosMovimento, pausadas])

  function pausarOuContinuar() {
    setPausadas(!pausadas)
    try {
      localStorage.setItem(PAUSADAS, pausadas ? '0' : '1')
    } catch { /* sem localStorage, vale só até fechar a tela */ }
  }

  const atual = passo % FOTOS.length
  const anterior = passo > 0 ? (passo - 1) % FOTOS.length : -1
  return (
    <div className={`overflow-hidden bg-black ${className}`}>
      <div
        aria-hidden="true"
        style={{ backgroundImage: `url(${PREVIA_DA_PRIMEIRA})`, backgroundPosition: `${FOTOS[0].foco} 50%` }}
        className="absolute inset-0 scale-110 bg-cover blur-xl"
      />
      {FOTOS.map((foto, i) => {
        if (i > passo + 1) return null
        const naTela = i === atual || i === anterior
        const primeiraVez = passo === 0 // a primeira foto, quando baixa, só tira o borrado (rápido)
        return (
          <img
            key={foto.src}
            src={foto.src}
            alt=""
            aria-hidden="true"
            decoding="async"
            fetchPriority={i === 0 ? 'high' : 'auto'}
            onLoad={i === 0 ? () => setPrimeiraBaixou(true) : undefined}
            style={{
              objectPosition: `${foto.foco} 50%`,
              transformOrigin: `${foto.foco} 50%`,
              zIndex: i === atual ? 2 : i === anterior ? 1 : 0,
              opacity: naTela && (primeiraBaixou || !primeiraVez) ? 1 : 0,
              transition: i === atual ? `opacity ${primeiraVez ? 500 : DISSOLVER_MS}ms ease-in-out` : 'none',
              animationName: naTela && !menosMovimento ? foto.movimento : 'none',
              animationDuration: `${TROCA_MS + 2 * DISSOLVER_MS}ms`,
              animationTimingFunction: 'linear',
              animationFillMode: 'forwards',
              animationPlayState: pausadas ? 'paused' : 'running',
            }}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )
      })}
      {/* Escurece a parte de cima da foto, onde fica a logo */}
      <div aria-hidden="true" className="absolute inset-0 z-[3] bg-linear-to-b from-black/70 via-black/15 to-black/35" />
      {!menosMovimento && (
        <button
          type="button"
          onClick={pausarOuContinuar}
          aria-label={pausadas ? 'Continuar as fotos' : 'Pausar as fotos'}
          title={pausadas ? 'Continuar as fotos' : 'Pausar as fotos'}
          className="absolute right-3 bottom-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/35 text-white/90 backdrop-blur-sm transition hover:bg-black/55 hover:text-white lg:right-6 lg:bottom-6"
        >
          {pausadas ? <Play size={16} fill="currentColor" /> : <Pause size={16} fill="currentColor" />}
        </button>
      )}
    </div>
  )
}

// Moldura da tela de quem ainda não entrou (login). No computador: à esquerda a marca em cima das fotos de caminhão,
// à direita o cartão. No celular: as fotos numa faixa em cima, com a marca, e o cartão embaixo.
// abaixo: o que fica embaixo do cartão (ex.: contas de demonstração).
export default function TelaPublica({ children, abaixo }) {
  return (
    <div className="flex min-h-screen flex-col bg-mist-50 lg:flex-row">
      <section className="relative h-64 shrink-0 text-white sm:h-80 lg:h-auto lg:w-[46%] lg:max-w-[680px]">
        <FotosDeCaminhao className="absolute inset-0" />
        <div className="relative z-10 px-6 pt-7 text-center lg:hidden">
          <h1><Logo tamanho={44} className="text-[32px]" /></h1>
          <p className="mt-2 text-white/85">Controle de manutenção preventiva</p>
        </div>
        <div className="relative z-10 hidden px-14 pt-16 lg:block">
          <h1><Logo tamanho={60} className="gap-4 text-[46px]" /></h1>
          <p className="mt-4 max-w-sm text-lg text-white/85">Controle de manutenção preventiva</p>
        </div>
      </section>

      <main className="flex flex-1 justify-center px-6 py-8 lg:items-center lg:py-10">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-stone-200 bg-white px-8 py-8">{children}</div>
          {abaixo}
        </div>
      </main>
    </div>
  )
}
