using CheckTruck.Dominio.Entidades;
using CheckTruck.Dominio.Enums;
using CheckTruck.Dominio.Interfaces;
using CheckTruck.Dominio.Util;
using Microsoft.AspNetCore.Identity;

namespace CheckTruck.Dominio.Servicos;

/// <summary>
/// Regras dos acessos: cadastrar, editar (inclusive e-mail e senha) e ativar/desativar.
/// Quem chama é sempre Admin ou Gestor (a API confere antes), e só vê os acessos da própria empresa.
/// A conta Autônomo tem um acesso só; o primeiro acesso de cada conta nasce na tela Criar conta.
/// </summary>
public class ServicoUsuario(UserManager<Usuario> userManager, ServicoCrud<Empresa> servicoEmpresa, IUsuarioLogado usuarioLogado)
{
    /// <summary>Admin criado pelo sistema: não precisa de CPF, não troca de e-mail nem de cargo e não pode ser desativado.</summary>
    public const string EmailAdminDoSistema = "admin@admin.com";

    /// <summary>Dono do sistema, criado pelo sistema: cuida do catálogo e não é de nenhuma empresa (não aparece nos acessos).</summary>
    public const string EmailDonoDoSistema = "dono@checktruck.com";

    public List<string> Mensagens { get; } = new();

    public static bool EhAdminDoSistema(Usuario usuario) =>
        string.Equals(usuario.Email, EmailAdminDoSistema, StringComparison.OrdinalIgnoreCase);

    public IQueryable<Usuario> Listar() => DaEmpresa().OrderBy(u => u.Nome);

    public IQueryable<Usuario> ListarMotoristasAtivos() =>
        DaEmpresa().Where(u => u.Ativo && u.Cargo == Cargo.Motorista).OrderBy(u => u.Nome);

    /// <summary>Acesso da empresa de quem está logado (de outra empresa volta null).</summary>
    public async Task<Usuario?> ObterAsync(string id) =>
        await userManager.FindByIdAsync(id) is { } usuario && usuario.EmpresaId == EmpresaAtual() ? usuario : null;

    /// <summary>Motorista escolhido numa tela: só vale um acesso ativo com cargo Motorista (senão, null).</summary>
    public async Task<Usuario?> ObterMotoristaAtivoAsync(string id) =>
        await ObterAsync(id) is { Ativo: true, Cargo: Cargo.Motorista } motorista ? motorista : null;

    public async Task<Usuario?> CriarAsync(Usuario novo, string? senha)
    {
        if (string.IsNullOrWhiteSpace(senha))
        {
            Mensagens.Add("Informe a senha.");
        }

        if (servicoEmpresa.GetById(EmpresaAtual()!.Value)?.TipoConta == TipoConta.Autonomo)
        {
            Mensagens.Add("A conta Autônomo tem um acesso só. Para cadastrar mais pessoas, vire Frota em Minha empresa.");
        }

        Preparar(novo, adminDoSistema: false);
        ValidarCpfUnico(novo.Cpf, idIgnorar: null);
        if (Mensagens.Count > 0)
        {
            return null;
        }

        novo.EmpresaId = EmpresaAtual();
        return await GravarNovoAsync(novo, senha!);
    }

    /// <summary>
    /// Primeiro acesso de uma conta nova (tela Criar conta, sem ninguém logado): Admin da empresa,
    /// que é gravada junto com ele. Se o acesso não puder ser criado, a empresa também não fica.
    /// </summary>
    public async Task<Usuario?> CriarPrimeiroAcessoAsync(Empresa empresa, string nome, string? cpf, string email, string senha)
    {
        var novo = new Usuario { Nome = nome, Cpf = cpf, Email = email, Cargo = Cargo.Admin, Empresa = empresa };
        Preparar(novo, adminDoSistema: false);
        if (Mensagens.Count > 0)
        {
            return null;
        }

        return await GravarNovoAsync(novo, senha);
    }

    /// <param name="dados">Dados novos (nome, e-mail, CPF, cargo e permissões).</param>
    /// <param name="novaSenha">Em branco mantém a senha atual.</param>
    /// <param name="idQuemAlterou">Quem está editando: ninguém tira o próprio acesso de gestão.</param>
    public async Task<Usuario?> AtualizarAsync(string id, Usuario dados, string? novaSenha, string idQuemAlterou)
    {
        var usuario = await ObterAsync(id);
        if (usuario is null)
        {
            Mensagens.Add("Acesso não encontrado.");
            return null;
        }

        var adminDoSistema = EhAdminDoSistema(usuario);
        Preparar(dados, adminDoSistema);
        if (adminDoSistema && !string.Equals(dados.Email, usuario.Email, StringComparison.OrdinalIgnoreCase))
        {
            Mensagens.Add("O e-mail do admin do sistema não pode ser trocado.");
        }

        if (adminDoSistema && dados.Cargo != Cargo.Admin)
        {
            Mensagens.Add("O admin do sistema continua com o cargo Admin.");
        }

        if (usuario.Id == idQuemAlterou && !dados.CuidaDosAcessos)
        {
            Mensagens.Add("Você não pode tirar o seu próprio cargo de Admin ou Gestor.");
        }

        ValidarCpfUnico(dados.Cpf, usuario.Id);
        if (!string.IsNullOrWhiteSpace(novaSenha))
        {
            await ValidarSenhaAsync(usuario, novaSenha);
        }

        if (Mensagens.Count > 0)
        {
            return null;
        }

        usuario.Nome = dados.Nome;
        usuario.Email = dados.Email;
        usuario.UserName = dados.Email;
        usuario.Cpf = dados.Cpf;
        usuario.Cargo = dados.Cargo;
        usuario.Permissoes = dados.Permissoes;
        if (!string.IsNullOrWhiteSpace(novaSenha))
        {
            usuario.PasswordHash = userManager.PasswordHasher.HashPassword(usuario, novaSenha);
        }

        return Concluir(await userManager.UpdateAsync(usuario)) ? usuario : null;
    }

