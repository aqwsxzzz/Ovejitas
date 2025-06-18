import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { IUser } from "@/features/auth/types/auth-types";
import { Menu } from "lucide-react";

export const AppHeader = ({ userData }: { userData: IUser }) => {
    return (
        <div className="bg-muted h-16 flex items-center justify-between px-4">
            <div className="flex">
                <Avatar className="bg-foreground border-2">
                    <AvatarImage></AvatarImage>
                    <AvatarFallback>{userData.displayName.slice(0, 1).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col text-foreground">
                    <h1>You are currently in</h1>
                    <h2>The Farm </h2>
                </div>
            </div>
            <div className="flex items-center">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant={"ghost"} className="">
                            <Menu />
                        </Button>
                    </DropdownMenuTrigger>
                </DropdownMenu>
            </div>
        </div>
    );
};
