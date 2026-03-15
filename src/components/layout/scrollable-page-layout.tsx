import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface ScrollablePageLayoutProps {
	header: ReactNode;
	children: ReactNode;
	className?: string;
}

export const ScrollablePageLayout = ({
	header,
	children,
	className,
}: ScrollablePageLayoutProps) => (
	<div className={cn("flex flex-col px-4", className)}>
		<div className="sticky top-0 z-10 shrink-0 bg-background pt-4 pb-4">
			{header}
		</div>
		{children}
	</div>
);
