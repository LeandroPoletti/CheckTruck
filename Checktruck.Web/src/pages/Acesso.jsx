import { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { PageHeader, Card, Carregando, ErroCarregamento, EmptyState } from '../components/Layout'
import { Button } from '../components/ui/Form'
import UsuarioModal from '../components/modals/UsuarioModal'
import ConfirmarExclusaoModal from '../components/modals/ConfirmarExclusaoModal'
import { usuarioService } from '../services'
import { obterUsuario } from '../services/sessao'
import { PERMISSOES, nomeCargo, formatCpf } from '../data/acesso'

const ABAS = [
  { id: 'ativos', label: 'Ativos' },
  { id: 'inativos', label: 'Inativos' },
]

// Quem entra no sistema. Só Admin e Gestor chegam nesta tela.
export default function Acesso() {
  const eu = obterUsuario()
  const [aba, setAba] = useState('ativos')
  const [usuarios, setUsuarios] = useState([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState(null)
  const [erroAcao, setErroAcao] = useState(null)
  const [versao, setVersao] = useState(0)
  const [editando, setEditando] = useState(null) // { usuario } (null no cadastro) enquanto o modal está aberto
  const [desativando, setDesativando] = useState(null)

  useEffect(() => {
    let cancelado = false
    usuarioService.listar()
      .then((lista) => { if (!cancelado) setUsuarios(lista) })
      .catch((e) => { if (!cancelado) setErro(e.message) })
      .finally(() => { if (!cancelado) setCarregando(false) })
    return () => { cancelado = true }
  }, [versao])

  // Após salvar: atualiza em segundo plano, sem desmontar a tela
  function recarregar() {
    setErro(null)
    setVersao((v) => v + 1)
  }

  function tentarNovamente() {
    setCarregando(true)
    recarregar()
  }

  async function ativar(usuario) {
    setErroAcao(null)
    try {
      await usuarioService.alterarAtivo(usuario.id, true)
      recarregar()
    } catch (e) {
      setErroAcao(e.message)
    }
  }

  if (carregando) return <Carregando />
  if (erro) return <ErroCarregamento mensagem={erro} onTentarNovamente={tentarNovamente} />

  const contagem = {
    ativos: usuarios.filter((u) => u.ativo).length,
    inativos: usuarios.filter((u) => !u.ativo).length,
  }
  const lista = usuarios.filter((u) => (aba === 'ativos' ? u.ativo : !u.ativo))

  return (
    <>
      <PageHeader
        title="Acesso"
        subtitle="Quem entra no sistema, o cargo e o que cada um pode fazer"
        action={<Button onClick={() => setEditando({ usuario: null })}><Plus size={16} /> Novo acesso</Button>}
      />

      <div className="mb-5 flex gap-6 border-b border-stone-200">
        {ABAS.map((a) => (
          <button
            key={a.id}
            onClick={() => setAba(a.id)}
            className={`-mb-px border-b-2 pb-2.5 text-sm font-semibold transition ${
              aba === a.id ? 'border-brand-700 text-brand-800' : 'border-transparent text-stone-400 hover:text-stone-600'
            }`}
          >
            {a.label} · {contagem[a.id]}
          </button>
        ))}
      </div>

      {erroAcao && <ErroCarregamento mensagem={erroAcao} />}

      {lista.length === 0 ? (
        <EmptyState
          title={aba === 'ativos' ? 'Nenhum acesso ativo' : 'Nenhum acesso desativado'}
          subtitle={aba === 'ativos' ? 'Cadastre quem vai entrar no sistema.' : 'Quem for desativado aparece aqui.'}
        />
      ) : (
        <Card className="overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-stone-50 text-left text-[11px] font-semibold tracking-wide text-stone-400">
              <tr>
                <th className="px-4 py-2.5">NOME</th>
                <th className="px-4 py-2.5">CPF</th>
                <th className="px-4 py-2.5">CARGO</th>
                <th className="px-4 py-2.5">PERMISSÕES</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {lista.map((u) => (
                <tr key={u.id}>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-stone-900">{u.nome}</p>
                    <p className="text-xs text-stone-500">{u.email}</p>
                  </td>
                  <td className="px-4 py-3 text-stone-600">{formatCpf(u.cpf)}</td>
                  <td className="px-4 py-3 text-stone-700">{nomeCargo(u.cargo)}</td>
                  <td className="px-4 py-3 text-stone-600" title={u.permissoes.map((id) => PERMISSOES.find((p) => p.id === id)?.nome).join(', ')}>
                    {u.cuidaDosAcessos ? 'Todas' : `${u.permissoes.length} de ${PERMISSOES.length}`}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-3 text-xs font-semibold">
                      <button onClick={() => setEditando({ usuario: u })} className="text-brand-700 hover:underline">
                        Editar
                      </button>
                      {u.ativo && !u.adminDoSistema && u.id !== eu.id && (
                        <button onClick={() => setDesativando(u)} className="text-red-600 hover:underline">
                          Desativar
                        </button>
                      )}
                      {!u.ativo && (
                        <button onClick={() => ativar(u)} className="text-brand-700 hover:underline">
                          Ativar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {editando && (
        <UsuarioModal usuario={editando.usuario} onClose={() => setEditando(null)} onSalvo={recarregar} />
      )}
      <ConfirmarExclusaoModal
        open={!!desativando}
        onClose={() => setDesativando(null)}
        titulo="Desativar acesso"
        rotulo="Desativar"
        descricao={`${desativando?.nome} não vai mais conseguir entrar no sistema. Dá para ativar de novo depois.`}
        onConfirmar={async () => {
          await usuarioService.alterarAtivo(desativando.id, false)
          recarregar()
        }}
      />
    </>
  )
}
