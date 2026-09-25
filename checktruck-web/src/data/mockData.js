// Dados mock do CheckTruck — simula o retorno da API (.NET 8 + PostgreSQL)
// conforme modelagem descrita no TCC (Fabricante, GeracaoModelo, Modelo,
// TipoManutencao, IntervaloRecomendado, Veiculo, Usuario, RegistroManutencao).

export const fabricantes = [
  { id: 'volvo', nome: 'Volvo', pais: 'Suécia' },
  { id: 'scania', nome: 'Scania', pais: 'Suécia' },
  { id: 'iveco', nome: 'Iveco', pais: 'Itália' },
  { id: 'mercedes', nome: 'Mercedes-Benz', pais: 'Alemanha' },
]

export const geracoes = [
  { id: 'gen3', fabricanteId: 'volvo', nome: 'FH Clássico (Gen 3)', periodo: '2012–2014', motor: 'D13C (460cv) / D16G (540cv)', cambio: 'I-Shift AT2612D', norma: 'Euro 5 / VDS-3' },
  { id: 'gen4-euro5', fabricanteId: 'volvo', nome: 'FH 4 (Gen 4) Euro 5', periodo: '2015–2018', motor: 'D13K', cambio: 'I-Shift AT2612F', norma: 'Euro 5 / VDS-3 ou VDS-4' },
  { id: 'gen4-p8', fabricanteId: 'volvo', nome: 'FH 4 (Gen 4) P8/Euro 6', periodo: '2019–2022', motor: 'D13K', cambio: 'I-Shift AT2612F', norma: 'P8 / VDS-4.5 obrigatório' },
  { id: 'gen5', fabricanteId: 'volvo', nome: 'FH Aero (Gen 5)', periodo: '2023–2026', motor: 'D13K', cambio: 'I-Shift 7ª geração', norma: 'P8 / VDS-4.5 obrigatório' },
]

export const modelos = [
  { id: 'fh460-gen3', geracaoId: 'gen3', nome: 'FH 460', potenciaCv: 460, eixoDianteiroPneus: 2, tandem: true, pneusPorEixoTraseiro: 4 },
  { id: 'fh540-gen3', geracaoId: 'gen3', nome: 'FH 540', potenciaCv: 540, eixoDianteiroPneus: 2, tandem: true, pneusPorEixoTraseiro: 4 },
  { id: 'fh460-gen4e5', geracaoId: 'gen4-euro5', nome: 'FH 460', potenciaCv: 460, eixoDianteiroPneus: 2, tandem: true, pneusPorEixoTraseiro: 4 },
  { id: 'fh540-gen4e5', geracaoId: 'gen4-euro5', nome: 'FH 540', potenciaCv: 540, eixoDianteiroPneus: 2, tandem: true, pneusPorEixoTraseiro: 4 },
  { id: 'fh460-gen4p8', geracaoId: 'gen4-p8', nome: 'FH 460', potenciaCv: 460, eixoDianteiroPneus: 2, tandem: true, pneusPorEixoTraseiro: 4 },
  { id: 'fh540-gen4p8', geracaoId: 'gen4-p8', nome: 'FH 540', potenciaCv: 540, eixoDianteiroPneus: 2, tandem: true, pneusPorEixoTraseiro: 4 },
  { id: 'fhaero500', geracaoId: 'gen5', nome: 'FH Aero 500', potenciaCv: 500, eixoDianteiroPneus: 2, tandem: true, pneusPorEixoTraseiro: 4 },
]

export const tiposManutencao = [
  { id: 'oleo-motor', nome: 'Óleo Motor + Filtro', componente: 'Motor' },
  { id: 'filtro-diesel', nome: 'Filtro de Diesel', componente: 'Filtro' },
  { id: 'filtro-arla', nome: 'Filtro ARLA / AdBlue', componente: 'Filtro' },
  { id: 'filtro-racor', nome: 'Filtro Racor (sep. água)', componente: 'Filtro' },
  { id: 'filtro-ar', nome: 'Filtro de Ar Seco', componente: 'Filtro' },
  { id: 'oleo-cambio', nome: 'Óleo Câmbio I-Shift', componente: 'Câmbio' },
  { id: 'oleo-diferencial', nome: 'Óleo Diferencial Meritor', componente: 'Diferencial' },
  { id: 'embreagem', nome: 'Inspeção Embreagem', componente: 'Embreagem' },
]

