"use client";

import {
	Box,
	IconButton,
	Modal,
	SpeedDial,
	SpeedDialAction,
	SpeedDialIcon,
} from "@mui/material";
import { ReactElement, useState } from "react";

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
	const [component, setComponent] = useState<ReactElement | null>(null);
	const [open, setOpen] = useState(false);

	const handleOpen = (component: ReactElement) => {
		setOpen(true);
		setComponent(component);
	};

	const handleClose = () => {
		setOpen(false);
		setComponent(null);
	};

	return (
		<>
			<SpeedDial
				ariaLabel="Actions"
				sx={{ position: "fixed", bottom: 16, right: 16 }}
				icon={<SpeedDialIcon />}
			>
				{actions.map((action, index) => (
					<SpeedDialAction
						key={"action-" + index}
						icon={action.icon}
						slotProps={{ tooltip: { title: action.name } }}
						onClick={() => handleOpen(action.component)}
					/>
				))}
			</SpeedDial>
			<Modal open={open} onClose={handleClose}>
				<Box
					sx={{
						position: "absolute",
						top: "50%",
						left: "50%",
						transform: "translate(-50%, -50%)",
						bgcolor: "background.paper",
						borderRadius: 1.5,
						minWidth: 300,
						minHeight: 300,
						display: "flex",
						flexDirection: "column",
						p: 1,
					}}
				>
					<IconButton sx={{ alignSelf: "flex-end" }} onClick={handleClose}>
						<CloseIcon />
					</IconButton>
					{component}
				</Box>
			</Modal>
		</>
	);
}
