import { Input } from "@/components/ui/input";

interface LivestockAssetSearchBarProps {
	value: string;
	onChange: (value: string) => void;
	placeholder: string;
	ariaLabel: string;
}

export function LivestockAssetSearchBar({
	value,
	onChange,
	placeholder,
	ariaLabel,
}: LivestockAssetSearchBarProps) {
	return (
		<div className="flex items-center gap-2 rounded-xl border border-dashed border-[color:var(--v2-border)] bg-white px-3 py-2.5">
			<span
				className="text-base"
				aria-hidden="true"
			>
				🔍
			</span>
			<Input
				type="search"
				value={value}
				onChange={(event) => onChange(event.target.value)}
				placeholder={placeholder}
				className="h-auto flex-1 border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
				aria-label={ariaLabel}
			/>
		</div>
	);
}
