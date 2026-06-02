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
			<input
				type="search"
				value={value}
				onChange={(event) => onChange(event.target.value)}
				placeholder={placeholder}
				className="flex-1 bg-transparent text-sm outline-none placeholder:text-[color:var(--v2-ink-soft)]"
				aria-label={ariaLabel}
			/>
		</div>
	);
}