// intervalo_km, intervalo_km_primeira (null = igual ao padrão), fonte
function intervaloSet(padraoFiltros, fonteMotor) {
  return [
    { tipoId: 'oleo-motor', intervaloKm: padraoFiltros, intervaloKmPrimeira: null, fonte: fonteMotor },
    { tipoId: 'filtro-diesel', intervaloKm: padraoFiltros, intervaloKmPrimeira: null, fonte: 'Volvo — alinhado ao intervalo do motor' },
    { tipoId: 'filtro-arla', intervaloKm: padraoFiltros, intervaloKmPrimeira: null, fonte: 'Volvo — sistema SCR' },
    { tipoId: 'filtro-racor', intervaloKm: padraoFiltros, intervaloKmPrimeira: null, fonte: 'Volvo — separador água/combustível' },
    { tipoId: 'filtro-ar', intervaloKm: 120000, intervaloKmPrimeira: null, fonte: 'Volvo' },
    { tipoId: 'oleo-cambio', intervaloKm: 120000, intervaloKmPrimeira: padraoFiltros === 30000 ? 10000 : 200000, fonte: 'Manual Volvo AT2612F' },
    { tipoId: 'oleo-diferencial', intervaloKm: 120000, intervaloKmPrimeira: 10000, fonte: 'Meritor — mineral 85W140' },
    { tipoId: 'embreagem', intervaloKm: 120000, intervaloKmPrimeira: null, fonte: 'Volvo — I-Shift dry clutch' },
  ]
}

export const intervalos = [
  ...['fh460-gen3', 'fh540-gen3'].flatMap((modeloId) =>
    intervaloSet(30000, 'Manual Volvo / óleo VDS-3 SAE 15W-40').map((it) => ({ modeloId, ...it }))
  ),
  ...['fh460-gen4e5', 'fh540-gen4e5'].flatMap((modeloId) =>
    intervaloSet(30000, 'Manual Volvo / VDS-3 ou VDS-4 SAE 15W-40').map((it) => ({ modeloId, ...it }))
  ),
  ...['fh460-gen4p8', 'fh540-gen4p8'].flatMap((modeloId) =>
    intervaloSet(40000, 'Manual Volvo / óleo VDS-4.5 obrigatório (Euro 6 exige)').map((it) => ({ modeloId, ...it }))
  ),
  ...['fhaero500'].flatMap((modeloId) =>
    intervaloSet(40000, 'Manual Volvo / óleo VDS-4.5 obrigatório').map((it) => ({ modeloId, ...it }))
  ),
]

// ---------------------------------------------------------------------------
// Pessoas (Usuario) — perfis: gerente | mecanico | motorista
// ---------------------------------------------------------------------------
export const usuarios = [
  { id: 'admin', nome: 'Admin', email: 'admin@admin.com', senha: 'admin123', perfil: 'gerente', cpf: null, ativo: true },

  { id: 'marcos', nome: 'Marcos Lima', email: 'marcos.lima@transp.com.br', senha: '123456', perfil: 'motorista', cpf: '412.908.331-08', ativo: true },
  { id: 'joao', nome: 'João Pereira', email: 'joao.pereira@transp.com.br', senha: '123456', perfil: 'motorista', cpf: '287.554.019-72', ativo: true },
  { id: 'ana', nome: 'Ana Ribeiro', email: 'ana.ribeiro@transp.com.br', senha: '123456', perfil: 'motorista', cpf: '701.223.845-10', ativo: true },
  { id: 'rafael', nome: 'Rafael Costa', email: 'rafael.costa@transp.com.br', senha: '123456', perfil: 'motorista', cpf: '355.410.772-31', ativo: true },
  { id: 'diego', nome: 'Diego Farias', email: 'diego.farias@transp.com.br', senha: '123456', perfil: 'motorista', cpf: '908.117.664-25', ativo: true },
  { id: 'paulo', nome: 'Paulo Nogueira', email: 'paulo.nogueira@transp.com.br', senha: '123456', perfil: 'motorista', cpf: '224.556.981-40', ativo: true },
  { id: 'carla', nome: 'Carla Menezes', email: 'carla.menezes@transp.com.br', senha: '123456', perfil: 'motorista', cpf: '119.887.213-55', ativo: true },
  { id: 'edson', nome: 'Edson Trindade', email: 'edson.trindade@transp.com.br', senha: '123456', perfil: 'motorista', cpf: '773.221.998-06', ativo: false },

  { id: 'wesley', nome: 'Wesley Martins', email: 'wesley.martins@checktruck.com.br', senha: '123456', perfil: 'mecanico', cpf: '332.114.556-90', ativo: true },
  { id: 'bruno', nome: 'Bruno Tavares', email: 'bruno.tavares@checktruck.com.br', senha: '123456', perfil: 'mecanico', cpf: '441.998.223-11', ativo: true },
  { id: 'silvana', nome: 'Silvana Rocha', email: 'silvana.rocha@checktruck.com.br', senha: '123456', perfil: 'mecanico', cpf: '556.332.114-77', ativo: true },

  { id: 'jorge', nome: 'Jorge Almeida', email: 'jorge.almeida@transp.com.br', senha: '123456', perfil: 'motorista', cpf: '667.334.552-21', ativo: false },
]

