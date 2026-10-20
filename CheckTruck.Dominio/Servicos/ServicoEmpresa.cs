using CheckTruck.Dominio.Entidades;
using CheckTruck.Dominio.Interfaces;
using CheckTruck.Dominio.Util;
using Microsoft.Extensions.Logging;

namespace CheckTruck.Dominio.Servicos;

/// <summary>
/// Empresas (clientes do CheckTruck). Só o dono do sistema cadastra (a API confere antes): a empresa e o primeiro
/// acesso, que é o Admin dela e cadastra o resto da equipe. O dono do sistema também desativa a empresa (ninguém
/// dela entra, e os dados continuam guardados) e ativa de novo.
/// </summary>
public class ServicoEmpresa(
    IRepositorioCrud repositorioCrud,
    ServicoUsuario servicoUsuario,
    IUsuarioLogado usuarioLogado,
    ILogger<ServicoEmpresa> logger) : ServicoCrud<Empresa>(repositorioCrud, logger)
{
    /// <summary>Todas as empresas, por nome (a tabela de empresas não tem filtro: só o dono do sistema chega aqui).</summary>
    public IQueryable<Empresa> Listar() => Query(_ => true).OrderBy(e => e.Nome);

    /// <summary>
    /// Cadastra a empresa e o Admin dela (o login que o dono do sistema passa para o dono da empresa).
    /// Se o acesso não puder ser criado, a empresa também não fica.
    /// </summary>
    public async Task<Usuario?> CriarAsync(string nomeEmpresa, string cnpj, string nome, string cpf, string email, string senha)
    {
        cpf = CpfUtil.RemoverMascaraCpf(cpf.Trim());
        var empresa = new Empresa
        {
            Nome = nomeEmpresa.Trim(),
            Documento = CnpjUtil.RemoverMascaraCnpj(cnpj.Trim())
        };

        if (empresa.Nome.Length == 0)
        {
            Mensagens.Add("Informe o nome da empresa.");
        }

        if (!CnpjUtil.IsValid(empresa.Documento))
        {
            Mensagens.Add("CNPJ inválido.");
        }
        else if (Query(e => e.Documento == empresa.Documento).Any())
        {
            Mensagens.Add("Já existe uma empresa com esse CNPJ.");
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

    /// <summary>Desativada, ninguém da empresa entra no site nem no app (os dados continuam guardados).</summary>
    public Empresa? AlterarAtiva(long id, bool ativa)
    {
        var empresa = GetById(id);
        if (empresa is null)
        {
            Mensagens.Add("Empresa não encontrada.");
            return null;
        }

        if (empresa.Ativa == ativa)
        {
            return empresa;
        }

        empresa.DesativadaEm = ativa ? null : DateTime.UtcNow;
        return Atualizar(empresa);
    }

    /// <summary>Empresa de quem está logado (null para o dono do sistema). Vem junto com o usuário, nos filtros de acesso.</summary>
    public Empresa? ObterAtual() => usuarioLogado.Usuario?.Empresa;
}
