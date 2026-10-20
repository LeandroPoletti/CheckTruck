/** Põe os pontos e o traço do CPF: 123.456.789-09. */
function mascaraCpf(texto: string) {
  const d = texto.replace(/\D/g, '').slice(0, 11)
  return d
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d{1,2})$/, '.$1-$2')
}

/** CPF ou CNPJ (que pode ter letras) com a máscara, igual ao web. */
export function formatarDocumento(documento: string) {
  if (documento.length !== 14) return mascaraCpf(documento)
  const d = documento
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`
}
