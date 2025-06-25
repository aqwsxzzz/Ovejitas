import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { IAnimal } from "@/features/animal/types/animal-types";

interface AnimalCardProps {
    animal: IAnimal;
}

export const AnimalCard = ({ animal }: AnimalCardProps) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle>{animal.name}</CardTitle>
                <CardDescription>{animal.status}</CardDescription>
            </CardHeader>
            <CardContent>
                <p>Animal</p>
            </CardContent>
            <CardFooter>
                <CardAction>Animal</CardAction>
            </CardFooter>
        </Card>
    );
};
