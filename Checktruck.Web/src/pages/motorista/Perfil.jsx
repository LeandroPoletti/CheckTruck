import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { PageHeader, Card } from '../../components/Layout'
import { Field, Input, Button } from '../../components/ui/Form'
import { PlacaBadge } from '../../components/ui/Badges'

export default function MotoristaPerfil() {
  const { user, veiculos, updatePessoa } = useApp()
  const veiculo = veiculos.find((v) => v.motoristaId === user.id && v.ativo)

  const [nome, setNome] = useState(user.nome)
  const [novaSenha, setNovaSenha] = useState('')
  const [salvo, setSalvo] = useState(false)

  function handleSalvar(e) {
    e.preventDefault()
    const patch = { nome: nome.trim() }
    if (novaSenha) patch.senha = novaSenha
    updatePessoa(user.id, patch)
    setNovaSenha('')
    setSalvo(true)
    setTimeout(() => setSalvo(false), 2500)
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
              <Input value={user.cpf || '—'} disabled className="bg-stone-50 text-stone-400" />
            </Field>
            <Field label="Nova senha" hint="Deixe em branco para manter a senha atual.">
              <Input type="password" value={novaSenha} onChange={(e) => setNovaSenha(e.target.value)} placeholder="••••••••" />
            </Field>
            {salvo && <p className="text-sm font-medium text-brand-700">Perfil atualizado.</p>}
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
