import { useMemo, useState } from "react";
import { Check, ChevronsUpDown, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";

export interface ComboboxOption {
	value: string;
	label: string;
	/** Extra text to match against when searching (not displayed). */
	keywords?: string;
}

interface ComboboxProps {
	options: ComboboxOption[];
	value: string | undefined;
	onChange: (value: string) => void;
	placeholder?: string;
	searchPlaceholder?: string;
	emptyText?: string;
	disabled?: boolean;
	/** When set, a sticky highlighted create action is pinned below the scrolling list. */
	createLabel?: string;
	onCreateSelect?: () => void;
	/** Cap rendered results for very long lists (e.g. timezones). */
	maxResults?: number;
}

/**
 * Searchable single-select with an optional sticky "create new" footer. The list
 * scrolls; the create action stays pinned and visible. Used for entity pickers
 * (currency, product, category, timezone) where a plain Select falls short.
 */
export function Combobox({
	options,
	value,
	onChange,
	placeholder = "Selecciona",
	searchPlaceholder = "Buscar…",
	emptyText = "Sin resultados.",
	disabled,
	createLabel,
	onCreateSelect,
	maxResults = 200,
}: ComboboxProps) {
	const [open, setOpen] = useState(false);
	const [query, setQuery] = useState("");

	const selected = options.find((option) => option.value === value);

	const results = useMemo(() => {
		const needle = query.trim().toLowerCase();
		const matches = needle
			? options.filter((option) =>
					`${option.label} ${option.keywords ?? ""}`
						.toLowerCase()
						.includes(needle),
				)
			: options;
		return matches.slice(0, maxResults);
	}, [options, query, maxResults]);

	const setOpenState = (next: boolean) => {
		setOpen(next);
		if (!next) setQuery("");
	};

	const handleSelect = (next: string) => {
		onChange(next);
		setOpenState(false);
	};

	const handleCreate = () => {
		setOpenState(false);
		onCreateSelect?.();
	};

	return (
		<Popover open={open} onOpenChange={setOpenState}>
			<PopoverTrigger asChild>
				<Button
					type="button"
					variant="outline"
					disabled={disabled}
					aria-expanded={open}
					className="w-full justify-between font-normal"
				>
					<span className={selected ? "" : "text-(--v2-ink-soft)"}>
						{selected ? selected.label : placeholder}
					</span>
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-60" />
				</Button>
			</PopoverTrigger>
			<PopoverContent
				align="start"
				className="w-(--radix-popover-trigger-width) p-0"
			>
				<div className="border-b border-(--v2-border) p-2">
					<Input
						autoFocus
						value={query}
						onChange={(event) => setQuery(event.target.value)}
						placeholder={searchPlaceholder}
					/>
				</div>
				<div className="max-h-60 overflow-y-auto p-1">
					{results.length === 0 ? (
						<p className="px-2 py-3 text-sm text-(--v2-ink-soft)">{emptyText}</p>
					) : (
						results.map((option) => (
							<Button
								key={option.value}
								type="button"
								variant="ghost"
								onClick={() => handleSelect(option.value)}
								className="h-auto w-full justify-between px-2 py-1.5 text-left text-sm font-normal"
							>
								<span>{option.label}</span>
								{option.value === value ? (
									<Check className="h-4 w-4" />
								) : null}
							</Button>
						))
					)}
				</div>
				{createLabel && onCreateSelect ? (
					<div className="border-t border-(--v2-border) p-1">
						<Button
							type="button"
							variant="ghost"
							onClick={handleCreate}
							className="h-auto w-full justify-start gap-1.5 px-2 py-1.5 text-sm font-medium text-primary"
						>
							<Plus className="h-4 w-4" />
							{createLabel}
						</Button>
					</div>
				) : null}
			</PopoverContent>
		</Popover>
	);
}
