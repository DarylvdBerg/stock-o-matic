import { Code } from "@connectrpc/connect";
import { RpcError } from "./rpc-error";

/**
 * Default Rpc error we'll throw when we do not know the cause of the problem.
 *
 * @param {Error} error
 * @returns {*}
 */
export const UnknownFailureRpcError = (error: Error) =>
	new RpcError(
		`Unknown failure during request ${error.message}`,
		Code.Internal,
		error,
	);
