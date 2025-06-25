// utils/slugify.ts
export function slugify(name) {
	return name
		.normalize("NFD") // enlève les accents
		.replace(/[\u0300-\u036f]/g, "") // caractères diacritiques
		.toLowerCase()
		.replace(/[^a-z0-9\s-]/g, "") // enlève tout sauf lettres, chiffres, espaces, tirets
		.trim()
		.replace(/\s+/g, "-") // remplace espaces par tirets
		.replace(/-+/g, "-"); // supprime les doubles tirets
}
