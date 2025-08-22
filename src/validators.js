import { z } from "zod";

export const personSchema = z.object({
  name: z.string().min(1, "name is required"),
  surname: z.string().min(1, "surname is required"),
  age: z.number().int().nonnegative().optional(),
  gender: z.enum(["male", "female"]).optional(),
  birthday: z.string().optional(), // Expect ISO date string
  phone: z.string().optional(),
  email: z.string().email("invalid email"),
  contacts: z.array(z.number().int().positive()).optional()
});

export const personUpdateSchema = personSchema.partial().extend({
  name: z.string().min(1).optional(),
  surname: z.string().min(1).optional(),
  email: z.string().email().optional(),
  contacts: z.array(z.number().int().positive()).optional()
});

export function validateBody(schema) {
  return (req, res, next) => {
    try {
      // zod: coerce numeric fields if coming as strings
      const parsed = schema.parse(req.body);
      req.validated = parsed;
      next();
    } catch (err) {
      return res.status(400).json({ error: "Validation error", details: err.errors });
    }
  };
}
