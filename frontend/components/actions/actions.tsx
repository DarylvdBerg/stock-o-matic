"use client";

import {
	SpeedDial,
	SpeedDialAction,
	SpeedDialIcon,
} from "@mui/material";
import { JSX } from "react";

import ShareIcon from '@mui/icons-material/Share';
// TODO: Docs
interface ActionsProps {
	actions: Action[];
}

// TODO: Docs
type Action = {
	component: JSX.Element;
	icon: JSX.Element;
	name: string;
};

// TODO: Docs
export function Actions({}): JSX.Element {


	return (
        <>
            <SpeedDial
                ariaLabel="Actions"
                sx={{ position: "absolute", bottom: 16, right: 16 }}
                icon={<SpeedDialIcon />}
            >
                <SpeedDialAction key={1} icon={<ShareIcon />} slotProps={{ tooltip: {title: 'thing'}}} />
            </SpeedDial>
        </>
	);
}
