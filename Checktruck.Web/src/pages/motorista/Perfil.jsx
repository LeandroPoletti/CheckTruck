import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { PageHeader, Card } from '../../components/Layout'
import { Field, Input, Button } from '../../components/ui/Form'
import { PlacaBadge } from '../../components/ui/Badges'

export default function MotoristaPerfil() {
  const { user, veiculos, motoristas, updatePessoa, alterarSenha } = useApp()
  const veiculo = veiculos.find((v) => user.motoristaId && v.motoristaId === user.motoristaId && v.ativo)
  const motorista = motoristas.find((m) => m.id === user.motoristaId)

  const [nome, setNome] = useState(user.nome)
  const [senhaAtual, setSenhaAtual] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [salvo, setSalvo] = useState(false)
  const [error, setError] = useState('')
  const [salvando, setSalvando] = useState(false)

  async function handleSalvar(e) {
    e.preventDefault()
    setError('')
    if (novaSenha && !senhaAtual) {
      setError('Informe a senha atual para definir uma nova senha.')
      return
    }
    setSalvando(true)
    try {
      // POST /manage/info do Identity exige a senha atual para trocar a senha
      if (novaSenha) await alterarSenha(senhaAtual, novaSenha)
      // TODO: API — PUT /api/Usuario/{id} para alterar o nome (ainda não existe)
      if (nome.trim() !== user.nome) await updatePessoa(user.id, { nome: nome.trim() })
      setSenhaAtual('')
      setNovaSenha('')
      setSalvo(true)
      setTimeout(() => setSalvo(false), 2500)
    } catch (err) {
      setError(err.message)
    } finally {
      setSalvando(false)
    }
  }

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
              <Input value={motorista?.cpf || '—'} disabled className="bg-stone-50 text-stone-400" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Senha atual">
                <Input type="password" value={senhaAtual} onChange={(e) => setSenhaAtual(e.target.value)} placeholder="••••••••" />
              </Field>
              <Field label="Nova senha" hint="Deixe em branco para manter.">
                <Input type="password" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} placeholder="••••••••" />
              </Field>
            </div>
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
            {salvo && <p className="text-sm font-medium text-brand-700">Perfil atualizado.</p>}
            <Button type="submit" disabled={salvando}>{salvando ? 'Salvando…' : 'Salvar alterações'}</Button>
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
