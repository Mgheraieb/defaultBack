import {
	register,
	login,
	getUserById,
	getAll,
	updateUser,
	deleteUser,
	reactivateUser,
} from "../controllers/User.controller.js";

export default async function (fastify) {
	fastify.post("/register", register);
	fastify.post("/login", login);
	fastify.get("/me", { preHandler: [fastify.authenticate] }, getUserById);
	fastify.get("/all", { preHandler: [fastify.isAdminRole] }, getAll);
	fastify.get("/:id", { preHandler: [fastify.isUserIdOrAdmin] }, getUserById);
	fastify.put("/:id", { preHandler: [fastify.isUserIdOrAdmin] }, updateUser);
	fastify.put(
		"/reactivate/:id",
		{ preHandler: [fastify.isAdminRole] },
		reactivateUser
	);
	fastify.delete("/:id", { preHandler: [fastify.isAdminRole] }, deleteUser);

}
