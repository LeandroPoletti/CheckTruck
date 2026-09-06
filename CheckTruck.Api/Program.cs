using System.Text.Json.Serialization;
using CheckTruck.Dominio.Entidades;
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
modelBuilder.EntitySet<Motorista>("Motorista");
modelBuilder.EntitySet<Tecnico>("Tecnico");

builder.Services.AddSingleton(modelBuilder.GetEdmModel());

builder.Services.AddControllers()
    .AddOData(options =>
    {
        options.Select().OrderBy().Count().Filter().Expand().SetMaxTop(100);
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


var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.MapScalarApiReference("/docs");
}

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapIdentityApi<Usuario>();

using (var scope = app.Services.CreateScope())
{
    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
    
    var rolesStrings = new string[] { "Administrador", "Motorista" };
    
    foreach (var role in rolesStrings)
    {
        if (!await roleManager.RoleExistsAsync(role))
        {
            await roleManager.CreateAsync(new IdentityRole(role));
        }
    }
    
    var userManager = scope.ServiceProvider.GetRequiredService<UserManager<Usuario>>();

    const string usuarioName = "Admin";
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
    
    var context = scope.ServiceProvider.GetRequiredService<Context>();

    if (!context.Paises.Any(p => p.Nome == "Brasil"))
    {
        context.Paises.Add(new Pais() { Nome = "Brasil" });
        context.SaveChanges();
    }

    
}


app.Run();

