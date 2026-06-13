import { useState } from "react";
import type { FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useCreateIndividual } from "@/features/livestock/api/livestock-queries";
import type { IndividualSex } from "@/features/livestock/types/livestock-types";

import { LogActionCard } from "./log-action-card";

interface LogCreateIndividualActionProps {
	farmId: string;
	unitId: string | null;
	onDone: () => void;
}

export function LogCreateIndividualAction({
	farmId,
	unitId,
	onDone,
}: LogCreateIndividualActionProps) {
	const [name, setName] = useState("");
	const [tag, setTag] = useState("");
	const [sex, setSex] = useState<IndividualSex>("unknown");
	const createIndividual = useCreateIndividual();

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!unitId || !tag.trim()) return;
		await createIndividual.mutateAsync({
			farmId,
			assetId: unitId,
			data: {
				name: name.trim() || tag.trim(),
				tag: tag.trim(),
				extra: { sex },
			},
		});
		onDone();
	};

	return (
		<LogActionCard
			title="Crear individual"
			subtitle="Solo creacion. Editar y eliminar se hace en la vista del lote."
		>
			{!unitId ? (
				<p className="text-sm text-(--v2-ink-soft)">
					Abre Acciones rapidas desde un lote para crear un individuo.
				</p>
			) : (
				<form
					className="space-y-3"
					onSubmit={(event) => void handleSubmit(event)}
				>
					<div className="space-y-1.5">
						<Label htmlFor="individual-name">Nombre</Label>
						<Input
							id="individual-name"
							value={name}
							onChange={(event) => setName(event.target.value)}
						/>
					</div>
					<div className="space-y-1.5">
						<Label htmlFor="individual-tag">Identificador</Label>
						<Input
							id="individual-tag"
							value={tag}
							onChange={(event) => setTag(event.target.value)}
						/>
					</div>
					<div className="space-y-1.5">
						<Label htmlFor="individual-sex">Sexo</Label>
						<Select
							value={sex}
							onValueChange={(value) => setSex(value as IndividualSex)}
						>
							<SelectTrigger
								id="individual-sex"
								className="w-full"
							>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="unknown">Desconocido</SelectItem>
								<SelectItem value="female">Hembra</SelectItem>
								<SelectItem value="male">Macho</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<div className="flex justify-end">
						<Button
							type="submit"
							variant="default"
							disabled={createIndividual.isPending}
						>
							{createIndividual.isPending ? "Guardando..." : "Crear individuo"}
						</Button>
					</div>
				</form>
			)}
		</LogActionCard>
	);
}
