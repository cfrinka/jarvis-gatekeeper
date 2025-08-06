import { z } from "zod";

export interface InBuildingTabProps {
  checkoutLoading: string | null;
}

export const visitorSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  cpf: z
    .string()
    .refine((value) => {
      const numericCPF = value.replace(/\D/g, '');
      return numericCPF.length === 11;
    }, "CPF deve ter 11 dígitos válidos"),
  destination: z.string().min(1, "Sala destino é obrigatória"),
  dateOfBirth: z.string().optional(),
  email: z.string().email({ message: "E-mail inválido" }).or(z.literal("")),
});

export type VisitorFormData = z.infer<typeof visitorSchema>;
