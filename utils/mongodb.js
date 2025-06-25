import { ObjectId } from "mongodb";

export function safeObjectIdFromString(id) {
	try {
		return ObjectId.createFromHexString(id);
	} catch {
		return null;
	}
}
