import { useEffect, useState } from 'react'
import { useApp } from '../../context/AppContext'
import { Modal } from '../ui/Overlay'
import { Field, Input, Select, Button } from '../ui/Form'

export default function NovaPessoaModal({ open, onClose, perfilInicial = 'motorista' }) {
  const { addPessoa, updateVeiculo, veiculos } = useApp()
  const [passo, setPasso] = useState(1)
  const [nome, setNome] = useState('')
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [perfil, setPerfil] = useState(perfilInicial)
  const [cpf, setCpf] = useState('')
  const [veiculoId, setVeiculoId] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (open) {
      setPasso(1)
      setNome('')
      setEmail('')
      setSenha('')
      setConfirmar('')
      setPerfil(perfilInicial)
      setCpf('')
      setVeiculoId('')
      setError('')
    }
  }, [open, perfilInicial])

  const veiculosSemMotorista = veiculos.filter((v) => v.ativo && !v.motoristaId)

  function handleContinuar(e) {
    e.preventDefault()
    if (!nome.trim() || !email.trim() || !senha) {
      setError('Preencha nome, e-mail e senha provisória.')
      return
    }
    if (senha !== confirmar) {
      setError('As senhas não coincidem.')
      return
    }
    setError('')
    setPasso(2)
  }

  function handleFinalizar() {
    if (!cpf.trim()) {
      setError('Informe o CPF.')
      return
    }
    const pessoa = addPessoa({
      nome: nome.trim(),
      email: email.trim(),
      senha,
      perfil,
      cpf: cpf.trim(),
      veiculoId: perfil === 'motorista' ? (veiculoId || null) : undefined,
    })
    if (perfil === 'motorista' && veiculoId) {
      updateVeiculo(veiculoId, { motoristaId: pessoa.id })
    }
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      eyebrow="POST /register → POST /api/pessoas"
      title="Nova pessoa"
      subtitle="Conta de acesso e depois perfil + CPF"
      width="max-w-lg"
      footer={
        passo === 1 ? (
          <>
            <Button variant="secondary" onClick={onClose}>Cancelar</Button>
            <Button onClick={handleContinuar}>Continuar</Button>
          </>
        ) : (
          <>
            <Button variant="secondary" onClick={() => setPasso(1)}>Voltar</Button>
            <Button onClick={handleFinalizar}>Cadastrar pessoa</Button>
          </>
        )
      }
    >
      <div className="mb-5 flex items-center gap-3">
        <Step n={1} label="Conta de acesso" active={passo === 1} done={passo > 1} />
        <div className="h-px flex-1 bg-stone-200" />
        <Step n={2} label="Perfil e vínculo" active={passo === 2} done={false} />
      </div>

      {passo === 1 ? (
        <form onSubmit={handleContinuar} className="space-y-4">
          <Field label="Nome completo" required>
            <Input value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Diego Farias" />
          </Field>
          <Field label="E-mail" required hint="Será o login. Único no sistema.">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="diego.farias@transp.com.br" />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Senha provisória" required>
              <Input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} />
            </Field>
            <Field label="Confirmar" required>
              <Input type="password" value={confirmar} onChange={(e) => setConfirmar(e.target.value)} />
            </Field>
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <p className="rounded-lg bg-brand-50 px-3 py-2.5 text-xs text-brand-800">
            A conta é criada com o papel escolhido no passo 2. O CPF e o vínculo com veículo
            pertencem ao registro de motorista ou técnico.
          </p>
        </form>
      ) : (
        <div className="space-y-4">
          <div>
            <p className="mb-1.5 text-[11px] font-semibold tracking-wide text-brand-800/70">PERFIL</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPerfil('motorista')}
                className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                  perfil === 'motorista' ? 'border-brand-600 bg-brand-50 text-brand-800' : 'border-stone-300 text-stone-500'
                }`}
              >
                Motorista
              </button>
              <button
                type="button"
                onClick={() => setPerfil('mecanico')}
                className={`rounded-lg border px-3 py-2 text-sm font-semibold transition ${
                  perfil === 'mecanico' ? 'border-brand-600 bg-brand-50 text-brand-800' : 'border-stone-300 text-stone-500'
                }`}
              >
                Técnico
              </button>
            </div>
          </div>
          <Field label="CPF" required>
            <Input value={cpf} onChange={(e) => setCpf(e.target.value)} placeholder="000.000.000-00" />
          </Field>
          {perfil === 'motorista' && (
            <Field label="Veículo (opcional)">
              <Select value={veiculoId} onChange={(e) => setVeiculoId(e.target.value)}>
                <option value="">Sem veículo</option>
                {veiculosSemMotorista.map((v) => (
                  <option key={v.id} value={v.id}>{v.placa}</option>
                ))}
              </Select>
            </Field>
          )}
          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>
      )}
    </Modal>
  )
}

function Step({ n, label, active, done }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
          done ? 'bg-brand-600 text-white' : active ? 'bg-brand-700 text-white' : 'bg-stone-200 text-stone-500'
        }`}
      >
        {n}
      </span>
      <span className={`text-sm ${active ? 'font-semibold text-stone-900' : 'text-stone-400'}`}>{label}</span>
    </div>
  )
}
