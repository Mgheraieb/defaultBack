import { ObjectId } from "mongodb";
import { safeObjectIdFromString } from "./mongodb.js";

export function createBaseModel(collection) {
	return {
		async create(data) {
			return await collection.insertOne(data);
		},

		async findOne(query) {
			return await collection.findOne(
				{ ...query, $or: [{ active: true }, { active: { $exists: false } }] },
				{ projection: { password: 0 } }
			);
		},

		async getAll(filter = {}) {
			return await collection
				.find(
					{
						...filter,
						$or: [{ active: true }, { active: { $exists: false } }],
					},
					{ projection: { password: 0 } }
				)
				.toArray();
		},

		async findById(id) {
			return await collection.findOne(
				{ _id: safeObjectIdFromString(id) },
				{ projection: { password: 0 } }
			);
		},

		async update(id, data) {
			return await collection.updateOne(
				{ _id: safeObjectIdFromString(id) },
				{ $set: data }
			);
		},
	};
}
