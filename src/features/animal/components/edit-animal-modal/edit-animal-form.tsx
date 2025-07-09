import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { DateSelector } from "@/components/common/DateSelector";
import { useEditAnimalById } from "@/features/animal/api/animal-queries";
import type { IAnimal } from "@/features/animal/types/animal-types";
import { useParams } from "@tanstack/react-router";
import { SpecieSelect } from "@/features/specie/components/specie-select";
import { BreedSelect } from "@/features/breed/components/breed-select";

interface EditAnimalFormProps {
    animal: IAnimal;
}

const getDefaultValues = (animal: IAnimal) => {
    return {
        speciesId: animal.species.id,
        breedId: animal.breed.id,
        name: animal.name,
        tagNumber: animal.tagNumber,
        sex: animal.sex,
        birthDate: animal.birthDate ? new Date(animal.birthDate) : undefined,
        weight: animal ? animal.weight.toString() : "",
        status: animal.status,
        reproductiveStatus: animal.reproductiveStatus,
        fatherId: animal.fatherId ?? "",
        motherId: animal.motherId ?? "",
        acquisitionType: animal.acquisitionType,
        acquisitionDate: animal.acquisitionDate ? new Date(animal.acquisitionDate) : undefined,
    };
};

const formSchema = z.object({
    speciesId: z.string(),
    breedId: z.string(),
    name: z.string(),
    tagNumber: z.string(),
    sex: z.enum(["female", "male", "unknown"] as [IAnimal["sex"], IAnimal["sex"], IAnimal["sex"]]),
    birthDate: z.date(),
    weight: z.string(),
    status: z.enum(["alive", "deceased", "sold"] as [IAnimal["status"], IAnimal["status"], IAnimal["status"]]),
    reproductiveStatus: z.enum(["open", "pregnant", "lactating", "other"] as [IAnimal["reproductiveStatus"], IAnimal["reproductiveStatus"], IAnimal["reproductiveStatus"], IAnimal["reproductiveStatus"]]),
    fatherId: z.string(),
    motherId: z.string(),
    acquisitionType: z.enum(["born", "purchased", "other"] as [IAnimal["acquisitionType"], IAnimal["acquisitionType"], IAnimal["acquisitionType"]]),
    acquisitionDate: z.date(),
});

