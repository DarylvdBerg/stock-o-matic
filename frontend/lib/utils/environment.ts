/**
 * Helper that will return whether the node env is development or not.
 *
 * @export
 * @returns {boolean}
 */
export function isDev(): boolean {
	return process.env.NODE_ENV == "development";
}
