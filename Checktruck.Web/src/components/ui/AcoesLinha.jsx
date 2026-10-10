import { obterUsuario } from '../../services/sessao'
import { podeMexerNoItem } from '../../data/acesso'

// Ações "Editar" / "Excluir" das linhas das tabelas de cadastro
export default function AcoesLinha({ onEditar, onExcluir }) {
  return (
    <div className="flex justify-end gap-3">
      <button onClick={onEditar} className="text-xs font-semibold text-brand-700 hover:text-brand-900">Editar</button>
      <button onClick={onExcluir} className="text-xs font-semibold text-red-600 hover:text-red-800">Excluir</button>
    </div>
  )
}

// As mesmas ações para um item do catálogo, só para quem pode mudar o item; para a empresa,
// o item do catálogo do sistema mostra "Do sistema" no lugar
export function AcoesDoCatalogo({ item, onEditar, onExcluir }) {
  if (podeMexerNoItem(obterUsuario(), item)) return <AcoesLinha onEditar={onEditar} onExcluir={onExcluir} />
  return <span className="text-xs text-stone-400">Do sistema</span>
}