// ---------------------------------------------------------------------------
// Veículos
// ---------------------------------------------------------------------------
export const veiculosSeed = [
  { id: 'v1', placa: 'ABC1D23', chassi: '9BVR4X20DJE882301', renavam: '00845123900', modeloId: 'fh540-gen3', anoFabricacao: 2013, anoModelo: 2014, kmAtual: 488200, motoristaId: 'joao', ativo: true },
  { id: 'v2', placa: 'RQP2E88', chassi: '9BVR4X20DJE882388', renavam: '00912345678', modeloId: 'fh460-gen4e5', anoFabricacao: 2017, anoModelo: 2018, kmAtual: 233700, motoristaId: 'marcos', ativo: true },
  { id: 'v3', placa: 'GHT7A11', chassi: '9BVRC50A2RE912774', renavam: '01277345009', modeloId: 'fhaero500', anoFabricacao: 2024, anoModelo: 2025, kmAtual: 82400, motoristaId: null, ativo: true },
  { id: 'v4', placa: 'FDS4J09', chassi: '9BVR4X20DJE882455', renavam: '00933221100', modeloId: 'fh460-gen4p8', anoFabricacao: 2021, anoModelo: 2021, kmAtual: 308200, motoristaId: 'ana', ativo: true },
  { id: 'v5', placa: 'LKR8B54', chassi: '9BVR4X20DJE882590', renavam: '00877654321', modeloId: 'fh540-gen4e5', anoFabricacao: 2016, anoModelo: 2016, kmAtual: 612500, motoristaId: 'rafael', ativo: true },
  { id: 'v6', placa: 'MNB6C21', chassi: '9BVR4X20DJE882611', renavam: '00891122334', modeloId: 'fh460-gen4p8', anoFabricacao: 2020, anoModelo: 2020, kmAtual: 198400, motoristaId: 'paulo', ativo: true },
  { id: 'v7', placa: 'TRE9F02', chassi: '9BVR4X20DJE882733', renavam: '00812233445', modeloId: 'fh540-gen4p8', anoFabricacao: 2022, anoModelo: 2022, kmAtual: 145200, motoristaId: 'carla', ativo: true },
  { id: 'v8', placa: 'QWE3R45', chassi: '9BVRC50A2RE912800', renavam: '01288445566', modeloId: 'fhaero500', anoFabricacao: 2025, anoModelo: 2025, kmAtual: 21300, motoristaId: 'diego', ativo: true },
  { id: 'v9', placa: 'ZXC8V33', chassi: '9BVR4X20DJE882900', renavam: '00855667788', modeloId: 'fh460-gen3', anoFabricacao: 2012, anoModelo: 2013, kmAtual: 705100, motoristaId: null, ativo: true },
  { id: 'v10', placa: 'PLK5M78', chassi: '9BVR4X20DJE883011', renavam: '00899001122', modeloId: 'fh540-gen4e5', anoFabricacao: 2015, anoModelo: 2016, kmAtual: 455900, motoristaId: null, ativo: true },
  { id: 'v11', placa: 'BNH2K90', chassi: '9BVRC50A2RE912955', renavam: '01299556677', modeloId: 'fhaero500', anoFabricacao: 2023, anoModelo: 2024, kmAtual: 58700, motoristaId: null, ativo: true },
  { id: 'v12', placa: 'YUI4O56', chassi: '9BVR4X20DJE883122', renavam: '00822334455', modeloId: 'fh460-gen4e5', anoFabricacao: 2018, anoModelo: 2018, kmAtual: 289000, motoristaId: null, ativo: true },
  { id: 'v13', placa: 'FGH7J19', chassi: '9BVR4X20DJE883233', renavam: '00877889900', modeloId: 'fh540-gen3', anoFabricacao: 2014, anoModelo: 2014, kmAtual: 820100, motoristaId: null, ativo: false },
]

