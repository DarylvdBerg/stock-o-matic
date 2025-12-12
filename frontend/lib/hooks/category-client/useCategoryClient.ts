import { CategoryClient } from "@/client/category-client";
import { getClientConfig } from "@/config/client-config";
import { useMemo } from "react";

export function useCategoryClient(): CategoryClient {
	const config = getClientConfig();
	const client = useMemo(() => new CategoryClient(config), [config]);

	return client;
}