    public async Task<Usuario?> AlterarAtivoAsync(string id, bool ativo, string idQuemAlterou)
    {
        var usuario = await ObterAsync(id);
        if (usuario is null)
        {
            Mensagens.Add("Acesso não encontrado.");
            return null;
        }

        if (!ativo && EhAdminDoSistema(usuario))
        {
            Mensagens.Add("O admin do sistema não pode ser desativado.");
        }

        if (!ativo && usuario.Id == idQuemAlterou)
        {
            Mensagens.Add("Você não pode desativar o seu próprio acesso.");
        }

        if (Mensagens.Count > 0)
        {
            return null;
        }

        usuario.Ativo = ativo;
        return Concluir(await userManager.UpdateAsync(usuario)) ? usuario : null;
    }

    // Limpa os campos e confere nome, e-mail, cargo, CPF e permissões
    private void Preparar(Usuario usuario, bool adminDoSistema)
    {
        usuario.Nome = usuario.Nome.Trim();
        usuario.Email = usuario.Email?.Trim();
        usuario.Cpf = string.IsNullOrWhiteSpace(usuario.Cpf) ? null : CpfUtil.RemoverMascaraCpf(usuario.Cpf.Trim());

        if (usuario.Nome.Length == 0)
        {
            Mensagens.Add("Informe o nome.");
        }

        if (string.IsNullOrEmpty(usuario.Email))
        {
            Mensagens.Add("Informe o e-mail.");
        }

        if (usuario.Cpf is null && !adminDoSistema)
        {
            Mensagens.Add("Informe o CPF.");
        }

        if (!Enum.IsDefined(usuario.Cargo) || usuario.Cargo == Cargo.DonoDoSistema)
        {
            Mensagens.Add("Escolha um cargo válido.");
        }
        else if (usuario.CuidaDosAcessos)
        {
            usuario.Permissoes = Permissao.Nenhuma; // Admin e Gestor já podem tudo
        }
        else if (usuario.Permissoes == Permissao.Nenhuma)
        {
            Mensagens.Add("Ligue pelo menos uma permissão.");
        }
        else if ((usuario.Permissoes & PermissaoUtil.DependemDeVerFrota) != 0)
        {
            usuario.Permissoes |= Permissao.VerFrota; // veículos, km e OS ficam dentro da tela de veículos
        }
    }

    private void ValidarCpfUnico(string? cpf, string? idIgnorar)
    {
        if (cpf is not null && DaEmpresa().Any(u => u.Cpf == cpf && u.Id != idIgnorar))
        {
            Mensagens.Add("Já existe um acesso com esse CPF.");
        }
    }

    // O login (e-mail) vale para o sistema todo, então os acessos não têm o filtro automático do Context
    private long? EmpresaAtual() => usuarioLogado.Usuario!.EmpresaId;

    private IQueryable<Usuario> DaEmpresa()
    {
        var empresaId = EmpresaAtual();
        return userManager.Users.Where(u => u.EmpresaId == empresaId);
    }

    // O login é o e-mail, e o acesso novo já entra ativo
    private async Task<Usuario?> GravarNovoAsync(Usuario novo, string senha)
    {
        novo.UserName = novo.Email;
        novo.Ativo = true;
        return Concluir(await userManager.CreateAsync(novo, senha)) ? novo : null;
    }

    private async Task ValidarSenhaAsync(Usuario usuario, string senha)
    {
        foreach (var validador in userManager.PasswordValidators)
        {
            AdicionarErros(await validador.ValidateAsync(userManager, usuario, senha));
        }
    }

    private bool Concluir(IdentityResult resultado)
    {
        AdicionarErros(resultado);
        return resultado.Succeeded;
    }

    private void AdicionarErros(IdentityResult resultado)
    {
        foreach (var mensagem in resultado.Errors.Select(TraduzirErro).Where(m => !Mensagens.Contains(m)))
        {
            Mensagens.Add(mensagem);
        }
    }

    // As mensagens do Identity vêm em inglês; traduz as que aparecem no cadastro
    private static string TraduzirErro(IdentityError erro) => erro.Code switch
    {
        "DuplicateUserName" or "DuplicateEmail" => "Já existe um acesso com esse e-mail.",
        "InvalidEmail" or "InvalidUserName" => "E-mail inválido.",
        "PasswordTooShort" => "A senha precisa ter pelo menos 6 caracteres.",
        "PasswordRequiresDigit" => "A senha precisa ter um número.",
        "PasswordRequiresLower" => "A senha precisa ter uma letra minúscula.",
        "PasswordRequiresUpper" => "A senha precisa ter uma letra maiúscula.",
        "PasswordRequiresNonAlphanumeric" => "A senha precisa ter um símbolo (ex.: @).",
        _ => erro.Description
    };
}
