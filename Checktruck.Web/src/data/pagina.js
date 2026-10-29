// Listas que crescem sempre (OS da frota, chamados concluídos e histórico de km) vêm aos poucos, das mais novas para
// as mais velhas: 50 de cada vez, até 500 (o máximo da API). Igual no site e no app.
export const POR_VEZ = 50
export const MAXIMO = 500

/** Quantos pedir no próximo "Ver mais". */
export const maisUmaVez = (quantos) => Math.min(quantos + POR_VEZ, MAXIMO)
