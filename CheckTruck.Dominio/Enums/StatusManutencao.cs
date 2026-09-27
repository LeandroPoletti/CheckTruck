namespace CheckTruck.Dominio.Enums;

// Ordem crescente de gravidade: o status do veículo é o pior entre os seus itens.
public enum StatusManutencao
{
    Ok = 0,
    Atencao = 1,
    Critico = 2,
}
