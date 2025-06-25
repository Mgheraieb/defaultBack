export const isAdmin = (payload) => {
	if (!payload || !payload.role) {
		return false;
	}
	return payload.role === "admin";
};

export const isUserId = (user, request) => {
	if (!user || !user._id || !request) {
		return false;
	}
	return user._id === request;
};
