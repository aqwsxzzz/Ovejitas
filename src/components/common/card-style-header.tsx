import type React from "react";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";
import { CircleChevronLeft } from "lucide-react";

type CardStyleHeaderProps = {
	title: string;
	Modal: React.ElementType;
	backLink?: {
		to: string;
		params: Record<string, string>;
	};
};
export const CardStyleHeader = ({ title, Modal, backLink }: CardStyleHeaderProps) => {
	return (
		<CardHeader className="flex items-center justify-between mb-8 sticky top-0 bg-card z-10 py-4 px-6 shadow">
			<div className="flex items-center gap-3">
				{backLink && (
					<Link to={backLink.to} params={backLink.params}>
						<CircleChevronLeft className="h-6 w-6 text-primary hover:text-primary/80 transition-colors" />
					</Link>
				)}
				<CardTitle className="text-2xl font-bold text-primary">{title}</CardTitle>
			</div>
			<Modal />
		</CardHeader>
	);
};
