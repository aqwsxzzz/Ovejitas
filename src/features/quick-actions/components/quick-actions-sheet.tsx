import { useNavigate } from "@tanstack/react-router";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
	getQuickActionSheetConfig,
	type QuickActionItem,
} from "@/features/quick-actions/quick-action-registry";

interface QuickActionsSheetProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	pathname: string;
}

function ActionCard(props: {
	action: QuickActionItem;
	onSelect: (action: QuickActionItem) => void;
}) {
	return (
		<button
			type="button"
			onClick={() => props.onSelect(props.action)}
			className="flex items-center justify-center gap-2 rounded-xl border border-[color:var(--v2-border)] bg-white px-3 py-2 text-center transition hover:-translate-y-px"
		>
			<span
				className="text-lg"
				aria-hidden="true"
			>
				{props.action.emoji}
			</span>
			<span className="text-xs font-semibold leading-tight text-[#1f211d]">
				{props.action.label}
			</span>
		</button>
	);
}

export function QuickActionsSheet({
	open,
	onOpenChange,
	pathname,
}: QuickActionsSheetProps) {
	const navigate = useNavigate();
	const config = getQuickActionSheetConfig(pathname);

	function handleSelect(action: QuickActionItem) {
		onOpenChange(false);
		void navigate({
			to: "/v2/log",
			search: {
				actionId: action.id,
				actionLabel: action.label,
				contextLabel: config.contextLabel,
				sourcePath: pathname,
			},
		});
	}

	return (
		<Dialog
			open={open}
			onOpenChange={onOpenChange}
		>
			<DialogContent
				showCloseButton={false}
				className="top-auto bottom-[4.35rem] left-0 right-0 z-[60] max-h-[38vh] w-full max-w-none translate-x-0 translate-y-0 overflow-y-auto rounded-t-2xl rounded-b-none border-x-0 border-t border-b-0 border-[#1f211d] bg-[#f3ebdc] p-3 shadow-none"
			>
				<div className="mx-auto mb-2 h-1 w-9 rounded-full bg-black/15" />
				<div className="mx-auto grid w-full grid-cols-2 gap-2 sm:grid-cols-3">
					{config.actions.map((action) => (
						<ActionCard
							key={action.id}
							action={action}
							onSelect={handleSelect}
						/>
					))}
				</div>
			</DialogContent>
		</Dialog>
	);
}
