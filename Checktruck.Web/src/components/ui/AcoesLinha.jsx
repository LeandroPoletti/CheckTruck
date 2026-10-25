import { obterUsuario } from '../../services/sessao'
import { podeMexerNoItem } from '../../data/acesso'
import { Button } from './Form'

// Botão pequeno das linhas das tabelas e dos cartões (Editar, Desativar, Detalhes...).
// perigo: em vermelho, para o que apaga ou tira o acesso.
export function BotaoLinha({ perigo = false, onClick, children }) {
  return <Button variant={perigo ? 'dangerLight' : 'secondary'} size="sm" onClick={onClick}>{children}</Button>
}

// Ações "Editar" / "Excluir" das linhas das tabelas de cadastro
export default function AcoesLinha({ onEditar, onExcluir }) {
  return (
    <div className="flex justify-end gap-2">
      <BotaoLinha onClick={onEditar}>Editar</BotaoLinha>
      <BotaoLinha perigo onClick={onExcluir}>Excluir</BotaoLinha>
    </div>
  )
}

// As mesmas ações para um item do catálogo, só para quem pode mudar o item; para a empresa,
// o item do catálogo do sistema mostra "Do sistema" no lugar
export function AcoesDoCatalogo({ item, onEditar, onExcluir }) {
  if (podeMexerNoItem(obterUsuario(), item)) return <AcoesLinha onEditar={onEditar} onExcluir={onExcluir} />
  return <span className="text-sm text-stone-400">Do sistema</span>
}
