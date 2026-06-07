import type { ReactNode } from "react";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

type V2AuthPageFrameProps = {
	eyebrow: string;
	brandIcon: ReactNode;
	title: string;
	subtitle: string;
	formTitle: string;
	formSubtitle: string;
	children: ReactNode;
	footer: ReactNode;
	bottomSlot?: ReactNode;
	legal?: ReactNode;
};

export function V2AuthPageFrame(props: V2AuthPageFrameProps) {
	return (
		<div className="flex min-h-screen w-full items-center justify-center bg-background px-4 py-8">
			<div className="w-full max-w-md space-y-6">
				<div className="flex flex-col items-center text-center">
					<p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
						{props.eyebrow}
					</p>
					<div className="mt-4 flex size-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
						{props.brandIcon}
					</div>
					<h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
						{props.title}
					</h1>
					<p className="mt-2 max-w-sm text-sm text-muted-foreground">
						{props.subtitle}
					</p>
				</div>

				<Card>
					<CardHeader>
						<CardTitle className="text-xl">{props.formTitle}</CardTitle>
						<CardDescription>{props.formSubtitle}</CardDescription>
					</CardHeader>
					<CardContent className="space-y-6">
						{props.children}
						<Separator />
						<div className="text-center text-sm text-muted-foreground">
							{props.footer}
						</div>
					</CardContent>
				</Card>

				{props.bottomSlot ? <div>{props.bottomSlot}</div> : null}
				{props.legal ? (
					<p className="px-2 text-center text-xs leading-6 text-muted-foreground">
						{props.legal}
					</p>
				) : null}
			</div>
		</div>
	);
}
