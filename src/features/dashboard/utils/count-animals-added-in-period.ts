import type { IAnimal } from "@/features/animal/types/animal-types";

type AnimalWithCreatedAt = IAnimal & { createdAt?: string };

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const parseAnimalAddedDate = (animal: IAnimal): Date | null => {
	const candidateDate =
		(animal as AnimalWithCreatedAt).createdAt ?? animal.acquisitionDate;

	if (!candidateDate) {
		return null;
	}

	const parsedDate = new Date(candidateDate);
	return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
};

export const countAnimalsAddedInPastDays = (
	animals: IAnimal[],
	days: number,
	now: Date = new Date(),
): number => {
	const periodStart = now.getTime() - days * DAY_IN_MS;

	return animals.reduce((count, animal) => {
		const addedDate = parseAnimalAddedDate(animal);

		if (!addedDate) {
			return count;
		}

		const addedTimestamp = addedDate.getTime();
		const isInPeriod =
			addedTimestamp >= periodStart && addedTimestamp <= now.getTime();

		return isInPeriod ? count + 1 : count;
	}, 0);
};
