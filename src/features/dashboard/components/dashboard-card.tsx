import { Card, CardContent } from "@/components/ui/card";
import type { ReactNode } from "react";

interface CardProps {
    icon: ReactNode;
    title: string;
    value: string;
}

export const DashboardCard = ({ cardProps }: { cardProps: CardProps }) => {
    return (
        <Card>
            <CardContent className="flex items-center md:gap-4 gap-2">
                {cardProps.icon}
                <div>
                    <p>{cardProps.value}</p>
                    <p>{cardProps.title}</p>
                </div>
            </CardContent>
        </Card>
    );
};
