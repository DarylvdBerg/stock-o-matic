import { GetStockResponse } from "@/proto/services/v1/stock_service_pb";
import { JSX, use } from "react";
import {
	Card,
	CardActions,
	CardContent,
	CardHeader,
	Chip,
	Grid as MUIGrid,
	Typography,
} from "@mui/material";
import { getStockFromResponse } from "@/utils/response";
import { Category, Stock } from "@/proto/core/v1/stock_pb";

/**
 * Defines the properties for rendering our grid.
 *
 * @interface GridProps
 * @typedef {GridProps}
 */
interface GridProps {
	stock: Promise<GetStockResponse>;
}

export function Grid({ stock }: GridProps): JSX.Element {
	const data = getStockFromResponse(use(stock));

	return (
		<MUIGrid container spacing={{ xs: 2, sm: 4, md: 6 }}>
			{data.map((s: Stock) => (
				<MUIGrid key={s.id} size={{ xs: 12, sm: 6, md: 3 }}>
					<Card variant="outlined">
						<CardHeader title={s.name} />
						<CardContent>
							<Typography>Quantity: {s.quantity}</Typography>
						</CardContent>
						<CardActions>
							{s.categories.map((c: Category) => (
								<Chip
									size="small"
									variant="outlined"
									key={c.id}
									label={c.name}
								/>
							))}
						</CardActions>
					</Card>
				</MUIGrid>
			))}
		</MUIGrid>
	);
}
