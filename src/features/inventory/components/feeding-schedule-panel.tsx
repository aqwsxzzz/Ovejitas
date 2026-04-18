import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { useGetFeedTypes } from "@/features/feed-type/api/feed-type-queries";
import { useGetFlocksPage } from "@/features/flock/api/flock-queries";
import {
	useCreateFeedingSchedule,
	useDeleteFeedingScheduleById,
	useGetFeedingSchedules,
	useUpdateFeedingScheduleById,
} from "@/features/feeding-schedule/api/feeding-schedule-queries";
import { formatDateByMonth } from "@/lib/dayjs/date-formats";

interface FeedingSchedulePanelProps {
	farmId: string;
}

export const FeedingSchedulePanel = ({ farmId }: FeedingSchedulePanelProps) => {
	const { t } = useTranslation("inventory");
	const [open, setOpen] = useState(false);
	const [activeFilter, setActiveFilter] = useState<"all" | "active">("active");
	const [flockId, setFlockId] = useState("");
	const [feedTypeId, setFeedTypeId] = useState("");
	const [qtyPerDay, setQtyPerDay] = useState("");
	const [activeFrom, setActiveFrom] = useState<Date | null>(null);
	const [activeTo, setActiveTo] = useState<Date | null>(null);
	const { data: feedTypes = [] } = useGetFeedTypes({ farmId });
	const { data: flockData } = useGetFlocksPage({ farmId, page: 1, limit: 100 });
	const flocks = flockData?.items ?? [];
	const hasBaseData = feedTypes.length > 0 && flocks.length > 0;
	const filters = useMemo(
		() => ({ activeOnly: activeFilter === "active" ? true : undefined }),
		[activeFilter],
	);
	const { data: schedules = [], isPending } = useGetFeedingSchedules({
		farmId,
		filters,
	});
	const { mutateAsync: createSchedule, isPending: isCreating } =
		useCreateFeedingSchedule();
	const { mutateAsync: updateSchedule, isPending: isUpdating } =
		useUpdateFeedingScheduleById();
	const { mutateAsync: deleteSchedule, isPending: isDeleting } =
		useDeleteFeedingScheduleById();

	const resetForm = () => {
		setFlockId("");
		setFeedTypeId("");
		setQtyPerDay("");
		setActiveFrom(null);
		setActiveTo(null);
	};

	const handleCreate = async () => {
		if (!flockId || !feedTypeId || !qtyPerDay || !activeFrom) {
			return;
		}

		await createSchedule({
			farmId,
			payload: {
				flockId,
				feedTypeId,
				qtyPerDay: Number(qtyPerDay),
				activeFrom: activeFrom.toISOString().split("T")[0],
				activeTo: activeTo ? activeTo.toISOString().split("T")[0] : null,
			},
		});
		resetForm();
		setOpen(false);
	};

	return (
		<Card>
			<CardHeader className="flex flex-row items-center justify-between gap-2">
				<CardTitle>{t("feedingSchedules.title")}</CardTitle>
				<div className="flex items-center gap-2">
					<Select
						value={activeFilter}
						onValueChange={(value: "all" | "active") => setActiveFilter(value)}
					>
						<SelectTrigger className="w-[120px]">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="active">
								{t("feedingSchedules.filters.active")}
							</SelectItem>
							<SelectItem value="all">
								{t("feedingSchedules.filters.all")}
							</SelectItem>
						</SelectContent>
					</Select>
					<Dialog
						open={open}
						onOpenChange={setOpen}
					>
						<DialogTrigger asChild>
							<Button
								size="sm"
								disabled={!hasBaseData}
							>
								{t("feedingSchedules.newButton")}
							</Button>
						</DialogTrigger>
						<DialogContent className="max-h-[90vh] overflow-y-auto">
							<DialogTitle>{t("feedingSchedules.modal.title")}</DialogTitle>
							<DialogDescription>
								{t("feedingSchedules.modal.description")}
							</DialogDescription>
							<div className="space-y-3">
								<div>
									<Label>{t("feedingSchedules.modal.flock")}</Label>
									<Select
										value={flockId}
										onValueChange={setFlockId}
									>
										<SelectTrigger className="w-full">
											<SelectValue
												placeholder={t(
													"feedingSchedules.modal.flockPlaceholder",
												)}
											/>
										</SelectTrigger>
										<SelectContent>
											{flocks.map((item) => (
												<SelectItem
													key={item.id}
													value={item.id}
												>
													{item.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div>
									<Label>{t("feedingSchedules.modal.feedType")}</Label>
									<Select
										value={feedTypeId}
										onValueChange={setFeedTypeId}
									>
										<SelectTrigger className="w-full">
											<SelectValue
												placeholder={t(
													"feedingSchedules.modal.feedTypePlaceholder",
												)}
											/>
										</SelectTrigger>
										<SelectContent>
											{feedTypes.map((item) => (
												<SelectItem
													key={item.id}
													value={item.id}
												>
													{item.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
								<div>
									<Label>{t("feedingSchedules.modal.qtyPerDay")}</Label>
									<Input
										type="number"
										min="0"
										step="0.01"
										value={qtyPerDay}
										onChange={(event) => setQtyPerDay(event.target.value)}
									/>
								</div>
								<div>
									<Label>{t("feedingSchedules.modal.activeFrom")}</Label>
									<Popover>
										<PopoverTrigger asChild>
											<Button
												variant="outline"
												className="w-full justify-start text-left font-normal"
											>
												{activeFrom
													? formatDateByMonth(
															activeFrom.toISOString().split("T")[0],
														)
													: t("feedingSchedules.modal.selectDate")}
											</Button>
										</PopoverTrigger>
										<PopoverContent
											align="start"
											className="w-auto p-0"
										>
											<Calendar
												mode="single"
												selected={activeFrom || undefined}
												onSelect={(date) => setActiveFrom(date || null)}
												disabled={(date) => date < new Date()}
												required
											/>
										</PopoverContent>
									</Popover>
								</div>
								<div>
									<Label>{t("feedingSchedules.modal.activeTo")}</Label>
									<Popover>
										<PopoverTrigger asChild>
											<Button
												variant="outline"
												className="w-full justify-start text-left font-normal"
											>
												{activeTo
													? formatDateByMonth(
															activeTo.toISOString().split("T")[0],
														)
													: t("feedingSchedules.modal.optional")}
											</Button>
										</PopoverTrigger>
										<PopoverContent
											align="start"
											className="w-auto p-0"
										>
											<Calendar
												mode="single"
												selected={activeTo || undefined}
												onSelect={(date) => setActiveTo(date || null)}
												disabled={(date) => date < (activeFrom ?? new Date())}
												required={false}
											/>
										</PopoverContent>
									</Popover>
								</div>
								<Button
									className="w-full"
									disabled={isCreating}
									onClick={() => void handleCreate()}
								>
									{t("feedingSchedules.modal.create")}
								</Button>
							</div>
						</DialogContent>
					</Dialog>
				</div>
			</CardHeader>
			<CardContent>
				{!hasBaseData ? (
					<div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
						{t("feedingSchedules.missingBaseData")}
					</div>
				) : isPending ? (
					<p className="text-sm text-muted-foreground">
						{t("feedingSchedules.loading")}
					</p>
				) : schedules.length === 0 ? (
					<p className="text-sm text-muted-foreground">
						{t("feedingSchedules.empty")}
					</p>
				) : (
					<div className="space-y-2">
						{schedules.map((schedule) => {
							const flockName =
								flocks.find((item) => item.id === schedule.flockId)?.name ??
								schedule.flock?.name ??
								t("feedingSchedules.unknownFlock");
							const feedTypeName =
								feedTypes.find((item) => item.id === schedule.feedTypeId)
									?.name ??
								schedule.feedType?.name ??
								t("feedingSchedules.unknownFeedType");
							const isActive =
								!schedule.activeTo || new Date(schedule.activeTo) > new Date();

							return (
								<div
									key={schedule.id}
									className="rounded-md border p-3 flex items-start justify-between gap-3"
								>
									<div className="text-sm">
										<p className="font-semibold">{flockName}</p>
										<p className="text-muted-foreground">{feedTypeName}</p>
										<p className="font-medium">
											{t("feedingSchedules.item.qtyPerDay", {
												qty: schedule.qtyPerDay,
											})}
										</p>
										<p className="text-xs text-muted-foreground">
											{t("feedingSchedules.item.period", {
												from: formatDateByMonth(schedule.activeFrom),
												to: schedule.activeTo
													? formatDateByMonth(schedule.activeTo)
													: t("feedingSchedules.status.ongoing"),
											})}
										</p>
										<Badge variant={isActive ? "default" : "secondary"}>
											{isActive
												? t("feedingSchedules.status.active")
												: t("feedingSchedules.status.inactive")}
										</Badge>
									</div>
									<div className="flex flex-col gap-2">
										{isActive && (
											<Button
												variant="outline"
												size="sm"
												disabled={isUpdating}
												onClick={() =>
													void updateSchedule({
														farmId,
														feedingScheduleId: schedule.id,
														payload: {
															activeTo: new Date().toISOString().split("T")[0],
														},
													})
												}
											>
												{t("feedingSchedules.actions.close")}
											</Button>
										)}
										<Button
											variant="destructive"
											size="sm"
											disabled={isDeleting}
											onClick={() =>
												void deleteSchedule({
													farmId,
													feedingScheduleId: schedule.id,
												})
											}
										>
											{t("feedingSchedules.actions.delete")}
										</Button>
									</div>
								</div>
							);
						})}
					</div>
				)}
			</CardContent>
		</Card>
	);
};