export const EditAnimalForm = ({ animal }: EditAnimalFormProps) => {
    const { mutateAsync: editAnimal, isPending } = useEditAnimalById();
    const { farmId } = useParams({ strict: false });

    const onSubmit = async (data: z.infer<typeof formSchema>) => {
        // Format birthDate as YYYY-MM-DD
        const formatDate = (date: Date) => {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, "0");
            const day = String(date.getDate()).padStart(2, "0");
            return `${year}-${month}-${day}`;
        };
        await editAnimal({
            payload: {
                speciesId: data.speciesId,
                breedId: data.breedId,
                name: data.name,
                tagNumber: data.tagNumber,
                sex: data.sex,
                birthDate: formatDate(data.birthDate),
                weight: parseFloat(data.weight),
                status: data.status,
                reproductiveStatus: data.reproductiveStatus,
                fatherId: data.fatherId || null,
                motherId: data.motherId || null,
                acquisitionType: data.acquisitionType,
                acquisitionDate: formatDate(data.acquisitionDate),
            },
            farmId: farmId!,
            animalId: animal.id,
        });
    };
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: getDefaultValues(animal),
    });

    const selectedSpecieId = form.watch("speciesId");

    return (
        <Form {...form}>
            <form className="flex flex-col gap-2" onSubmit={form.handleSubmit(onSubmit)}>
                <FormField
                    control={form.control}
                    name="speciesId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Specie</FormLabel>
                            <FormControl>
                                <SpecieSelect value={field.value} onChange={field.onChange} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="breedId"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Breed</FormLabel>
                            <FormControl>
                                <BreedSelect value={field.value} onChange={field.onChange} specieId={selectedSpecieId} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter a name" {...field} />
                            </FormControl>
                            <FormMessage />
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
                                <Input placeholder="Enter a tag number" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="sex"
                    render={({ field }) => (
                        <FormItem>
                            <Label>Gender</Label>
                            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex">
                                <div className="flex gap-1">
                                    <RadioGroupItem value="male" id="male" />
                                    <Label htmlFor="male">Male</Label>
                                </div>
                                <div className="flex gap-1">
                                    <RadioGroupItem value="female" id="female" />
                                    <Label htmlFor="female">Female</Label>
                                </div>
                                <div className="flex gap-1">
                                    <RadioGroupItem value="unknown" id="unkown" />
                                    <Label htmlFor="unknown">Unknown</Label>
                                </div>
                            </RadioGroup>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="birthDate"
                    render={({ field }) => (
                        <FormItem className="space-y-2">
                            <div className="flex items-center gap-2">
                                <FormLabel className="shrink-0">Select a creation date</FormLabel>
                                <div className="border-t border-primary/50 w-full" />
                            </div>
                            <FormControl>
                                <DateSelector date={field.value ?? undefined} setDate={field.onChange} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="weight"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Weight</FormLabel>
                            <FormControl>
                                <Input placeholder="Enter the animal's weight" {...field} />
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
                            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex">
                                <div className="flex gap-1">
                                    <RadioGroupItem value="alive" id="alive" />
                                    <Label htmlFor="alive">Alive</Label>
                                </div>
                                <div className="flex gap-1">
                                    <RadioGroupItem value="sold" id="sold" />
                                    <Label htmlFor="sold">Sold</Label>
                                </div>
                                <div className="flex gap-1">
                                    <RadioGroupItem value="deceased" id="deceased" />
                                    <Label htmlFor="deceased">Deceased</Label>
                                </div>
                            </RadioGroup>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="reproductiveStatus"
                    render={({ field }) => (
                        <FormItem>
                            <Label>Reproductive Status</Label>
                            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex">
                                <div className="flex gap-1">
                                    <RadioGroupItem value="open" id="open" />
                                    <Label htmlFor="open">Open</Label>
                                </div>
                                <div className="flex gap-1">
                                    <RadioGroupItem value="pregnant" id="pregnant" />
                                    <Label htmlFor="pregnant">Pregnant</Label>
                                </div>
                                <div className="flex gap-1">
                                    <RadioGroupItem value="lactating" id="lactating" />
                                    <Label htmlFor="lactating">Lactating</Label>
                                </div>
                                <div className="flex gap-1">
                                    <RadioGroupItem value="other" id="other" />
                                    <Label htmlFor="other">Other</Label>
                                </div>
                            </RadioGroup>
                            <FormMessage />
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
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a father.." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="7ZWDkbpO">Pepito</SelectItem>
                                        <SelectItem value="3">Rodolfo</SelectItem>
                                        <SelectItem value="2">Chuchumeco</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage />
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
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select a mother.." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="AdWNDqgV">Pepita</SelectItem>
                                        <SelectItem value="NArJeWyE">Rodolfa</SelectItem>
                                        <SelectItem value="Jlq1nbR6">Chuchumeca</SelectItem>
                                    </SelectContent>
                                </Select>
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="acquisitionType"
                    render={({ field }) => (
                        <FormItem>
                            <Label>Acquisition Type</Label>
                            <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="flex">
                                <div className="flex gap-1">
                                    <RadioGroupItem value="born" id="born" />
                                    <Label htmlFor="born">Born</Label>
                                </div>
                                <div className="flex gap-1">
                                    <RadioGroupItem value="purchased" id="purchased" />
                                    <Label htmlFor="purchased">Purchased</Label>
                                </div>
                                <div className="flex gap-1">
                                    <RadioGroupItem value="other" id="other" />
                                    <Label htmlFor="other">Other</Label>
                                </div>
                            </RadioGroup>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="acquisitionDate"
                    render={({ field }) => (
                        <FormItem className="space-y-2">
                            <div className="flex items-center gap-2">
                                <FormLabel className="shrink-0">Select an acquisition date</FormLabel>
                                <div className="border-t border-primary/50 w-full" />
                            </div>
                            <FormControl>
                                <DateSelector date={field.value ?? undefined} setDate={field.onChange} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <div className="flex justify-around" onClick={(e) => e.stopPropagation()}>
                    <Button disabled={isPending} type="submit">
                        Edit
                    </Button>
                    <Button type="button" className="bg-destructive">
                        Cancel
                    </Button>
                </div>
            </form>
        </Form>
    );
};
