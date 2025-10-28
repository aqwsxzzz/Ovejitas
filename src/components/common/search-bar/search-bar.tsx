import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
	value: string;
	onChange: (value: string) => void;
	placeholder?: string;
	className?: string;
}

export const SearchBar = ({
	value,
	onChange,
	placeholder = "Search...",
	className,
}: SearchBarProps) => {
	return (
		<div className={cn("relative w-full", className)}>
			<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
			<Input
				type="text"
				placeholder={placeholder}
				value={value}
				onChange={(e) => onChange(e.target.value)}
				className="pl-10 h-10 rounded-lg"
			/>
		</div>
	);
};
