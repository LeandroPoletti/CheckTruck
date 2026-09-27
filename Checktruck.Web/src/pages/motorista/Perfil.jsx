import { useEffect, useState } from 'react'
import { PageHeader, Card, Carregando, ErroCarregamento } from '../../components/Layout'
import { Field, Input, Button } from '../../components/ui/Form'
import { PlacaBadge } from '../../components/ui/Badges'
import { usuarioService, veiculoService, filtro } from '../../services'
import { obterUsuario } from '../../services/sessao'

export default function MotoristaPerfil() {
  const user = obterUsuario()
  const [veiculo, setVeiculo] = useState(null)
  const [carregando, setCarregando] = useState(true)
  const [erroCarga, setErroCarga] = useState(null)
  const [versao, setVersao] = useState(0)

  // Só o veículo ativo do motorista logado ($filter=Motorista/Id eq X)
  useEffect(() => {
    let cancelado = false
    // sem GET /api/Usuario/me o front não conhece o motoristaId do usuário logado
    const busca = user?.motoristaId
      ? veiculoService.listar(filtro.porId('Motorista', user.motoristaId))
      : Promise.resolve([])
    busca
      .then(([v]) => { if (!cancelado) setVeiculo(v?.ativo ? v : null) })
      .catch((e) => { if (!cancelado) setErroCarga(e.message) })
      .finally(() => { if (!cancelado) setCarregando(false) })
    return () => { cancelado = true }
  }, [user?.motoristaId, versao])

  function tentarNovamente() {
    setCarregando(true)
    setErroCarga(null)
    setVersao((v) => v + 1)
  }

  const [nome, setNome] = useState(user.nome)
  const [novaSenha, setNovaSenha] = useState('')
  const [salvo, setSalvo] = useState(false)
  const [erro, setErro] = useState('')

  async function handleSalvar(e) {
    e.preventDefault()
    const patch = { nome: nome.trim() }
    if (novaSenha) patch.senha = novaSenha
    setErro('')
    try {
      await usuarioService.atualizar(user.id, patch)
    } catch (err) {
      setErro(err.message)
      return
    }
    setNovaSenha('')
    setSalvo(true)
    setTimeout(() => setSalvo(false), 2500)
  }

  if (carregando) return <Carregando />
  if (erroCarga) return <ErroCarregamento mensagem={erroCarga} onTentarNovamente={tentarNovamente} />

  return (
    <>
      <PageHeader title="Meu perfil" subtitle="Dados da sua conta de acesso" />

      <div className="grid grid-cols-2 gap-6">
        <Card className="p-5">
          <h3 className="mb-4 font-semibold text-stone-900">Dados pessoais</h3>
          <form onSubmit={handleSalvar} className="space-y-4">
            <Field label="Nome completo">
              <Input value={nome} onChange={(e) => setNome(e.target.value)} />
            </Field>
            <Field label="E-mail" hint="O e-mail de acesso não pode ser alterado por aqui.">
              <Input value={user.email} disabled className="bg-stone-50 text-stone-400" />
            </Field>
            <Field label="CPF">
              <Input value={user.cpf || '—'} disabled className="bg-stone-50 text-stone-400" />
            </Field>
            <Field label="Nova senha" hint="Deixe em branco para manter a senha atual.">
              <Input type="password" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} placeholder="••••••••" />
            </Field>
            {salvo && <p className="text-sm font-medium text-brand-700">Perfil atualizado.</p>}
            {erro && <p className="text-sm text-red-600">{erro}</p>}
            <Button type="submit">Salvar alterações</Button>
          </form>
        </Card>

        <Card className="p-5">
          <h3 className="mb-4 font-semibold text-stone-900">Veículo atribuído</h3>
          {veiculo ? (
            <div className="flex items-center justify-between rounded-lg border border-stone-100 px-4 py-3">
              <PlacaBadge placa={veiculo.placa} />
              <span className="text-sm text-stone-500">{veiculo.kmAtual.toLocaleString('pt-BR')} km</span>
            </div>
          ) : (
            <p className="text-sm text-stone-400">Nenhum veículo vinculado no momento.</p>
          )}
        </Card>
      </div>
    </>
  )
}
