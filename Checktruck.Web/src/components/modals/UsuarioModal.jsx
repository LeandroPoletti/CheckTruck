import { useState } from 'react'
import { Modal } from '../ui/Overlay'
import { Field, Input, Select, Toggle, Button } from '../ui/Form'
import { usuarioService } from '../../services'
import { CARGOS, CARGOS_GESTAO, PERMISSOES, PERMISSAO_BASE, DEPENDEM_DA_BASE } from '../../data/acesso'

// Cadastro e edição de acesso. Quem abre só renderiza este modal quando ele está aberto,
// então o formulário já nasce com os dados do acesso (ou vazio, no cadastro).
export default function UsuarioModal({ usuario, onClose, onSalvo }) {
  const editando = !!usuario
  const adminDoSistema = !!usuario?.adminDoSistema
  const [form, setForm] = useState(() => ({
    nome: usuario?.nome ?? '',
    email: usuario?.email ?? '',
    cpf: usuario?.cpf ?? '',
    cargo: usuario?.cargo ?? '',
    permissoes: usuario && !usuario.cuidaDosAcessos ? usuario.permissoes : [],
    senha: '',
    confirmar: '',
  }))
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  // Admin e Gestor podem tudo: as permissões nem aparecem para ligar
  const gestao = CARGOS_GESTAO.includes(form.cargo)
  // "Ver frota" fica travada enquanto Veículos, Atualizar km ou Ordem de serviço estiver ligada
  const baseTravada = form.permissoes.some((p) => DEPENDEM_DA_BASE.includes(p))

  function set(campo, valor) {
    setForm((f) => ({ ...f, [campo]: valor }))
  }

  function alternarPermissao(id, ligar) {
    setForm((f) => {
      const permissoes = ligar ? [...f.permissoes, id] : f.permissoes.filter((p) => p !== id)
      if (ligar && DEPENDEM_DA_BASE.includes(id) && !permissoes.includes(PERMISSAO_BASE)) permissoes.push(PERMISSAO_BASE)
      return { ...f, permissoes }
    })
  }

  function validar() {
    if (!form.nome.trim() || !form.email.trim() || !form.cargo) return 'Preencha nome, e-mail e cargo.'
    if (!adminDoSistema && !form.cpf.trim()) return 'Informe o CPF.'
    if (!editando && !form.senha) return 'Informe a senha.'
    if (form.senha !== form.confirmar) return 'As senhas não conferem.'
    if (!gestao && form.permissoes.length === 0) return 'Ligue pelo menos uma permissão.'
    return ''
  }

  async function salvar() {
    const problema = validar()
    if (problema) {
      setErro(problema)
      return
    }
    setSalvando(true)
    setErro('')
    try {
      const dados = { ...form, permissoes: gestao ? [] : form.permissoes }
      if (editando) await usuarioService.atualizar(usuario.id, dados)
      else await usuarioService.criar(dados)
      onSalvo?.()
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
      title={editando ? 'Editar acesso' : 'Novo acesso'}
      subtitle="Login, cargo e o que a pessoa pode fazer no sistema"
      width="max-w-xl"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Cancelar</Button>
          <Button onClick={salvar} disabled={salvando}>
            {salvando ? 'Salvando…' : editando ? 'Salvar' : 'Criar acesso'}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Nome completo" required>
          <Input value={form.nome} onChange={(e) => set('nome', e.target.value)} placeholder="Diego Farias" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="E-mail" required hint={adminDoSistema ? 'O e-mail do admin do sistema não muda.' : 'É o login.'}>
            <Input
              type="email"
              value={form.email}
              onChange={(e) => set('email', e.target.value)}
              disabled={adminDoSistema}
              placeholder="diego@transportadora.com.br"
            />
          </Field>
          <Field label="CPF" required={!adminDoSistema}>
            <Input value={form.cpf} onChange={(e) => set('cpf', e.target.value)} placeholder="000.000.000-00" />
          </Field>
        </div>
        <Field label="Cargo" required>
          <Select value={form.cargo} onChange={(e) => set('cargo', e.target.value)} disabled={adminDoSistema}>
            <option value="">Escolha o cargo</option>
            {CARGOS.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </Select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field
            label={editando ? 'Nova senha' : 'Senha provisória'}
            required={!editando}
            hint={editando ? 'Em branco mantém a senha atual.' : 'Letra maiúscula, minúscula, número e símbolo.'}
          >
            <Input type="password" value={form.senha} onChange={(e) => set('senha', e.target.value)} />
          </Field>
          <Field label="Confirmar senha" required={!editando}>
            <Input type="password" value={form.confirmar} onChange={(e) => set('confirmar', e.target.value)} />
          </Field>
        </div>

        <div>
          <p className="mb-2 text-[11px] font-semibold tracking-wide text-brand-800/70">PERMISSÕES</p>
          {gestao ? (
            <p className="rounded-lg bg-brand-50 px-3 py-2.5 text-sm text-brand-800">
              Admin e Gestor podem tudo e cuidam dos acessos.
            </p>
          ) : (
            <div className="divide-y divide-stone-100 rounded-lg border border-stone-200">
              {PERMISSOES.map((p) => (
                <div key={p.id} className="flex items-center justify-between gap-4 px-3 py-2.5">
                  <div>
                    <p className="text-sm font-medium text-stone-800">{p.nome}</p>
                    <p className="text-xs text-stone-500">{p.descricao}</p>
                  </div>
                  <Toggle
                    checked={form.permissoes.includes(p.id)}
                    onChange={(ligar) => alternarPermissao(p.id, ligar)}
                    disabled={p.id === PERMISSAO_BASE && baseTravada}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {erro && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</p>}
      </div>
    </Modal>
  )
}
