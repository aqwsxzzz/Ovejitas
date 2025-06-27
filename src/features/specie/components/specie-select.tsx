import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuthStore } from "@/features/auth/store/auth-store";
import { useGetSpecies } from "@/features/specie/api/specie.queries";

export const SpecieSelect = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => {
    const { userData } = useAuthStore();
    const { data: speciesData } = useGetSpecies(userData!.language);

    return (
        <Select onValueChange={onChange} value={value}>
            <SelectTrigger>
                <SelectValue placeholder="Select a specie.." />
            </SelectTrigger>
            <SelectContent>
                {speciesData?.map((specie) => (
                    <SelectItem key={specie.id} value={specie.id}>
                        {specie.translation.name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
};
