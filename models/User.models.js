import { createBaseModel } from "../utils/modele.js";

export default function userModel(db) {
	const collection = db.collection("users");
	const base = createBaseModel(collection);
	return {
		...base,
	};
	return Object.assign({}, base, custom);
}
