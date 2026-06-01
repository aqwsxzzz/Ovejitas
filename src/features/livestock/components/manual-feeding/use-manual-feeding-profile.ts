import { useCallback, useState } from "react";

import {
	clearStoredProfile,
	getProfileMapFromStorage,
	setProfileMapToStorage,
} from "./storage";
import type { ManualFeedingFormState } from "./types";
import { validateProfileInputsForSave } from "./validation";

function getDefaultFormState(): ManualFeedingFormState {
	return {
		materialAssetId: "",
		quantity: "",
		unit: "kg",
		maxFeedsPerDay: "1",
		minHoursBetweenFeeds: "0",
	};
}

function getFormStateFromStorage(
	profileStorageId: string,
): ManualFeedingFormState {
	const profileMap = getProfileMapFromStorage();
	const profile = profileMap[profileStorageId];
	if (!profile) return getDefaultFormState();

	return {
		materialAssetId: String(profile.materialAssetId),
		quantity: String(profile.quantity),
		unit: profile.unit,
		maxFeedsPerDay: String(
			Number.isFinite(profile.maxFeedsPerDay) && profile.maxFeedsPerDay >= 1
				? profile.maxFeedsPerDay
				: 1,
		),
		minHoursBetweenFeeds: String(
			Number.isFinite(profile.minHoursBetweenFeeds) &&
				profile.minHoursBetweenFeeds >= 0
				? profile.minHoursBetweenFeeds
				: 0,
		),
	};
}

export function useManualFeedingProfile(
	farmId: string,
	profileStorageId: string,
) {
	const [formsByProfile, setFormsByProfile] = useState<
		Record<string, ManualFeedingFormState>
	>(() => ({
		[profileStorageId]: getFormStateFromStorage(profileStorageId),
	}));
	const [saveErrorsByProfile, setSaveErrorsByProfile] = useState<
		Record<string, string | null>
	>({});

	const form =
		formsByProfile[profileStorageId] ??
		getFormStateFromStorage(profileStorageId);
	const saveError = saveErrorsByProfile[profileStorageId] ?? null;

	const updateField = useCallback(
		<K extends keyof ManualFeedingFormState>(
			field: K,
			value: ManualFeedingFormState[K],
		) => {
			setFormsByProfile((current) => ({
				...current,
				[profileStorageId]: {
					...(current[profileStorageId] ?? form),
					[field]: value,
				},
			}));
			setSaveErrorsByProfile((current) => ({
				...current,
				[profileStorageId]: null,
			}));
		},
		[profileStorageId, form],
	);

	const saveProfile = useCallback(() => {
		if (!farmId) return false;

		const validated = validateProfileInputsForSave(form);
		if (!validated.ok) {
			setSaveErrorsByProfile((current) => ({
				...current,
				[profileStorageId]: validated.error,
			}));
			return false;
		}

		const currentMap = getProfileMapFromStorage();
		setProfileMapToStorage({
			...currentMap,
			[profileStorageId]: {
				materialAssetId: validated.data.materialAssetId,
				quantity: validated.data.quantity,
				unit: form.unit,
				maxFeedsPerDay: Math.max(1, Math.floor(validated.data.maxFeedsPerDay)),
				minHoursBetweenFeeds: validated.data.minHoursBetweenFeeds,
			},
		});
		setSaveErrorsByProfile((current) => ({
			...current,
			[profileStorageId]: null,
		}));
		return true;
	}, [farmId, form, profileStorageId]);

	const clearProfile = useCallback(() => {
		clearStoredProfile(profileStorageId);
		setFormsByProfile((current) => ({
			...current,
			[profileStorageId]: getDefaultFormState(),
		}));
		setSaveErrorsByProfile((current) => ({
			...current,
			[profileStorageId]: null,
		}));
	}, [profileStorageId]);

	return {
		form,
		saveError,
		updateField,
		saveProfile,
		clearProfile,
	};
}
