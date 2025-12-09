import { StockClient } from "@/client/stock-client";
import { getClientConfig } from "@/config/client-config";
import { useMemo } from "react";

export function useStockClient(): StockClient {
	const config = getClientConfig();
	const client = useMemo(() => new StockClient(config), [config]);

	return client;
}
