import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	useGetFarmById,
	useGetFarmCurrencies,
	useUpdateFarmById,
} from "@/features/farm/api/farm-queries";
import { useGetUserProfile } from "@/features/auth/api/auth-queries";
import { useGetFarmMembers } from "@/features/farm-members/api/farm-members-queries";
import { FarmLocationPicker } from "@/features/farm/components/farm-location-picker";

interface FarmSettingsFormProps {
	farmId: string;
}

interface FarmDraft {
	name?: string;
	currency?: string | null;
	latitude?: number | null;
	longitude?: number | null;
}

const buildUpdatePayload = (draft: FarmDraft) => ({
	...(draft.name !== undefined ? { name: draft.name } : {}),
	...(draft.currency !== undefined ? { currency: draft.currency } : {}),
	...(draft.latitude !== undefined ? { latitude: draft.latitude } : {}),
	...(draft.longitude !== undefined ? { longitude: draft.longitude } : {}),
});

export const FarmSettingsForm = ({ farmId }: FarmSettingsFormProps) => {
	const [draft, setDraft] = useState<FarmDraft>({});
	const { data: farmData, isLoading: isFarmLoading } = useGetFarmById(farmId);
	const { data: currencyOptions = [], isLoading: isCurrenciesLoading } =
		useGetFarmCurrencies();
	const { data: currentUser } = useGetUserProfile();
	const { data: farmMembers, isLoading: isMembersLoading } = useGetFarmMembers({
		farmId,
	});
	const updateFarmMutation = useUpdateFarmById();

	const isOwner = isMembersLoading
		? true // optimistic while loading
		: (farmMembers ?? []).some(
				(member) =>
					member.userId === currentUser?.id && member.role === "owner",
			);

	const currentName = draft.name ?? farmData?.name ?? "";
	const currentCurrency = draft.currency ?? farmData?.currency ?? "";
	const currentLatitude = draft.latitude ?? farmData?.latitude ?? null;
	const currentLongitude = draft.longitude ?? farmData?.longitude ?? null;
	const hasChanges = Object.keys(draft).length > 0;

	const coordinatesPreview = useMemo(() => {
		if (currentLatitude == null || currentLongitude == null) return "Not set";
		return `${currentLatitude.toFixed(6)}, ${currentLongitude.toFixed(6)}`;
	}, [currentLatitude, currentLongitude]);

	const handleSave = async () => {
		if (!hasChanges) return;
		if (!currentName.trim()) {
			toast.error("Farm name is required.");
			return;
		}

		try {
			await updateFarmMutation.mutateAsync({
				farmId,
				payload: buildUpdatePayload({ ...draft, name: currentName.trim() }),
			});
			setDraft({});
			toast.success("Farm settings updated.");
		} catch (error) {
			toast.error(
				error instanceof Error
					? error.message
					: "Could not update farm settings.",
			);
		}
	};

	if (isFarmLoading) {
		return (
			<p className="text-sm text-muted-foreground">Loading farm settings...</p>
		);
	}

	if (!farmData) {
		return (
			<p className="text-sm text-destructive">Farm data could not be loaded.</p>
		);
	}

	return (
		<div className="space-y-4">
			{!isOwner ? (
				<div className="rounded-md border border-warning/50 bg-warning/10 px-4 py-3 text-sm text-warning">
					Only farm owners can change these settings.
				</div>
			) : null}
			<Card>
				<CardHeader>
					<CardTitle>Farm Identity</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					<div className="space-y-1">
						<Label htmlFor="farm-name">Farm Name</Label>
						<Input
							id="farm-name"
							value={currentName}
							onChange={(event) =>
								setDraft((previous) => ({
									...previous,
									name: event.target.value,
								}))
							}
						/>
					</div>
					<div className="space-y-1">
						<Label>Currency</Label>
						<Select
							value={currentCurrency || undefined}
							onValueChange={(value) =>
								setDraft((previous) => ({ ...previous, currency: value }))
							}
						>
							<SelectTrigger>
								<SelectValue
									placeholder={
										isCurrenciesLoading
											? "Loading currencies..."
											: "Select currency"
									}
								/>
							</SelectTrigger>
							<SelectContent>
								{currencyOptions.map((currency) => (
									<SelectItem
										key={currency.code}
										value={currency.code}
									>
										{currency.code} - {currency.name}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle>Location</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					<FarmLocationPicker
						latitude={currentLatitude}
						longitude={currentLongitude}
						onChange={({ latitude, longitude }) =>
							setDraft((previous) => ({ ...previous, latitude, longitude }))
						}
					/>
					<p className="text-sm text-muted-foreground">
						Selected coordinates: {coordinatesPreview}
					</p>
				</CardContent>
			</Card>

			<div className="flex items-center gap-2">
				<Button
					onClick={() => void handleSave()}
					disabled={!hasChanges || updateFarmMutation.isPending || !isOwner}
				>
					{updateFarmMutation.isPending ? "Saving..." : "Save Farm Settings"}
				</Button>
				<Button
					variant="outline"
					disabled={!hasChanges || updateFarmMutation.isPending}
					onClick={() => setDraft({})}
				>
					Discard changes
				</Button>
			</div>
		</div>
	);
};
