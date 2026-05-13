import type { ReactNode } from "react";
import { Card, CardContent } from "@/components/ui/card";
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

export const v2AuthInputClassName =
	"h-14 w-full rounded-2xl border border-[#c9d6d0] bg-[#f5f8f6] px-4 text-base text-[#123240] outline-none transition placeholder:text-[#7d9098] focus:border-[#0f4b3a] focus:bg-white focus-visible:ring-2 focus-visible:ring-[#d6e7df]";

export const v2AuthLabelClassName = "text-base font-semibold text-[#123240]";

export const v2AuthSubmitClassName =
	"flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-[#0f4b3a] px-4 text-base font-semibold text-white transition hover:bg-[#0d3f31] disabled:cursor-not-allowed disabled:opacity-70";

export function V2AuthPageFrame(props: V2AuthPageFrameProps) {
	return (
		<div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] min-h-screen w-screen overflow-x-hidden overflow-y-auto bg-[#f7f5f2]">
			<div className="relative isolate min-h-screen">
				<div
					aria-hidden="true"
					className="pointer-events-none absolute inset-0 opacity-70"
					style={{
						backgroundImage:
							"radial-gradient(circle, rgba(49,95,74,0.14) 1px, transparent 1px)",
						backgroundSize: "18px 18px",
					}}
				/>
				<div
					aria-hidden="true"
					className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,rgba(246,232,201,0.95),transparent_72%)]"
				/>
				<div className="relative mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center px-4 py-8 md:px-10 md:py-10">
					<Card className="w-full rounded-[34px] border-[#d2ddd7] bg-white/70 py-0 shadow-[0_28px_72px_-48px_rgba(15,23,42,0.4)]">
						<CardContent className="p-5 md:p-10">
							<p className="text-xs font-medium uppercase tracking-[0.18em] text-[rgba(27,54,48,0.48)]">
								{props.eyebrow}
							</p>

							<div className="mt-7 flex w-full flex-col items-center text-center md:mt-4">
								<div className="flex h-20 w-20 items-center justify-center rounded-[20px] bg-[linear-gradient(180deg,#245546_0%,#163f33_100%)] text-[#f9f5ea] shadow-[0_16px_32px_-18px_rgba(22,63,51,0.9)]">
									{props.brandIcon}
								</div>
								<h1
									className="mt-6 w-full text-center text-5xl leading-[0.95] font-semibold tracking-[-0.04em] text-[#072e42] md:text-[3.45rem]"
									style={{ fontFamily: "var(--v2-font-display)" }}
								>
									{props.title}
								</h1>
								<p className="mt-3 w-full max-w-2xl text-pretty text-center text-base leading-7 text-[#335a69] md:text-xl md:leading-8">
									{props.subtitle}
								</p>
							</div>

							<Card className="mx-auto mt-10 w-full max-w-3xl rounded-3xl border-[#d9e2dc] bg-white py-0 shadow-[0_28px_64px_-44px_rgba(15,23,42,0.4)]">
								<CardContent className="p-6 md:p-9">
									<div className="border-l-[3px] border-[#1f5f4a] pl-4">
										<h2
											className="max-w-[18ch] text-balance text-[2.1rem] leading-tight font-semibold tracking-[-0.03em] text-[#072e42] md:text-[2.4rem]"
											style={{ fontFamily: "var(--v2-font-display)" }}
										>
											{props.formTitle}
										</h2>
										<p className="mt-1 max-w-[34ch] text-pretty text-base text-[#335a69] md:text-lg">
											{props.formSubtitle}
										</p>
									</div>

									<div className="mt-6 min-w-0 w-full">{props.children}</div>

									<Separator className="mt-6" />
									<div className="pt-5 text-center text-sm text-[#486675]">
										{props.footer}
									</div>
								</CardContent>
							</Card>

							{props.bottomSlot ? (
								<div className="mx-auto mt-7 w-full max-w-2xl">
									{props.bottomSlot}
								</div>
							) : null}
							{props.legal ? (
								<p className="mx-auto mt-5 block w-full max-w-2xl px-2 text-center text-sm leading-6 text-[#5f7a84] [text-wrap:pretty] [white-space:normal]">
									{props.legal}
								</p>
							) : null}
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
