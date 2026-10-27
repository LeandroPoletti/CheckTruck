import { useState } from 'react'
import { Plus } from 'lucide-react'
import { PageHeader, Abas, Tabela, Carregando, ErroCarregamento, EmptyState } from '../components/Layout'
import { Button } from '../components/ui/Form'
import { BotaoLinha } from '../components/ui/AcoesLinha'
import EmpresaModal from '../components/modals/EmpresaModal'
import SenhaDoAdminModal from '../components/modals/SenhaDoAdminModal'
import ConfirmarExclusaoModal from '../components/modals/ConfirmarExclusaoModal'
import { empresaService } from '../services'
import { useCargaDaTela } from '../hooks/useCarga'
import { formatDocumento } from '../data/acesso'
import { formatData } from '../data/domain'

const ABAS = [
  { id: 'ativas', label: 'Ativas' },
  { id: 'desativadas', label: 'Desativadas' },
]

// Clientes do CheckTruck. Só o dono do sistema chega nesta tela: cadastra cada empresa com o Admin dela (o login
// que ele passa para o dono da empresa), desativa, ativa de novo e define uma senha nova para o Admin.
export default function Empresas() {
  const [aba, setAba] = useState('ativas')
  const { dados: empresas = [], carregando, erro, recarregar, tentarNovamente } = useCargaDaTela(() => empresaService.listar())
  const [erroAcao, setErroAcao] = useState(null)
  const [cadastrando, setCadastrando] = useState(false)
  const [trocandoSenha, setTrocandoSenha] = useState(null) // empresa do Admin que vai ganhar senha nova
  const [desativando, setDesativando] = useState(null)

  async function ativar(empresa) {
    setErroAcao(null)
    try {
      await empresaService.alterarAtiva(empresa.id, true)
      recarregar()
    } catch (e) {
      setErroAcao(e.message)
    }
  }

  if (carregando) return <Carregando />
  if (erro) return <ErroCarregamento mensagem={erro.message} onTentarNovamente={tentarNovamente} />

  const contagem = {
    ativas: empresas.filter((e) => e.ativa).length,
    desativadas: empresas.filter((e) => !e.ativa).length,
  }
  const lista = empresas.filter((e) => (aba === 'ativas' ? e.ativa : !e.ativa))

  return (
    <>
      <PageHeader
        title="Empresas"
        subtitle="Os clientes do CheckTruck e o login do admin de cada um"
        action={<Button onClick={() => setCadastrando(true)}><Plus size={16} /> Nova empresa</Button>}
      />

      <Abas abas={ABAS} atual={aba} onTrocar={setAba} contagem={contagem} />

      {erroAcao && <ErroCarregamento mensagem={erroAcao} />}

      {lista.length === 0 ? (
        <EmptyState
          title={aba === 'ativas' ? 'Nenhuma empresa ativa' : 'Nenhuma empresa desativada'}
          subtitle={aba === 'ativas' ? 'Cadastre a primeira empresa cliente.' : 'Empresa desativada aparece aqui.'}
        />
      ) : (
        <Tabela colunas={['Empresa', 'Admin', aba === 'desativadas' && 'Desativada em', '']}>
          {lista.map((e) => (
            <tr key={e.id}>
              <td className="px-5 py-3.5">
                <p className="font-semibold text-stone-900">{e.nome}</p>
                <p className="text-xs text-stone-500">{e.documento ? `${e.documento.length === 11 ? 'CPF' : 'CNPJ'} ${formatDocumento(e.documento)}` : 'Sem CNPJ'}</p>
              </td>
              <td className="space-y-1.5 px-5 py-3.5">
                {e.admins.length === 0 && <span className="text-stone-400">Sem admin</span>}
                {e.admins.map((a) => (
                  <div key={a.id}>
                    <p className="font-medium text-stone-800">{a.nome}{!a.ativo && <span className="text-stone-400"> (inativo)</span>}</p>
                    <p className="text-xs text-stone-500">{a.email}</p>
                  </div>
                ))}
              </td>
              {aba === 'desativadas' && <td className="px-5 py-3.5 text-stone-600">{formatData(e.desativadaEm)}</td>}
              <td className="px-5 py-3.5">
                <div className="flex justify-end gap-2">
                  {e.admins.length > 0 && <BotaoLinha onClick={() => setTrocandoSenha(e)}>Nova senha</BotaoLinha>}
                  {e.ativa ? (
                    <BotaoLinha perigo onClick={() => setDesativando(e)}>Desativar</BotaoLinha>
                  ) : (
                    <BotaoLinha onClick={() => ativar(e)}>Ativar</BotaoLinha>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </Tabela>
      )}

      {cadastrando && <EmpresaModal onClose={() => setCadastrando(false)} onSalvo={recarregar} />}
      {trocandoSenha && <SenhaDoAdminModal empresa={trocandoSenha} onClose={() => setTrocandoSenha(null)} />}
      {desativando && (
        <ConfirmarExclusaoModal
          onClose={() => setDesativando(null)}
          titulo="Desativar empresa"
          rotulo="Desativar"
          descricao={`Ninguém da ${desativando.nome} vai conseguir entrar no site nem no app. Os dados ficam guardados, e dá para ativar de novo depois.`}
          onConfirmar={async () => {
            await empresaService.alterarAtiva(desativando.id, false)
            recarregar()
          }}
        />
      )}
    </>
  )
}
