import { useState } from 'react'
import { Plus } from 'lucide-react'
import { PageHeader, Abas, Tabela, Carregando, ErroCarregamento, EmptyState } from '../components/Layout'
import { Button } from '../components/ui/Form'
import { BotaoLinha } from '../components/ui/AcoesLinha'
import UsuarioModal from '../components/modals/UsuarioModal'
import ConfirmarExclusaoModal from '../components/modals/ConfirmarExclusaoModal'
import { usuarioService } from '../services'
import { useCargaDaTela } from '../hooks/useCarga'
import { obterUsuario } from '../services/sessao'
import { PERMISSOES, nomeCargo, formatCpf, podeMexerNoAcesso } from '../data/acesso'

const ABAS = [
  { id: 'ativos', label: 'Ativos' },
  { id: 'inativos', label: 'Inativos' },
]

// Quem entra no sistema. Só Admin e Gestor chegam nesta tela.
export default function Acesso() {
  const eu = obterUsuario()
  const [aba, setAba] = useState('ativos')
  const { dados: usuarios = [], carregando, erro, recarregar, tentarNovamente } = useCargaDaTela(() => usuarioService.listar())
  const [erroAcao, setErroAcao] = useState(null)
  const [editando, setEditando] = useState(null) // { usuario } (null no cadastro) enquanto o modal está aberto
  const [desativando, setDesativando] = useState(null)

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
  if (erro) return <ErroCarregamento mensagem={erro.message} onTentarNovamente={tentarNovamente} />

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

      <Abas abas={ABAS} atual={aba} onTrocar={setAba} contagem={contagem} />

      {erroAcao && <ErroCarregamento mensagem={erroAcao} />}

      {lista.length === 0 ? (
        <EmptyState
          title={aba === 'ativos' ? 'Nenhum acesso ativo' : 'Nenhum acesso desativado'}
          subtitle={aba === 'ativos' ? 'Cadastre quem vai entrar no sistema.' : 'Quem for desativado aparece aqui.'}
        />
      ) : (
        <Tabela colunas={['Nome', 'CPF', 'Cargo', 'Permissões', '']}>
          {lista.map((u) => (
            <tr key={u.id}>
              <td className="px-5 py-3.5">
                <p className="font-semibold text-stone-900">{u.nome}</p>
                <p className="text-xs text-stone-500">{u.email}</p>
              </td>
              <td className="px-5 py-3.5 text-stone-600">{formatCpf(u.cpf)}</td>
              <td className="px-5 py-3.5 text-stone-700">{nomeCargo(u.cargo)}</td>
              <td className="px-5 py-3.5 text-stone-600" title={u.permissoes.map((id) => PERMISSOES.find((p) => p.id === id)?.nome).join(', ')}>
                {u.cuidaDosAcessos ? 'Todas' : `${u.permissoes.length} de ${PERMISSOES.length}`}
              </td>
              <td className="px-5 py-3.5">
                {podeMexerNoAcesso(eu, u) ? (
                  <div className="flex justify-end gap-2">
                    <BotaoLinha onClick={() => setEditando({ usuario: u })}>Editar</BotaoLinha>
                    {u.ativo && !u.adminDoSistema && u.id !== eu.id && (
                      <BotaoLinha perigo onClick={() => setDesativando(u)}>Desativar</BotaoLinha>
                    )}
                    {!u.ativo && <BotaoLinha onClick={() => ativar(u)}>Ativar</BotaoLinha>}
                  </div>
                ) : (
                  <p className="text-right text-sm text-stone-500">Só um Admin muda</p>
                )}
              </td>
            </tr>
          ))}
        </Tabela>
      )}

      {editando && (
        <UsuarioModal usuario={editando.usuario} onClose={() => setEditando(null)} onSalvo={recarregar} />
      )}
      {desativando && (
        <ConfirmarExclusaoModal
          onClose={() => setDesativando(null)}
          titulo="Desativar acesso"
          rotulo="Desativar"
          descricao={`${desativando.nome} não vai mais conseguir entrar no sistema. Dá para ativar de novo depois.`}
          onConfirmar={async () => {
            await usuarioService.alterarAtivo(desativando.id, false)
            recarregar()
          }}
        />
      )}
    </>
  )
}
