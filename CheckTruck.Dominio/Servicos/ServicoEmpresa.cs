using CheckTruck.Dominio.Entidades;
using CheckTruck.Dominio.Enums;
using CheckTruck.Dominio.Interfaces;
using CheckTruck.Dominio.Util;
using Microsoft.Extensions.Logging;

namespace CheckTruck.Dominio.Servicos;

/// <summary>
/// Conta de cada cliente: criar a conta (a empresa e o primeiro acesso, que é Admin) e virar Frota.
/// Frota tem nome e CNPJ; o Autônomo é a própria pessoa, com o nome e o CPF dela.
/// </summary>
public class ServicoEmpresa(
    IRepositorioCrud repositorioCrud,
    ServicoUsuario servicoUsuario,
    IUsuarioLogado usuarioLogado,
    ILogger<ServicoEmpresa> logger) : ServicoCrud<Empresa>(repositorioCrud, logger)
{
    /// <param name="nomeEmpresa">Só na Frota. O Autônomo leva o nome da pessoa.</param>
    /// <param name="cnpj">Só na Frota. O Autônomo é identificado pelo CPF.</param>
    public async Task<Usuario?> CriarContaAsync(
        TipoConta tipoConta, string? nomeEmpresa, string? cnpj, string nome, string cpf, string email, string senha)
    {
        if (!Enum.IsDefined(tipoConta))
        {
            Mensagens.Add("Escolha Frota ou Autônomo.");
            return null;
        }

        var autonomo = tipoConta == TipoConta.Autonomo;
        cpf = CpfUtil.RemoverMascaraCpf(cpf.Trim());
        var empresa = new Empresa
        {
            Nome = (autonomo ? nome : nomeEmpresa ?? "").Trim(),
            TipoConta = tipoConta,
            Documento = autonomo ? cpf : CnpjUtil.RemoverMascaraCnpj(cnpj ?? "")
        };

        if (!autonomo && empresa.Nome.Length == 0)
        {
            Mensagens.Add("Informe o nome da empresa.");
        }

        if (!autonomo && !CnpjUtil.IsValid(empresa.Documento))
        {
            Mensagens.Add("CNPJ inválido.");
        }
        else if (Query(e => e.Documento == empresa.Documento).Any())
        {
            Mensagens.Add($"Já existe uma conta com esse {(autonomo ? "CPF" : "CNPJ")}.");
        }

        if (cpf.Length == 0 || !CpfUtil.IsValid(cpf))
        {
            Mensagens.Add("CPF inválido.");
        }

        if (Mensagens.Count > 0)
        {
            return null;
        }

        var usuario = await servicoUsuario.CriarPrimeiroAcessoAsync(empresa, nome, cpf, email, senha);
        Mensagens.AddRange(servicoUsuario.Mensagens);
        return usuario;
    }

    /// <summary>Empresa de quem está logado (null para o dono do sistema).</summary>
    public Empresa? ObterAtual() => usuarioLogado.Usuario?.EmpresaId is { } empresaId ? GetById(empresaId) : null;

    /// <summary>O Autônomo vira Frota: passa a cadastrar acessos (motoristas, mecânicos, gestor) e a usar chamados.</summary>
    public Empresa? VirarFrota()
    {
        var empresa = ObterAtual();
        if (empresa is null)
        {
            Mensagens.Add("Empresa não encontrada.");
            return null;
        }

        if (empresa.TipoConta == TipoConta.Frota)
        {
            Mensagens.Add("A conta já é Frota.");
            return null;
        }

        empresa.TipoConta = TipoConta.Frota;
        return Atualizar(empresa);
    }
}
