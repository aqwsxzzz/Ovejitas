import { useState } from "react";
import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ApiRequestError } from "@/lib/axios/axios-helper";

interface ReportPdfButtonProps {
	/** Fetches the PDF blob on demand (on click, not on render). */
	fetchPdf: () => Promise<Blob>;
	filename: string;
}

function triggerDownload(blob: Blob, filename: string) {
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	link.remove();
	URL.revokeObjectURL(url);
}

export function ReportPdfButton({ fetchPdf, filename }: ReportPdfButtonProps) {
	const [isDownloading, setIsDownloading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const handleDownload = async () => {
		setError(null);
		setIsDownloading(true);
		try {
			triggerDownload(await fetchPdf(), filename);
		} catch (caught) {
			setError(
				caught instanceof ApiRequestError
					? caught.message
					: "No se pudo descargar el PDF.",
			);
		} finally {
			setIsDownloading(false);
		}
	};

	return (
		<div className="flex flex-col items-end gap-1">
			<Button
				type="button"
				variant="outline"
				size="sm"
				disabled={isDownloading}
				onClick={() => void handleDownload()}
			>
				<Download className="mr-2 h-4 w-4" />
				{isDownloading ? "Generando..." : "Descargar PDF"}
			</Button>
			{error ? <p className="text-xs text-destructive">{error}</p> : null}
		</div>
	);
}
