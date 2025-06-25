import bcrypt from "bcryptjs";
import userModel from "../models/User.models.js";
import { userSchema, userSchemaLogin } from "../schema/User.schema.js";

export async function register(request, reply) {
	const db = request.server.mongo.db;
	const Users = userModel(db);
	const { body } = request;

	const parsedUser = userSchema.safeParse(body);
	if (!parsedUser.success) {
		return reply.code(400).send({
			success: false,
			message: "Erreur de validation du schéma",
			data: {
				errors: parsedUser.error.flatten().fieldErrors,
			},
		});
	}

	const { email, password, role, info, firstName, lastName } = parsedUser.data;

	const existingUser = await Users.findOne({ email, active: true });
	if (existingUser) {
		return reply.code(400).send({
			success: false,
			message: "Email déjà utilisé",
			data: {
				errors: ["Email already used"],
			},
		});
	}

	const hashedPassword = await bcrypt.hash(password, 10);
	const parsed = userSchema.parse({
		email,
		firstName,
		lastName,
		password: hashedPassword,
		info,
		active: true,
		role,
	});
	const result = await Users.create(parsed);

	return reply.code(201).send({
		message: "Compte créé",
		success: true,
		data: {
			userId: result.insertedId,
		},
	});
}

export async function login(request, reply) {
	const db = request.server.mongo.db;
	const Users = userModel(db);
	const { body } = request;

	const parsedUser = userSchemaLogin.safeParse(body);
	if (!parsedUser.success) {
		return reply.code(400).send({
			success: false,
			message: "Erreur de validation du schéma",
			data: {
				errors: parsedUser.error.flatten().fieldErrors,
			},
		});
	}

	const { email, password } = body;
	const user = await Users.findUserLogin({ email });

	if (!user || !(await bcrypt.compare(password, user.password))) {
		return reply.code(401).send({
			success: false,
			message: "Email ou mot de passe incorrect",
			data: {
				errors: ["Wrong email or password"],
			},
		});
	}
	if (!user.active) {
		return reply.code(401).send({
			success: false,
			message: "Compte désactivé",
			data: {
				errors: ["Account disabled"],
			},
		});
	}

	const token = request.server.jwt.sign(
		{
			_id: user._id,
			email: user.email,
			role: user.role,
		},

		{ expiresIn: "7d" }
	);

	return reply.send({ success: true, data: { id: user._id, token } });
}

export async function getUserById(request, reply) {
	const db = request.server.mongo.db;
	const { params } = request;
	const payload = request.user;
	const id = params?.id || payload._id;

	const Users = userModel(db);
	const user = await Users.findById(id);

	if (!user) {
		return reply.code(401).send({
			success: false,
			data: {
				message: "Utilisateur introuvable",
				errors: ["User not found"],
			},
		});
	}

	return reply.send({
		success: true,
		data: {
			user,
		},
	});
}

export async function getAll(request, reply) {
	const db = request.server.mongo.db;
	const Users = userModel(db);
	return reply.send({ success: true, data: { users: await Users.getAll() } });
}

export async function updateUser(request, reply) {
	const { id } = request.params;
	const db = request.server.mongo.db;
	const Users = userModel(db);
	const { body } = request;

	const parsedUser = userSchema.partial().safeParse(body);
	if (!parsedUser.success) {
		return reply.code(400).send({
			success: false,
			message: "Erreur de validation du schéma",
			data: {
				errors: parsedUser.error.flatten().fieldErrors,
			},
		});
	}
	const user = await Users.findById(id);
	if (!user) {
		return reply.code(404).send({
			success: false,
			message: "Utilisateur non trouvé",
			data: { errors: ["User not found"] },
		});
	}
	const updateData = parsedUser.data;
	updateData.modifiedAt = new Date();
	if (updateData.password) {
		updateData.password = await bcrypt.hash(updateData.password, 10);
	}
	const result = await Users.update(id, updateData);
	if (!result) {
		return reply.code(500).send({
			success: false,
			message: "Erreur lors de la mise à jour de l'utilisateur",
			data: { errors: ["Failed to update user"] },
		});
	}
	const updatedUser = await Users.findById(id);
	return reply.send({
		success: true,
		data: {
			user: updatedUser,
		},
	});
}

export async function deleteUser(request, reply) {
	const { id } = request.params;
	const db = request.server.mongo.db;
	const Users = userModel(db);
	const user = await Users.findById(id);
	if (!user) {
		return reply.code(404).send({
			success: false,
			message: "Utilisateur non trouvé",
			data: { errors: ["User not found"] },
		});
	}

	const result = await Users.update(id, { active: false });
	if (!result) {
		return reply.code(500).send({
			success: false,
			message: "Erreur lors de la suppression de l'utilisateur",
			data: { errors: ["Failed to delete user"] },
		});
	}
	return reply.send({
		success: true,
		message: "Utilisateur supprimé",
		data: {
			user: { _id: id },
		},
	});
}

export async function reactivateUser(request, reply) {
	const { id } = request.params;
	const db = request.server.mongo.db;
	const Users = userModel(db);
	const user = await Users.findById(id);
	if (!user) {
		return reply.code(404).send({
			success: false,
			message: "Utilisateur non trouvé",
			data: { errors: ["User not found"] },
		});
	}

	const result = await Users.update(id, { active: true });
	if (!result) {
		return reply.code(500).send({
			success: false,
			message: "Erreur lors de la réactivation de l'utilisateur",
			data: { errors: ["Failed to reactivate user"] },
		});
	}
	return reply.send({
		success: true,
		message: "Utilisateur réactivé",
		data: {
			user: { _id: id },
		},
	});
}
