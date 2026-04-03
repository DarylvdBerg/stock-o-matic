"use client";

import {
	Box,
	Fab,
	IconButton,
	Modal,
	SpeedDial,
	SpeedDialAction,
	SpeedDialIcon,
	Typography,
} from "@mui/material";
import { ReactElement, useState } from "react";

import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";

interface ActionsProps {
	actions: Action[];
}

type Action = {
	component: ReactElement;
	icon: ReactElement;
	name: string;
};

export function Actions({ actions }: ActionsProps) {
	const [activeAction, setActiveAction] = useState<Action | null>(null);

	const handleClose = () => {
		setActiveAction(null);
	};

	return (
		<>
			{actions.length === 1 ? (
				<Fab
					color="primary"
					aria-label={actions[0].name}
					onClick={() => setActiveAction(actions[0])}
					sx={{ position: "fixed", bottom: 24, right: 24 }}
				>
					<AddIcon />
				</Fab>
			) : (
				<SpeedDial
					ariaLabel="Actions"
					sx={{ position: "fixed", bottom: 24, right: 24 }}
					icon={<SpeedDialIcon />}
				>
					{actions.map((action, index) => (
						<SpeedDialAction
							key={"action-" + index}
							icon={action.icon}
							slotProps={{ tooltip: { title: action.name } }}
							onClick={() => setActiveAction(action)}
						/>
					))}
				</SpeedDial>
			)}
			<Modal open={activeAction !== null} onClose={handleClose}>
				<Box
					sx={{
						position: "absolute",
						top: { xs: 0, sm: "50%" },
						left: { xs: 0, sm: "50%" },
						right: { xs: 0, sm: "auto" },
						bottom: { xs: 0, sm: "auto" },
						transform: { xs: "none", sm: "translate(-50%, -50%)" },
						bgcolor: "background.paper",
						borderRadius: { xs: 0, sm: 2 },
						width: { sm: 480 },
						maxHeight: { sm: "90vh" },
						overflow: "auto",
						boxShadow: 24,
						display: "flex",
						flexDirection: "column",
						p: 3,
					}}
				>
					<Box
						sx={{
							display: "flex",
							justifyContent: "space-between",
							alignItems: "center",
							mb: 2,
						}}
					>
						<Typography variant="h6">{activeAction?.name ?? ""}</Typography>
						<IconButton size="small" onClick={handleClose}>
							<CloseIcon fontSize="small" />
						</IconButton>
					</Box>
					{activeAction?.component}
				</Box>
			</Modal>
		</>
	);
}
