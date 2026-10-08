import { useState } from 'react'
import { tipoManutencaoService } from '../../services'
import { Modal } from '../ui/Overlay'
import { Field, Input, Select, Button } from '../ui/Form'
import { COMPONENTES } from '../../data/domain'

// Cadastrar (registro = null) ou editar um item que o sistema acompanha nos caminhões.
// Quem abre a tela só renderiza este modal quando ele está aberto, então o formulário já nasce com os dados certos.
export default function TipoManutencaoModal({ registro, onClose, onSalvo }) {
  const [form, setForm] = useState(() => ({
    nome: registro?.nome ?? '',
    componenteId: String(registro?.componenteId ?? Object.keys(COMPONENTES)[0]),
    descricao: registro?.descricao ?? '',
  }))
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  function set(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }))
  }

  async function salvar() {
    if (!form.nome.trim()) { setErro('Informe o nome.'); return }
    setSalvando(true)
    setErro('')
    try {
      const dados = { ...form, nome: form.nome.trim(), descricao: form.descricao.trim() }
      if (registro) await tipoManutencaoService.atualizar(registro.id, dados)
      else await tipoManutencaoService.criar(dados)
      onSalvo()
      onClose()
    } catch (e) {
      setErro(e.message)
      setSalvando(false)
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={registro ? 'Editar tipo de manutenção' : 'Novo tipo de manutenção'}
      width="max-w-md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={salvar} disabled={salvando}>{salvando ? 'Salvando…' : 'Salvar'}</Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Nome" required>
          <Input value={form.nome} onChange={(e) => set('nome', e.target.value)} placeholder="Óleo do diferencial 2" autoFocus />
        </Field>

        <Field label="Componente" required hint="Sem intervalo cadastrado, vale o padrão seguro do componente. Embreagem não tem padrão: precisa de intervalo.">
          <Select value={form.componenteId} onChange={(e) => set('componenteId', e.target.value)}>
            {Object.entries(COMPONENTES).map(([id, nome]) => <option key={id} value={id}>{nome}</option>)}
          </Select>
        </Field>

        <Field label="Descrição">
          <Input value={form.descricao} onChange={(e) => set('descricao', e.target.value)} placeholder="O que é trocado" />
        </Field>

        {erro && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p>}
      </div>
    </Modal>
  )
}
