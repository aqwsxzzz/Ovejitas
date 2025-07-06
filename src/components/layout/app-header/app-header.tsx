import { DropdownHeaderMenu } from "@/components/layout/app-header/components/dropdown-header-menu";
import { HeaderNotifications } from "@/components/layout/app-header/components/header-notifications";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { IUser } from "@/features/auth/types/auth-types";

export const AppHeader = ({ userData }: { userData: IUser }) => {
    return (
        <div className="bg-primary h-16 flex items-center justify-between px-4 w-screen">
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
                <HeaderNotifications />
                <DropdownHeaderMenu />
            </div>
        </div>
    );
};
