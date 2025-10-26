import { Link } from "@tanstack/react-router";
import { CircleChevronLeft } from "lucide-react";
import type { ReactNode } from "react";

interface PageHeaderProps {
	title: string;
	description?: string;
	backLink?: {
		to: string;
		params: Record<string, string>;
	};
	action?: ReactNode;
}

export const PageHeader = ({
	title,
	description,
	backLink,
	action,
}: PageHeaderProps) => {
	return (
		<div className="flex flex-col gap-2">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					{backLink && (
						<Link to={backLink.to} params={backLink.params}>
							<CircleChevronLeft className="h-6 w-6 text-primary hover:text-primary/80 transition-colors" />
						</Link>
					)}
					<h1 className="text-h1 text-foreground">{title}</h1>
				</div>
				{action && <div>{action}</div>}
			</div>
			{description && (
				<p className="text-small text-muted-foreground">{description}</p>
			)}
		</div>
	);
};
