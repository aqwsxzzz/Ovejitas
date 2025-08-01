import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { DateSelector } from "@/components/common/DateSelector";
import { useCreateAnimal } from "@/features/animal/api/animal-queries";
import type { IAnimal } from "@/features/animal/types/animal-types";
import { useParams } from "@tanstack/react-router";
import { SpecieSelect } from "@/features/specie/components/specie-select";
import { BreedSelect } from "@/features/breed/components/breed-select";
import { ParentsByGenderSelect } from "@/features/animal/components/parents-by-gender-select/parents-by-gender-select";

const formSchema = z.object({
	specieId: z.string(),
	breedId: z.string(),
	name: z.string(),
	tagNumber: z.string(),
	sex: z.enum(["female", "male", "unknown"] as [
		IAnimal["sex"],
		IAnimal["sex"],
		IAnimal["sex"],
	]),
	birthDate: z.date(),
	status: z.enum(["alive", "deceased", "sold"] as [
		IAnimal["status"],
		IAnimal["status"],
		IAnimal["status"],
	]),
	reproductiveStatus: z.enum(["open", "pregnant", "lactating", "other"] as [
		IAnimal["reproductiveStatus"],
		IAnimal["reproductiveStatus"],
		IAnimal["reproductiveStatus"],
		IAnimal["reproductiveStatus"],
	]),
	fatherId: z.string().optional(),
	motherId: z.string().optional(),
	acquisitionType: z.enum(["born", "purchased", "other"] as [
		IAnimal["acquisitionType"],
		IAnimal["acquisitionType"],
		IAnimal["acquisitionType"],
	]),
	acquisitionDate: z.date(),
});

