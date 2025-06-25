import { z } from "zod";

export const userSchema = z.object({
	email: z.string().email(),
	password: z.string().min(6),
	role: z.enum(["user", "admin"]).default("user"),
	firstName: z.string().min(1).max(50),
	lastName: z.string().min(1).max(50),
	phone: z.string().min(4).max(20).optional(),
	address: z.string().max(100).optional(),
	city: z.string().min(1).max(50).optional(),
	active: z.boolean().default(true),
	modifiedAt: z
		.date()
		.optional()
		.default(() => new Date()),
	createdAt: z
		.date()
		.optional()
		.default(() => new Date()),
});

export const userSchemaLogin = z.object({
	email: z.string().email(),
	password: z.string().min(6),
});
