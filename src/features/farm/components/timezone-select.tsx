import { useMemo } from "react";

import { Combobox } from "@/components/ui/combobox";
import { TIMEZONE_OPTIONS } from "@/features/farm/constants/timezone-options";

interface TimezoneSelectProps {
	value: string;
	onChange: (value: string) => void;
	disabled?: boolean;
}

/** Searchable timezone picker — the full IANA list is too long for a plain Select. */
export function TimezoneSelect({
	value,
	onChange,
	disabled,
}: TimezoneSelectProps) {
	const options = useMemo(
		() => TIMEZONE_OPTIONS.map((tz) => ({ value: tz, label: tz })),
		[],
	);

	return (
		<Combobox
			options={options}
			value={value || undefined}
			onChange={onChange}
			disabled={disabled}
			placeholder="Selecciona una zona horaria"
			searchPlaceholder="Buscar (ej. Montevideo)"
		/>
	);
}
