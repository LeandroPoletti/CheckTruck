// Ações "Editar" / "Excluir" das linhas das tabelas de cadastro
export default function AcoesLinha({ onEditar, onExcluir }) {
  return (
    <div className="flex justify-end gap-3">
      <button onClick={onEditar} className="text-xs font-semibold text-brand-700 hover:text-brand-900">Editar</button>
      <button onClick={onExcluir} className="text-xs font-semibold text-red-600 hover:text-red-800">Excluir</button>
    </div>
  )
}
