import { Code } from "@connectrpc/connect";

/**
 * Custom error we can give back to the frontend.
 *
 * @export
 * @class RpcError
 * @typedef {RpcError}
 * @extends {Error}
 */
export class RpcError extends Error {
	constructor(
		message: string,
		public code?: Code,
		public originalError?: unknown,
	) {
		super(message);
	}
}
