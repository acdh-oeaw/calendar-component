export function getUniqueId() {
	return "id-" + crypto.getRandomValues(new Uint32Array(1)).toString();
}
