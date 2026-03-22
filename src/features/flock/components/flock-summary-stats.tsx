import { Card, CardContent } from "@/components/ui/card";
import { useTranslation } from "react-i18next";

interface FlockSummaryStatsProps {
	totalFlocks: number;
	activeFlocks: number;
	totalAnimals: number;
}

export const FlockMobileSummaryStats = ({
	totalFlocks,
	activeFlocks,
}: FlockSummaryStatsProps) => {
	const { t } = useTranslation("flocks");

	return (
		<div className="grid grid-cols-2 gap-3 md:hidden">
			<Card className="gap-0 rounded-[20px] border border-border/70 py-0 shadow-sm">
				<CardContent className="p-4">
					<p className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
						{t("summary.totalFlocks")}
					</p>
					<p className="pt-2 text-3xl font-bold text-foreground">
						{totalFlocks}
					</p>
				</CardContent>
			</Card>
			<Card className="gap-0 rounded-[20px] border-0 bg-foreground py-0 text-background shadow-md">
				<CardContent className="flex min-h-[108px] items-end justify-between p-4">
					<div>
						<p className="text-[11px] font-bold uppercase tracking-[0.2em] text-background/70">
							{t("summary.activeFlocks")}
						</p>
						<p className="pt-2 text-3xl font-bold">
							{String(activeFlocks).padStart(2, "0")}
						</p>
					</div>
					<div className="h-12 w-12 rounded-2xl bg-background/12" />
				</CardContent>
			</Card>
		</div>
	);
};

export const FlockDesktopSummaryCard = ({
	totalAnimals,
}: FlockSummaryStatsProps) => {
	const { t } = useTranslation("flocks");

	return (
		<Card className="gap-0 rounded-[24px] border-0 bg-foreground py-0 text-background shadow-lg">
			<CardContent className="space-y-3 p-5">
				<p className="text-xs font-bold uppercase tracking-[0.2em] text-background/70">
					{t("summary.totalAnimals")}
				</p>
				<p className="text-3xl font-extrabold leading-none">{totalAnimals}</p>
				<p className="max-w-[18ch] text-sm text-background/78">
					{t("summary.totalAnimalsDescription")}
				</p>
			</CardContent>
		</Card>
	);
};
