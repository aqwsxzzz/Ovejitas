export function formatRemainingDuration(totalHours: number): string {
	const totalMinutes = Math.max(0, Math.ceil(totalHours * 60));
	const hours = Math.floor(totalMinutes / 60);
	const minutes = totalMinutes % 60;

	if (hours === 0) return `${minutes} min`;
	if (minutes === 0) return `${hours} h`;
	return `${hours} h ${minutes} min`;
}

export function formatNextDayHint(reference: Date): string {
	const next = new Date(reference);
	next.setDate(next.getDate() + 1);
	next.setHours(0, 0, 0, 0);

	const dateLabel = next.toLocaleDateString("es-EC", {
		day: "2-digit",
		month: "2-digit",
	});
	const timeLabel = next.toLocaleTimeString("es-EC", {
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
	});

	return `${dateLabel} ${timeLabel}`;
}