// ---------------------------------------------------------------------------
// Registros de manutenção (histórico)
// ---------------------------------------------------------------------------
export const registrosManutencaoSeed = [
  // ABC1D23 — histórico completo (referência do protótipo)
  { id: 'm1', veiculoId: 'v1', tipoId: 'oleo-motor', kmNaTroca: 476400, kmProximaTroca: 506400, dataRealizacao: '2026-06-14', isPrimeiraTroca: false, nrNotaFiscal: '118.442', concessionaria: 'Dipesa Marília', usuarioId: 'wesley' },
  { id: 'm2', veiculoId: 'v1', tipoId: 'oleo-diferencial', kmNaTroca: 364100, kmProximaTroca: 484100, dataRealizacao: '2026-03-02', isPrimeiraTroca: false, nrNotaFiscal: '109.870', concessionaria: 'Dipesa Marília', usuarioId: 'wesley' },
  { id: 'm3', veiculoId: 'v1', tipoId: 'oleo-cambio', kmNaTroca: 360000, kmProximaTroca: 480000, dataRealizacao: '2025-11-19', isPrimeiraTroca: true, nrNotaFiscal: '097.221', concessionaria: 'Volvo Bauru', usuarioId: 'admin' },
  { id: 'm4', veiculoId: 'v1', tipoId: 'filtro-racor', kmNaTroca: 341200, kmProximaTroca: 371200, dataRealizacao: '2025-09-05', isPrimeiraTroca: false, nrNotaFiscal: '091.005', concessionaria: 'Dipesa Marília', usuarioId: 'wesley' },
  { id: 'm5', veiculoId: 'v1', tipoId: 'oleo-motor', kmNaTroca: 311800, kmProximaTroca: 341800, dataRealizacao: '2025-05-21', isPrimeiraTroca: false, nrNotaFiscal: '084.660', concessionaria: 'Volvo Bauru', usuarioId: 'admin' },

  { id: 'm6', veiculoId: 'v2', tipoId: 'oleo-motor', kmNaTroca: 206700, kmProximaTroca: 236700, dataRealizacao: '2026-04-02', isPrimeiraTroca: false, nrNotaFiscal: '102.334', concessionaria: 'Dipesa Marília', usuarioId: 'wesley' },
  { id: 'm7', veiculoId: 'v2', tipoId: 'filtro-diesel', kmNaTroca: 206700, kmProximaTroca: 236700, dataRealizacao: '2026-04-02', isPrimeiraTroca: false, nrNotaFiscal: '102.334', concessionaria: 'Dipesa Marília', usuarioId: 'wesley' },

  { id: 'm8', veiculoId: 'v4', tipoId: 'oleo-motor', kmNaTroca: 270900, kmProximaTroca: 310900, dataRealizacao: '2026-01-18', isPrimeiraTroca: false, nrNotaFiscal: '099.870', concessionaria: 'Volvo Marília', usuarioId: 'bruno' },

  { id: 'm9', veiculoId: 'v5', tipoId: 'oleo-cambio', kmNaTroca: 492500, kmProximaTroca: 612500, dataRealizacao: '2025-07-30', isPrimeiraTroca: false, nrNotaFiscal: '087.220', concessionaria: 'Volvo Bauru', usuarioId: 'admin' },
  { id: 'm10', veiculoId: 'v9', tipoId: 'oleo-diferencial', kmNaTroca: 581500, kmProximaTroca: 701500, dataRealizacao: '2025-12-10', isPrimeiraTroca: false, nrNotaFiscal: '093.550', concessionaria: 'Dipesa Marília', usuarioId: 'wesley' },
]

// ---------------------------------------------------------------------------
// Chamados — abertos por motoristas/mecânicos, visíveis para o gerente
// ---------------------------------------------------------------------------
export const chamadosSeed = [
  {
    id: 'c1',
    veiculoId: 'v5',
    abertoPorId: 'rafael',
    tipo: 'Ruído no motor',
    descricao: 'Ruído metálico ao acelerar acima de 2000 rpm, começou hoje de manhã na saída de Marília.',
    urgencia: 'alta',
    status: 'aberto',
    criadoEm: '2026-09-09T08:12:00',
  },
  {
    id: 'c2',
    veiculoId: 'v2',
    abertoPorId: 'marcos',
    tipo: 'Pneu com desgaste irregular',
    descricao: 'Pneu dianteiro direito apresentando desgaste na borda externa. Solicito inspeção.',
    urgencia: 'media',
    status: 'em_andamento',
    criadoEm: '2026-09-07T14:40:00',
    atendidoPorId: 'wesley',
  },
  {
    id: 'c3',
    veiculoId: 'v1',
    abertoPorId: 'wesley',
    tipo: 'Manutenção preventiva vencida',
    descricao: 'Óleo do câmbio I-Shift venceu há 8.200 km. Veículo crítico, recomendo parar para revisão.',
    urgencia: 'alta',
    status: 'aberto',
    criadoEm: '2026-09-10T07:05:00',
  },
]

export const alertaMargemKm = 5000
export const alertaMargemDias = 30
