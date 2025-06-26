import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import dayjs from "dayjs";
import { CalendarIcon } from "lucide-react";
import { useState } from "react";

interface DateSelectorProps {
    date: Date | undefined;
    setDate: (date: Date | undefined) => void;
}

export const DateSelector = ({ date, setDate }: DateSelectorProps) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);

    return (
        <div className="flex items-center space-x-2">
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <Button variant="outline" className={cn("w-[240px] justify-start text-left font-normal bg-background text-muted-foreground", !date && "text-muted-foreground")}>
                        <div className="flex gap-2 items-center text-muted-foreground">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? dayjs(date).format("YYYY - MM - DD") : "Select a date"}
                        </div>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-background border-gray-700">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={(e) => {
                            setDate(e);
                            setIsOpen(false);
                        }}
                        autoFocus
                        className="bg-gray-900 text-muted-foreground"
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
};
