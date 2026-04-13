import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
} from "@/components/ui/dialog";
import { useDeleteFlockById } from "@/features/flock/api/flock-queries";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { IFlock } from "@/features/flock/types/flock-types";
import { FlockStatusBadge } from "@/features/flock/components/flock-status-badge";
import { UpdateFlockCountModal } from "@/features/flock/components/update-flock-count-modal";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useParams } from "@tanstack/react-router";
import { EllipsisVertical, Trash2 } from "lucide-react";

interface FlockCardProps {
	flock: IFlock;
}

const getTranslationName = (
	translations: Array<{ language: string; name: string }> | undefined,
	preferredLanguage: string,
): string => {
	if (!translations || translations.length === 0) {
		return "-";
	}

	const normalizedPreferredLanguage = preferredLanguage.toLowerCase();
	const preferredTranslation =
		translations.find(
			(item) => item.language.toLowerCase() === normalizedPreferredLanguage,
		) ??
		translations.find((item) => item.language.toLowerCase() === "en") ??
		translations.find((item) => item.language.toLowerCase() === "es");

	return preferredTranslation?.name ?? translations[0].name;
};

export const FlockCard = ({ flock }: FlockCardProps) => {
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const { mutate: deleteFlock, isPending: isDeleting } = useDeleteFlockById();
	const navigate = useNavigate();
	const handleDelete = () => {
		deleteFlock(
			{ flockId: flock.id },
			{ onSuccess: () => setDeleteDialogOpen(false) },
		);
	};
	const { t, i18n } = useTranslation("flocks");
	const { farmId } = useParams({ strict: false });
	const preferredLanguage = i18n.language.slice(0, 2) || "en";

	const speciesName = getTranslationName(
		flock.species?.translations,
		preferredLanguage,
	);
	const breedName = getTranslationName(
		flock.breed?.translations,
		preferredLanguage,
	);
	const occupancyRatio = Math.max(
		0,
		Math.min(100, Math.round((flock.currentCount / flock.initialCount) * 100)),
	);

	const goToDetail = () => {
		if (!farmId) return;

		void navigate({
			to: "/farm/$farmId/flocks/$flockId",
			params: { farmId, flockId: flock.id },
		});
	};

	return (
		<>
			<Dialog
				open={deleteDialogOpen}
				onOpenChange={setDeleteDialogOpen}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>{t("deleteDialog.title")}</DialogTitle>
					</DialogHeader>
					<p>{t("deleteDialog.confirm", { name: flock.name })}</p>
					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setDeleteDialogOpen(false)}
							disabled={isDeleting}
						>
							{t("common.cancel")}
						</Button>
						<Button
							variant="destructive"
							onClick={handleDelete}
							disabled={isDeleting}
						>
							{isDeleting ? t("common.deleting") : t("common.delete")}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
			<Card
				className="gap-0 rounded-[24px] border border-border/70 py-4 shadow-md md:hidden cursor-pointer"
				role="link"
				tabIndex={0}
				onClick={goToDetail}
				onKeyDown={(event) => {
					if (event.key === "Enter" || event.key === " ") {
						event.preventDefault();
						goToDetail();
					}
				}}
			>
				<CardHeader className="px-4 py-0">
					<div className="flex items-start justify-between gap-3">
						<div>
							<CardTitle className="text-[1.75rem] font-bold tracking-tight">
								{flock.name}
							</CardTitle>
							<Button
								variant="destructive"
								size="icon"
								className="ml-2"
								onClick={(event) => {
									event.stopPropagation();
									setDeleteDialogOpen(true);
								}}
								aria-label={t("deleteDialog.ariaLabel")}
							>
								<Trash2 className="w-5 h-5" />
							</Button>
							<p className="pt-1 text-sm text-muted-foreground">
								{t(`flockType.${flock.flockType}`)}
							</p>
						</div>
						<FlockStatusBadge status={flock.status} />
					</div>
				</CardHeader>
				<CardContent className="space-y-4 px-4 pt-5">
					<div className="grid grid-cols-2 gap-4">
						<div>
							<p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
								{t("fields.currentCount")}
							</p>
							<p className="pt-1 text-2xl font-bold text-foreground">
								{flock.currentCount}
							</p>
						</div>
						<div>
							<p className="text-[11px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
								{t("fields.initialCount")}
							</p>
							<p className="pt-1 text-2xl font-bold text-foreground/80">
								{flock.initialCount}
							</p>
						</div>
					</div>
					<div className="grid grid-cols-2 gap-3 rounded-[18px] border border-border/60 bg-muted/28 p-4 text-sm">
						<div>
							<p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
								{t("card.speciesBreed")}
							</p>
							<p className="pt-1 font-semibold">
								{speciesName} / {breedName}
							</p>
						</div>
						<div>
							<p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
								{t("fields.houseName")}
							</p>
							<p className="pt-1 font-semibold">
								{flock.houseName ?? t("common.notProvided")}
							</p>
						</div>
						<div className="col-span-2 border-t border-border/60 pt-3">
							<p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">
								{t("fields.startDate")}
							</p>
							<p className="pt-1 font-semibold">{flock.startDate}</p>
						</div>
					</div>
					<UpdateFlockCountModal
						flock={flock}
						farmId={farmId!}
						buttonClassName="h-12 w-full justify-center rounded-2xl border-0 bg-muted/70 px-4 font-semibold shadow-none"
						editorClassName="w-full min-w-0"
					/>
				</CardContent>
			</Card>

			<Card
				className="hidden gap-0 rounded-[24px] border border-border/20 py-5 shadow-[0px_12px_32px_rgba(28,28,24,0.06)] transition-transform duration-300 hover:-translate-y-1 md:flex cursor-pointer"
				role="link"
				tabIndex={0}
				onClick={goToDetail}
				onKeyDown={(event) => {
					if (event.key === "Enter" || event.key === " ") {
						event.preventDefault();
						goToDetail();
					}
				}}
			>
				<CardHeader className="px-5 py-0">
					<div className="flex items-start justify-between gap-3">
						<div className="space-y-2">
							<FlockStatusBadge status={flock.status} />
							<div>
								<CardTitle className="text-xl font-bold tracking-tight">
									{flock.name}
								</CardTitle>
								<Button
									variant="destructive"
									size="icon"
									className="ml-2"
									onClick={(event) => {
										event.stopPropagation();
										setDeleteDialogOpen(true);
									}}
									aria-label={t("deleteDialog.ariaLabel")}
								>
									<Trash2 className="w-5 h-5" />
								</Button>
								<p className="pt-1 text-sm text-muted-foreground">
									{t(`flockType.${flock.flockType}`)}
								</p>
							</div>
						</div>
						<Button
							variant="ghost"
							size="icon"
							className="h-9 w-9 rounded-xl text-muted-foreground"
							onClick={(event) => event.stopPropagation()}
							asChild
						>
							<Link
								to="/farm/$farmId/flocks/$flockId"
								params={{ farmId: farmId!, flockId: flock.id }}
							>
								<EllipsisVertical className="h-4 w-4" />
							</Link>
						</Button>
					</div>
				</CardHeader>
				<CardContent className="space-y-5 px-5 pt-5">
					<div className="space-y-3">
						<div className="flex items-end gap-2">
							<p className="text-4xl font-extrabold leading-none text-foreground">
								{flock.currentCount}
							</p>
							<p className="pb-1 text-sm font-semibold text-muted-foreground">
								{t("card.animals")}
							</p>
						</div>
						<div className="h-1.5 rounded-full bg-muted">
							<div
								className="h-full rounded-full bg-primary"
								style={{ width: `${occupancyRatio}%` }}
							/>
						</div>
						<div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.05em] text-muted-foreground">
							<span>
								{t("card.stateSummary", {
									status: t(`status.${flock.status}`),
								})}
							</span>
							<span>{t("card.baseRatio", { percent: occupancyRatio })}</span>
						</div>
					</div>

					<UpdateFlockCountModal
						flock={flock}
						farmId={farmId!}
						buttonClassName="h-11 w-full justify-center rounded-xl border border-border/50 bg-transparent font-bold text-foreground hover:bg-muted/50"
						editorClassName="w-full min-w-0"
					/>
				</CardContent>
			</Card>
		</>
	);
};
