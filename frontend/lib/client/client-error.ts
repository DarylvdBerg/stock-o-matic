import { Code } from "@connectrpc/connect";

/**
 * Custom error we can give back to the frontend.
 *
 * @export
 * @class ClientError
 * @typedef {ClientError}
 * @extends {Error}
 */
export class ClientError extends Error {
	constructor(
		message: string,
		public code?: Code,
		public originalError?: unknown,
	) {
		super(message);
	}
}
