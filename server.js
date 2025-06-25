import Fastify from "fastify";
import cors from "@fastify/cors";
import fastifyMongo from "@fastify/mongodb";
import dotenv from "dotenv";
import fastifyJwt from "@fastify/jwt";
import userRoutes from "./routes/User.routes.js";
import { isAdmin, isUserId } from "./middlewares/auth.middleware.js";
// Configuration
dotenv.config();
const app = Fastify({ logger: true });

// Connecter à MongoDB
app.register(cors);

app.register(fastifyMongo, {
	forceClose: true,
	url: process.env.MONGO_URI,
	database: process.env.MONGO_DB,
});

// Activer CORS

// Auth avec JWT
app.register(fastifyJwt, {
	secret: process.env.JWT_SECRET,
});

app.decorate("authenticate", async function (request, reply) {
	try {
		await request.jwtVerify();
	} catch (err) {
		reply.code(401).send({
			success: false,
			message: "Token invalide ou manquant",
			data: { errors: ["Unauthorized", "authenticate"] },
		});
	}
});

app.decorate("isAdminRole", async function (request, reply) {
	try {
		await request.jwtVerify();
		if (!isAdmin(request.user)) {
			reply.code(401).send({
				success: false,
				message: "Accès non autorisé",
				data: { errors: ["Unauthorized", "isAdminRole"] },
			});
		}
	} catch (err) {
		reply.code(401).send({
			success: false,
			message: "Token invalide ou manquant",
			data: { errors: ["Unauthorized", "Token"] },
		});
	}
});

app.decorate("isUserIdOrAdmin", async function (request, reply) {
	try {
		await request.jwtVerify();
		const { id } = request.params;
		if (!isAdmin(request.user) && !isUserId(request.user, id)) {
			reply.code(401).send({
				success: false,
				message: "Accès non autorisé",
				data: { errors: ["Unauthorized", "isUserIdOrAdmin"] },
			});
		}
	} catch (err) {
		reply.code(401).send({
			success: false,
			message: "Token invalide ou manquant",
			data: { errors: ["Unauthorized", "Token"] },
		});
	}
});

// Routes
app.register(userRoutes, { prefix: "/api/users" });
// Lancer le serveur
const start = async () => {
	try {
		await app.listen({
			port: process.env.PORT || 3005,
			host: "0.0.0.0", // Permet d'écouter sur toutes les interfaces réseau
		});
		console.log(`🚀 Serveur lancé sur le port ${process.env.PORT || 3005}`);
	} catch (err) {
		app.log.error(err);
		process.exit(1);
	}
};
app.ready(async () => {
	try {
		const db = app.mongo.db;
	} catch (err) {
		console.log(err);
	}
});
start();
