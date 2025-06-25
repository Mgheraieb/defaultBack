import { ObjectId } from "mongodb";
import { z } from "zod";

export const getObjectIdSchema = () => {
	return z.instanceof(ObjectId);
};
