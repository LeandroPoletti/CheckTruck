using CheckTruck.Dominio.Entidades;
using CheckTruck.Dominio.Enums;
using CheckTruck.Testes.Apoio;

namespace CheckTruck.Testes.Servicos;

/// <summary>
/// O motorista e o caminhão dele: só vê, atualiza o km e abre chamado do caminhão em que é o motorista atual.
/// Quem põe o motorista no caminhão é o gestor ou a OS; abrir chamado não troca o motorista.
/// </summary>
public class MotoristaTests
{
    private readonly Frota _frota = new();
    private readonly Usuario _motorista = new() { Id = "motorista-1", Nome = "Carlos", Cargo = Cargo.Motorista, Ativo = true };
    private readonly Usuario _mecanico = new() { Id = "mecanico-1", Nome = "Pedro", Cargo = Cargo.Mecanico, Ativo = true };
    private readonly Veiculo _doMotorista;
    private readonly Veiculo _deOutro;

    public MotoristaTests()
    {
        _doMotorista = _frota.Caminhao(kmDeEntrada: 100_000, id: 1);
        _doMotorista.MotoristaAtual = _motorista;
        _deOutro = _frota.Caminhao(kmDeEntrada: 200_000, id: 2);
    }

    private static Chamado NovoChamado() =>
        new() { Tipo = TipoOcorrencia.Freios, Urgencia = UrgenciaChamado.Media, Descricao = "Freio puxando para a direita" };

    [Fact]
    public void Ve_so_os_caminhoes_ativos_que_estao_com_ele()
    {
        var desativado = _frota.Caminhao(kmDeEntrada: 50_000, id: 3);
        desativado.MotoristaAtual = _motorista;
        desativado.Ativo = false;

        var meus = _frota.CriarServicoSituacao().ObterSituacaoDoMotorista(_motorista.Id);

        Assert.Equal(_doMotorista.Id, Assert.Single(meus).VeiculoId);
        Assert.NotEmpty(meus[0].Itens);
    }

    [Fact]
    public void Sem_caminhao_a_lista_vem_vazia() =>
        Assert.Empty(_frota.CriarServicoSituacao().ObterSituacaoDoMotorista("motorista-sem-caminhao"));

    [Fact]
    public void Atualiza_o_km_do_caminhao_dele()
    {
        var servico = _frota.CriarServicoVeiculo();

        Assert.True(servico.AtualizarKmDoMeuCaminhao(_motorista, _doMotorista.Id, distancia: 1_500));
        Assert.Equal(101_500, _doMotorista.KmAtual);
    }

    [Fact]
    public void Nao_atualiza_o_km_de_caminhao_que_nao_esta_com_ele()
    {
        var servico = _frota.CriarServicoVeiculo();

        Assert.False(servico.AtualizarKmDoMeuCaminhao(_motorista, _deOutro.Id, distancia: 1_500));
        Assert.Contains("Esse caminhão não está com você. Fale com o gestor.", servico.Mensagens);
        Assert.Equal(200_000, _deOutro.KmAtual);
    }

    [Fact]
    public void Abre_chamado_do_caminhao_dele_sem_trocar_o_motorista()
    {
        var chamado = _frota.CriarServicoChamado().Abrir(_motorista, _doMotorista.Id, NovoChamado());

        Assert.NotNull(chamado);
        Assert.Same(_motorista, chamado.AbertoPor);
        Assert.Same(_motorista, _doMotorista.MotoristaAtual);
    }

    [Fact]
    public void Nao_abre_chamado_de_caminhao_que_nao_esta_com_ele()
    {
        var servico = _frota.CriarServicoChamado();

        Assert.Null(servico.Abrir(_motorista, _deOutro.Id, NovoChamado()));
        Assert.Contains("Você só abre chamado do caminhão que está com você. Fale com o gestor.", servico.Mensagens);
        Assert.Null(_deOutro.MotoristaAtual);
    }

    [Fact]
    public void Mecanico_continua_abrindo_chamado_de_qualquer_caminhao() =>
        Assert.NotNull(_frota.CriarServicoChamado().Abrir(_mecanico, _deOutro.Id, NovoChamado()));

    [Fact]
    public void Lista_de_placas_do_chamado_do_motorista_tem_so_o_caminhao_dele()
    {
        var servico = _frota.CriarServicoChamado();

        Assert.Equal(new[] { _doMotorista.Id }, servico.ListarVeiculosAtivos(_motorista).Select(v => v.Id));
        Assert.Equal(new[] { _doMotorista.Id, _deOutro.Id }, servico.ListarVeiculosAtivos(_mecanico).Select(v => v.Id));
    }
}
