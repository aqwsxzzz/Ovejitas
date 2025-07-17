import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";

export const AddNewMeasurementModal = () => {
	return (
		<Dialog>
			<DialogTrigger asChild>
				<Button>
					<Plus />
				</Button>
			</DialogTrigger>
		</Dialog>
	);
};
