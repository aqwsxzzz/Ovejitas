import type { ReactNode } from "react";

export function LogActionCard(props: {
	title: string;
	subtitle: string;
	children: ReactNode;
}) {
	return (
		<div className="v2-card p-5">
			<p className="v2-kicker">{props.title}</p>
			<p className="mt-1 text-sm text-(--v2-ink-soft)">{props.subtitle}</p>
			<div className="mt-4 space-y-3">{props.children}</div>
		</div>
	);
}
