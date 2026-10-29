import { Button } from './Form'
import { MAXIMO, maisUmaVez } from '../../data/pagina'

// Fim de uma lista que vem aos poucos (data/pagina.js): quantos aparecem e o botão Ver mais, parado até os novos
// chegarem. No máximo da API, no lugar do botão vem a dica de como achar o resto (ex.: usar a busca ou o período).
//   quantos: quantos foram pedidos. mostrando: quantos vieram. onVerMais(novoQuantos).
export default function VerMais({ quantos, mostrando, total, onVerMais, dicaNoMaximo, className = '' }) {
  if (mostrando >= total) return null
  const noMaximo = quantos >= MAXIMO
  return (
    <div className={`flex flex-wrap items-center justify-center gap-3 text-sm text-stone-500 ${className}`}>
      <span>
        Mostrando {mostrando.toLocaleString('pt-BR')} de {total.toLocaleString('pt-BR')}.
        {noMaximo && dicaNoMaximo && ` ${dicaNoMaximo}`}
      </span>
      {!noMaximo && (
        <Button variant="secondary" disabled={mostrando < Math.min(quantos, total)} onClick={() => onVerMais(maisUmaVez(quantos))}>
          Ver mais
        </Button>
      )}
    </div>
  )
}
