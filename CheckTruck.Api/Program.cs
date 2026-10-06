using System.Text.Json.Serialization;
using CheckTruck.Dominio.Entidades;
using CheckTruck.Dominio.Enums;
using CheckTruck.Repositorio;
using CheckTruck.Repositorio.Entidades;
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
modelBuilder.EntitySet<Motorista>("Motorista");
modelBuilder.EntitySet<Mecanico>("Mecanico");

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

builder.Services.AddAuthentication().AddBearerToken(IdentityConstants.BearerScheme);
builder.Services.AddAuthorization();

builder.Services.AddIdentityCore<Usuario>()
    .AddRoles<IdentityRole>()
    .AddEntityFrameworkStores<Context>()
    .AddApiEndpoints();

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
app.MapGroup("/identity").MapIdentityApi<Usuario>();

using (var scope = app.Services.CreateScope())
{
    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
    
    var rolesStrings = new string[] { "Administrador", "Motorista", "Mecanico" };
    
    foreach (var role in rolesStrings)
    {
        if (!await roleManager.RoleExistsAsync(role))
        {
            await roleManager.CreateAsync(new IdentityRole(role));
        }
    }
    
    var userManager = scope.ServiceProvider.GetRequiredService<UserManager<Usuario>>();

    // O login do Identity procura pelo UserName, e a tela de login só aceita e-mail.
    const string usuarioName = "admin@admin.com";
    const string usuarioEmail = "admin@admin.com";
    const string usuarioSenha = "Admin@123";

    if (await userManager.FindByEmailAsync(usuarioEmail) is null)
    {
        var usuario = new Usuario()
        {
            Ativo = true,
            Email = usuarioEmail,
            UserName = usuarioName,

        };
        await userManager.CreateAsync(usuario, usuarioSenha);
        await userManager.AddToRoleAsync(usuario, "Administrador");
    }
    else
    {
        // Bancos criados antes da troca ficaram com UserName "Admin": corrige para o e-mail.
        var admin = await userManager.FindByEmailAsync(usuarioEmail);
        if (admin is not null && admin.UserName != usuarioName)
            await userManager.SetUserNameAsync(admin, usuarioName);
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

