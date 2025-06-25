import { createBaseModel } from "../utils/modele.js";

export default function userModel(db) {
	const collection = db.collection("users");
	const base = createBaseModel(collection);
	return {
		...base,
		async findUserLogin(data) {
			return await collection.findOne(data);
		},
	};
}
