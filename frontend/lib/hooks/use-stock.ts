import { useMemo } from "react";
import { getClientConfig } from "@/config/client-config";
import { StockClient } from "@/client/stock-client";

export function useStockClient() {
	return useMemo(() => {
		return new StockClient(getClientConfig());
	}, []);
}
