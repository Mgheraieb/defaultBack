import mongoose from "mongoose";

const connectDB = async () => {
	try {
		await mongoose.connect(process.env.MONGO_URI);
		console.log("✅ Connexion MongoDB réussie");
	} catch (err) {
		console.error("❌ Connexion MongoDB échouée :", err.message);
		process.exit(1);
	}
};

export default connectDB;