export const NewAnimalForm = ({ closeDialog }: { closeDialog: () => void }) => {
	const { mutateAsync: createAnimal, isPending } = useCreateAnimal();
	const { farmId } = useParams({ strict: false });

	const onSubmit = async (data: z.infer<typeof formSchema>) => {
		// Format birthDate as YYYY-MM-DD
		const formatDate = (date: Date) => {
			const year = date.getFullYear();
			const month = String(date.getMonth() + 1).padStart(2, "0");
			const day = String(date.getDate()).padStart(2, "0");
			return `${year}-${month}-${day}`;
		};
		const response = await createAnimal({
			payload: {
				speciesId: data.specieId,
				breedId: data.breedId,
				name: data.name,
				tagNumber: data.tagNumber,
				sex: data.sex,
				birthDate: formatDate(data.birthDate),
				status: data.status,
				reproductiveStatus: data.reproductiveStatus,
				fatherId: data.fatherId ?? null,
				motherId: data.motherId ?? null,
				acquisitionType: data.acquisitionType,
				acquisitionDate: formatDate(data.acquisitionDate),
			},
			farmId: farmId!,
		});
		if (response.status === "success") {
			closeDialog();
		}
	};
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			specieId: "",
			breedId: "",
		},
	});

	const selectedSpecieId = form.watch("specieId");

	return (
		<Form {...form}>
			<form
				className="flex flex-col gap-2"
				onSubmit={form.handleSubmit(onSubmit)}
			>
				<Tabs
					defaultValue="basic"
					className="w-full"
				>
					<TabsList className="grid w-full grid-cols-2">
						<TabsTrigger value="basic">Basic Info</TabsTrigger>
						<TabsTrigger value="optional">Optional Info</TabsTrigger>
					</TabsList>
					<TabsContent
						value="basic"
						className="flex flex-col gap-2"
					>
						<FormField
							control={form.control}
							name="specieId"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Specie</FormLabel>
									<FormControl>
										<SpecieSelect
											value={field.value}
											onChange={field.onChange}
										/>
									</FormControl>
								</FormItem>
							)}
						/>
						{selectedSpecieId ? (
							<FormField
								control={form.control}
								name="breedId"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Breed</FormLabel>
										<FormControl>
											<BreedSelect
												value={field.value}
												onChange={field.onChange}
												specieId={selectedSpecieId}
											/>
										</FormControl>
									</FormItem>
								)}
							/>
						) : null}
						<FormField
							control={form.control}
							name="name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Name</FormLabel>
									<FormControl>
										<Input
											placeholder="Enter a name"
											{...field}
										/>
									</FormControl>
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="tagNumber"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Tag Number</FormLabel>
									<FormControl>
										<Input
											placeholder="Enter a tag number"
											{...field}
										/>
									</FormControl>
								</FormItem>
							)}
						/>
					</TabsContent>
					<TabsContent
						value="optional"
						className="flex flex-col gap-2"
					>
						<FormField
							control={form.control}
							name="sex"
							render={({ field }) => (
								<FormItem>
									<Label>Gender</Label>
									<RadioGroup
										onValueChange={field.onChange}
										defaultValue={field.value}
										className="flex"
									>
										<div className="flex gap-1">
											<RadioGroupItem
												value="male"
												id="male"
											/>
											<Label htmlFor="male">Male</Label>
										</div>
										<div className="flex gap-1">
											<RadioGroupItem
												value="female"
												id="female"
											/>
											<Label htmlFor="female">Female</Label>
										</div>
										<div className="flex gap-1">
											<RadioGroupItem
												value="unknown"
												id="unkown"
											/>
											<Label htmlFor="unknown">Unknown</Label>
										</div>
									</RadioGroup>
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="birthDate"
							render={({ field }) => (
								<FormItem className="space-y-2">
									<div className="flex items-center gap-2">
										<FormLabel className="shrink-0">
											Select a birth date
										</FormLabel>
										<div className="border-t border-primary/50 w-full" />
									</div>
									<FormControl>
										<DateSelector
											date={field.value ?? undefined}
											setDate={field.onChange}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="status"
							render={({ field }) => (
								<FormItem>
									<Label>Status</Label>
									<RadioGroup
										onValueChange={field.onChange}
										defaultValue={field.value}
										className="flex"
									>
										<div className="flex gap-1">
											<RadioGroupItem
												value="alive"
												id="alive"
											/>
											<Label htmlFor="alive">Alive</Label>
										</div>
										<div className="flex gap-1">
											<RadioGroupItem
												value="sold"
												id="sold"
											/>
											<Label htmlFor="sold">Sold</Label>
										</div>
										<div className="flex gap-1">
											<RadioGroupItem
												value="deceased"
												id="deceased"
											/>
											<Label htmlFor="deceased">Deceased</Label>
										</div>
									</RadioGroup>
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="reproductiveStatus"
							render={({ field }) => (
								<FormItem>
									<Label>Reproductive Status</Label>
									<RadioGroup
										onValueChange={field.onChange}
										defaultValue={field.value}
										className="flex"
									>
										<div className="flex gap-1">
											<RadioGroupItem
												value="open"
												id="open"
											/>
											<Label htmlFor="open">Open</Label>
										</div>
										<div className="flex gap-1">
											<RadioGroupItem
												value="pregnant"
												id="pregnant"
											/>
											<Label htmlFor="pregnant">Pregnant</Label>
										</div>
										<div className="flex gap-1">
											<RadioGroupItem
												value="lactating"
												id="lactating"
											/>
											<Label htmlFor="lactating">Lactating</Label>
										</div>
										<div className="flex gap-1">
											<RadioGroupItem
												value="other"
												id="other"
											/>
											<Label htmlFor="other">Other</Label>
										</div>
									</RadioGroup>
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="fatherId"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Father</FormLabel>
									<FormControl>
										<ParentsByGenderSelect
											value={field.value}
											onChange={field.onChange}
											farmId={farmId!}
											sex="male"
											include=""
											withLanguage={true}
										/>
									</FormControl>
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="motherId"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Mother</FormLabel>
									<FormControl>
										<ParentsByGenderSelect
											value={field.value}
											onChange={field.onChange}
											farmId={farmId!}
											sex="female"
											include=""
											withLanguage={true}
										/>
									</FormControl>
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="acquisitionType"
							render={({ field }) => (
								<FormItem>
									<Label>Acquisition Type</Label>
									<RadioGroup
										onValueChange={field.onChange}
										defaultValue={field.value}
										className="flex"
									>
										<div className="flex gap-1">
											<RadioGroupItem
												value="born"
												id="born"
											/>
											<Label htmlFor="born">Born</Label>
										</div>
										<div className="flex gap-1">
											<RadioGroupItem
												value="purchased"
												id="purchased"
											/>
											<Label htmlFor="purchased">Purchased</Label>
										</div>
										<div className="flex gap-1">
											<RadioGroupItem
												value="other"
												id="other"
											/>
											<Label htmlFor="other">Other</Label>
										</div>
									</RadioGroup>
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="acquisitionDate"
							render={({ field }) => (
								<FormItem className="space-y-2">
									<div className="flex items-center gap-2">
										<FormLabel className="shrink-0">
											Select an acquisition date
										</FormLabel>
										<div className="border-t border-primary/50 w-full" />
									</div>
									<FormControl>
										<DateSelector
											date={field.value ?? undefined}
											setDate={field.onChange}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</TabsContent>
				</Tabs>
				<div className="flex justify-around">
					<Button
						disabled={isPending}
						type="submit"
					>
						Create
					</Button>
					<Button
						onClick={closeDialog}
						className="bg-destructive"
					>
						Cancel
					</Button>
				</div>
			</form>
		</Form>
	);
};
