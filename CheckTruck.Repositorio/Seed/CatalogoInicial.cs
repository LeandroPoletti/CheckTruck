using CheckTruck.Dominio.Entidades;
using CheckTruck.Dominio.Enums;

namespace CheckTruck.Repositorio.Seed;

/// <summary>
/// Catálogo inicial com os pesados mais comuns no Brasil, para ninguém começar do zero:
/// fabricante → modelo → geração (anos, norma, motor, câmbio) → potências.
/// Os anos são o ano-modelo da Tabela FIPE; "até" vazio = ainda é vendido.
/// Fontes (sites das montadoras, imprensa do setor e FIPE): README.md, seção "Catálogo inicial".
/// Só roda num banco sem nenhum modelo. País e fabricante que já existem (mesmo nome) são reaproveitados.
/// </summary>
public static class CatalogoInicial
{
    public static void Aplicar(Context context)
    {
        if (context.Modelos.Any())
        {
            return;
        }

        foreach (var (nomeFabricante, nomePais, modelos) in Fabricantes)
        {
            var fabricante = context.Fabricantes.FirstOrDefault(f => f.Nome.ToLower() == nomeFabricante.ToLower());
            if (fabricante is null)
            {
                var pais = context.Paises.FirstOrDefault(p => p.Nome.ToLower() == nomePais.ToLower())
                    ?? context.Paises.Local.FirstOrDefault(p => p.Nome == nomePais)
                    ?? new Pais { Nome = nomePais };
                fabricante = new Fabricante { Nome = nomeFabricante, PaisOrigem = pais };
            }

            foreach (var modelo in modelos)
            {
                modelo.Fabricante = fabricante;
                context.Modelos.Add(modelo);
            }
        }

        context.SaveChanges();
    }

    private static Modelo M(string nome, params Geracao[] geracoes) => new() { Nome = nome, Geracoes = geracoes.ToList() };

    private static Geracao G(string nome, int anoInicio, int? anoFim, NormaEmissao norma, string? motor, string? caixa, params int[] cvs) => new()
    {
        Nome = nome,
        AnoInicio = anoInicio,
        AnoFim = anoFim,
        NormaEmissao = norma,
        Motor = motor,
        Caixa = caixa,
        Potencias = cvs.Select(cv => new Potencia { Cv = cv }).ToList(),
    };

    private const NormaEmissao AntesDoEuro5 = NormaEmissao.AntesDoEuro5;
    private const NormaEmissao Euro5 = NormaEmissao.Euro5;
    private const NormaEmissao Euro6 = NormaEmissao.Euro6;

