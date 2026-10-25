// Preserva o dia do fuso do runtime que o endpoint ja usava.
// Nao escolhe automaticamente um novo fuso de negocio/workspace.
export function dataIsoDoServidor(data: Date): string {
  if (Number.isNaN(data.getTime())) throw new RangeError("Data invalida");
  const ano = data.getFullYear();
  if (ano < 1 || ano > 9999) throw new RangeError("Ano fora do intervalo ISO");
  return [
    String(ano).padStart(4, "0"),
    String(data.getMonth() + 1).padStart(2, "0"),
    String(data.getDate()).padStart(2, "0"),
  ].join("-");
}
