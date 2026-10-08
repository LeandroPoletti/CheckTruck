using System.Text.Json.Serialization;
using CheckTruck.Api.Acesso;
using CheckTruck.Dominio.Entidades;
using CheckTruck.Dominio.Enums;
using CheckTruck.Repositorio;
using CheckTruck.Dominio.Interfaces;
using CheckTruck.Dominio.Servicos;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.OData;
using Microsoft.EntityFrameworkCore;
using Microsoft.OData.ModelBuilder;
using Microsoft.OpenApi;
using Scalar.AspNetCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();

var modelBuilder = new ODataConventionModelBuilder();
modelBuilder.EntitySet<Veiculo>("Veiculo");
modelBuilder.EntitySet<Modelo>("Modelo");
modelBuilder.EntitySet<Fabricante>("Fabricante");
modelBuilder.EntitySet<GeracaoModelo>("GeracaoModelo");
modelBuilder.EntitySet<Pais>("Pais");
modelBuilder.EntitySet<TipoManutencao>("TiposManutencao");
modelBuilder.EntitySet<Manutencao>("Manutencao");
modelBuilder.EntitySet<IntervaloRecomendado>("IntervaloRecomendado");
modelBuilder.EntitySet<IntervaloVeiculo>("IntervaloVeiculo");
modelBuilder.EntitySet<Mecanico>("Mecanico");
// O motorista atual é um acesso (login): fica fora do OData para não expor os dados da conta
modelBuilder.EntityType<Veiculo>().Ignore(v => v.MotoristaAtual);

builder.Services.AddSingleton(modelBuilder.GetEdmModel());

builder.Services.AddControllers()
    .AddOData(options =>
    {
        options.OrderBy().Count().Filter().SetMaxTop(100);
    })
    .AddJsonOptions(options =>
{
    options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
});

builder.Services.AddEndpointsApiExplorer();

builder.Logging.AddConsole();

// Token Bearer em todas as rotas; quem pode o quê fica nos filtros da pasta Acesso
builder.Services.AddAuthentication(IdentityConstants.BearerScheme).AddBearerToken(IdentityConstants.BearerScheme);
builder.Services.AddAuthorization();

builder.Services.AddIdentityCore<Usuario>(options =>
    {
        options.User.RequireUniqueEmail = true;
        // Faz o login perguntar à ConfirmacaoUsuarioAtivo se a conta pode entrar (inativo não entra)
        options.SignIn.RequireConfirmedAccount = true;
    })
    .AddEntityFrameworkStores<Context>()
    .AddSignInManager();
builder.Services.AddScoped<IUserConfirmation<Usuario>, ConfirmacaoUsuarioAtivo>();

builder.Services.AddDbContext<Context>(options =>
{
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"));
});

builder.Services.AddScoped<IRepositorioCrud, RepositorioCrud>();
builder.Services.AddScoped(typeof(ServicoCrud<>));
builder.Services.AddScoped<ServicoVeiculo>();
builder.Services.AddScoped<ServicoSituacaoVeiculo>();
builder.Services.AddScoped<ServicoManutencao>();
builder.Services.AddScoped<ServicoDashboard>();
builder.Services.AddScoped<ServicoUsuario>();
builder.Services.AddScoped<ServicoChamado>();
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy => policy.AllowAnyMethod().AllowAnyOrigin().AllowAnyHeader());
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference("/docs");
}

app.UseHttpsRedirection();
app.UseCors();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

using (var scope = app.Services.CreateScope())
{
    var userManager = scope.ServiceProvider.GetRequiredService<UserManager<Usuario>>();

    // Admin do sistema: entra com o e-mail e a senha abaixo, não precisa de CPF e não pode ser desativado
    var admin = await userManager.FindByEmailAsync(ServicoUsuario.EmailAdminDoSistema);
    if (admin is null)
    {
        admin = new Usuario
        {
            Nome = "Administrador",
            Email = ServicoUsuario.EmailAdminDoSistema,
            UserName = ServicoUsuario.EmailAdminDoSistema,
            Cargo = Cargo.Admin,
            Ativo = true
        };
        await userManager.CreateAsync(admin, "Admin@123");
    }
    else if (admin.Cargo != Cargo.Admin || !admin.Ativo || admin.Nome.Length == 0 || admin.UserName != admin.Email)
    {
        // Banco de antes dos cargos: o admin ganha cargo, nome e login pelo e-mail
        admin.Cargo = Cargo.Admin;
        admin.Ativo = true;
        admin.UserName = admin.Email;
        if (admin.Nome.Length == 0)
        {
            admin.Nome = "Administrador";
        }

        await userManager.UpdateAsync(admin);
    }

    var context = scope.ServiceProvider.GetRequiredService<Context>();

    if (!context.Paises.Any(p => p.Nome == "Brasil"))
    {
        context.Paises.Add(new Pais() { Nome = "Brasil" });
        context.SaveChanges();
    }

    // Itens básicos que o almoxarife controla. Só cria num banco sem nenhum tipo cadastrado.
    // Os intervalos ficam no padrão seguro (IntervalosPadrao) até alguém cadastrar outros.
    if (!context.TiposManutencao.Any())
    {
        context.TiposManutencao.AddRange(
            new TipoManutencao { Nome = "Óleo do motor + filtros", Descricao = "Óleo do motor, filtro de óleo e filtros de combustível", Componente = Componente.Motor },
            new TipoManutencao { Nome = "Óleo do câmbio", Descricao = "Óleo da caixa de câmbio", Componente = Componente.Cambio },
            new TipoManutencao { Nome = "Óleo do diferencial", Descricao = "Óleo do eixo traseiro / diferencial", Componente = Componente.Diferencial1 },
            new TipoManutencao { Nome = "Filtros secos (ar)", Descricao = "Elementos do filtro de ar", Componente = Componente.Filtro });
        context.SaveChanges();
    }

    
}


app.Run();

