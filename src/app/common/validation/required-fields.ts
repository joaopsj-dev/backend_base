export const requiredString = () => ({
  error: (i: any) =>
    i.input === undefined
      ? "Campo obrigatório"
      : "Valor deve ser uma string válida",
});

export const requiredNumber = () => ({
  error: (i: any) =>
    i.input === undefined
      ? "Campo obrigatório"
      : "Valor deve ser um número válido",
});