    // Os modelos são criados a cada chamada (Aplicar liga cada um ao fabricante do banco)
    private static (string Fabricante, string Pais, Modelo[] Modelos)[] Fabricantes => new[]
    {
        ("Volvo", "Suécia",
        new[]
        {
            M("FH",
                G("FH12 (Clássico)", 1999, 2006, AntesDoEuro5, "D12C / D12D", "I-Shift", 380, 420, 460),
                G("FH D13A (Clássico)", 2007, 2011, AntesDoEuro5, "D13A", "I-Shift", 400, 440, 480, 520),
                G("FH Euro 5 (Clássico)", 2012, 2014, Euro5, "D13C", "I-Shift", 420, 460, 500, 540),
                G("Novo FH (FH 4)", 2015, 2021, Euro5, "D13C", "I-Shift", 420, 460, 500, 540),
                G("Nova geração (FH 5)", 2022, 2022, Euro5, "D13C", "I-Shift", 420, 460, 500, 540),
                G("FH Euro 6", 2023, null, Euro6, "D13K", "I-Shift 7ª geração", 420, 460, 500, 540)),
            M("FM",
                G("FM10 / FM12", 1999, 2006, AntesDoEuro5, "10 L / 12 L", null, 320, 340, 380, 420),
                G("FM D13A / 11 L", 2007, 2011, AntesDoEuro5, "D13A / 11 L", null, 370, 400, 440, 480),
                G("FM Euro 5", 2012, 2022, Euro5, "11 L / 13 L", null, 370, 380, 460),
                G("FM Euro 6", 2023, null, Euro6, "D13K", "I-Shift 7ª geração", 380)),
            M("FMX",
                G("FMX", 2011, 2011, AntesDoEuro5, "11 L / D13A", null, 370, 400, 440, 480),
                G("FMX Euro 5", 2012, 2022, Euro5, "11 L / D13C", "I-Shift", 370, 380, 420, 460, 500, 540),
                G("FMX Euro 6", 2023, null, Euro6, "D13K", "I-Shift 7ª geração", 380, 460, 500, 540)),
            M("VM",
                G("VM 1ª geração", 2003, 2005, AntesDoEuro5, null, null, 210, 240),
                G("VM 2ª geração", 2006, 2011, AntesDoEuro5, null, null, 210, 260, 310),
                G("VM Euro 5", 2012, 2022, Euro5, null, null, 220, 270, 330),
                G("VM Euro 6", 2023, null, Euro6, "D8K", null, 290, 360)),
        }),
        ("Scania", "Suécia",
        new[]
        {
            M("R",
                G("Série 4 (R 114 / 124 / 164)", 1998, 2008, AntesDoEuro5, "11 L / 12 L / 16 L V8", "Manual / Opticruise", 320, 330, 360, 380, 400, 420, 470, 480),
                G("PGR", 2008, 2012, AntesDoEuro5, null, "Opticruise", 380, 420, 470, 500, 580),
                G("PGR Euro 5 / Streamline", 2012, 2019, Euro5, "DC13 / DC16 V8", "Opticruise", 400, 440, 450, 480, 510, 560, 620),
                G("Nova Geração (NTG)", 2019, 2023, Euro5, "DC13 / DC16 V8", "Opticruise GRS905", 410, 450, 500, 540, 620),
                G("Euro 6", 2023, null, Euro6, "DC13 Super / 13 L Plus / DC16 V8", "Opticruise", 420, 450, 460, 500, 540, 560, 660, 770)),
            M("G",
                G("PGR", 2008, 2012, AntesDoEuro5, "12 L", "Opticruise", 380, 420, 470),
                G("PGR Euro 5 / Streamline", 2012, 2019, Euro5, "DC13", "Opticruise", 360, 400, 440, 480),
                G("Nova Geração (NTG)", 2019, 2023, Euro5, "DC09 / DC13", "Opticruise", 360, 410, 450, 500, 540),
                G("Euro 6", 2023, null, Euro6, "9 L / DC13 Super / 13 L", "Opticruise", 360, 420, 450, 460, 500, 540, 560)),
            M("P",
                G("Série 4 (P 94 / 114 / 124)", 1998, 2008, AntesDoEuro5, "9 L / 11 L / 12 L", null, 220, 230, 260, 270, 300, 310, 320, 330, 340, 360, 400, 420),
                G("PGR", 2008, 2012, AntesDoEuro5, "9 L / 12 L", null, 270, 310, 340, 420),
                G("PGR Euro 5", 2012, 2019, Euro5, "DC09 / DC13", null, 250, 310, 360),
                G("Nova Geração (NTG)", 2019, 2023, Euro5, "7 L / 9 L / 13 L", "Opticruise", 250, 280, 320, 360, 410, 450),
                G("Euro 6", 2023, null, Euro6, "9 L / 13 L", null, 250, 280, 320, 360, 420, 450, 460)),
            M("S",
                G("Nova Geração (NTG)", 2019, 2023, Euro5, "DC13 / DC16 V8", "Opticruise GRS905", 450, 500, 540, 620),
                G("Euro 6", 2023, null, Euro6, "DC13 Super / DC16 V8", "Opticruise", 460, 500, 560, 660, 770)),
        }),
        ("Mercedes-Benz", "Alemanha",
        new[]
        {
            M("Actros",
                G("Actros importado", 2010, 2011, AntesDoEuro5, "V6 12 L", "PowerShift G330", 456),
                G("Actros Euro 5", 2012, 2021, Euro5, "V6 12 L / OM 460 LA", "PowerShift G330", 456, 510),
                G("Novo Actros", 2020, 2023, Euro5, "OM 460 / OM 471", "PowerShift 3", 450, 480, 510, 530),
                G("Actros Euro 6", 2023, null, Euro6, "OM 460 LA / OM 471 LA", "PowerShift Advanced", 449, 479, 495, 530)),
        }),
        ("Iveco", "Itália",
        new[]
        {
            M("Stralis",
                G("Stralis HD", 2006, 2010, AntesDoEuro5, "Cursor 13", "ZF 16S manual", 380, 420),
                G("Stralis NR", 2010, 2012, AntesDoEuro5, "Cursor 13", "ZF manual / ZF Eurotronic", 380, 410, 460),
                G("Stralis Euro 5", 2012, 2019, Euro5, "Cursor 9 / Cursor 13", "ZF Eurotronic", 330, 360, 400, 440, 480),
                G("Stralis Hi-Way", 2013, 2023, Euro5, "Cursor 13", "ZF Eurotronic 16", 440, 480, 560),
                G("Stralis Hi-Road", 2019, 2023, Euro5, null, null, 360, 400, 440)),
            M("S-Way",
                G("S-Way", 2023, null, Euro6, "Cursor 13", "ZF TraXon 12", 480, 540)),
        }),
        ("DAF", "Países Baixos",
        new[]
        {
            M("XF",
                G("XF105", 2014, 2020, Euro5, "PACCAR MX-13", "Manual 16 / ZF automatizado", 410, 460, 510),
                G("Novo XF", 2021, 2023, Euro5, "PACCAR MX-13", "ZF TraXon 12", 480, 530),
                G("XF Euro 6", 2023, null, Euro6, "PACCAR MX-13", null, 480, 530)),
        }),
    };
}
