import { z } from "zod";

export const visitorSchema = z.object({
  name: z.string().min(2, { message: "Nome obrigatório" }),
  document: z.string().min(3, { message: "Documento obrigatório" }),
  room: z.string().optional(),
  entryTime: z.string(),
  exitTime: z.string().optional(),
  status: z.enum(["in", "out"]),
});

export type Visitor = z.infer<typeof visitorSchema>;
