import { useParams } from 'react-router-dom'
import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import VeiculoDetalhePanel from '../../components/VeiculoDetalhePanel'
import { Button } from '../../components/ui/Form'
import AtualizarKmModal from '../../components/modals/AtualizarKmModal'
import RegistrarManutencaoModal from '../../components/modals/RegistrarManutencaoModal'
import NovoChamadoModal from '../../components/modals/NovoChamadoModal'

export default function MecanicoVeiculoDetalhe() {
  const { id } = useParams()
  const { veiculos } = useApp()
  const veiculo = veiculos.find((v) => v.id === id)
  const [kmOpen, setKmOpen] = useState(false)
  const [manutencaoOpen, setManutencaoOpen] = useState(false)
  const [chamadoOpen, setChamadoOpen] = useState(false)

  return (
    <>
      <VeiculoDetalhePanel
        backTo="/mecanico/veiculos"
        actions={
          veiculo && (
            <div className="flex gap-2">
              <Button variant="secondary" onClick={() => setKmOpen(true)}>Atualizar km</Button>
              <Button variant="secondary" onClick={() => setChamadoOpen(true)}>Abrir chamado</Button>
              <Button onClick={() => setManutencaoOpen(true)}>Registrar manutenção</Button>
            </div>
          )
        }
      />
      <AtualizarKmModal open={kmOpen} onClose={() => setKmOpen(false)} veiculo={veiculo} />
      <RegistrarManutencaoModal open={manutencaoOpen} onClose={() => setManutencaoOpen(false)} veiculo={veiculo} />
      <NovoChamadoModal open={chamadoOpen} onClose={() => setChamadoOpen(false)} veiculo={veiculo} />
    </>
  )
}
