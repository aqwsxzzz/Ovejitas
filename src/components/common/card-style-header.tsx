import type React from "react";
import { CardHeader, CardTitle } from "@/components/ui/card";

type CardStyleHeaderProps = {
	title: string;
	Modal: React.ElementType;
};
export const CardStyleHeader = ({ title, Modal }: CardStyleHeaderProps) => {
	return (
		<CardHeader className="flex items-center justify-between mb-8 sticky top-0 bg-card z-10 py-4 px-6 shadow">
			<CardTitle className="text-2xl font-bold text-primary">{title}</CardTitle>
			<Modal />
		</CardHeader>
	);
};
