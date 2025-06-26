import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuPortal, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Link } from "@tanstack/react-router";
import { Menu } from "lucide-react";
import { useParams } from "@tanstack/react-router";

export const DropdownHeaderMenu = () => {
    const { farmId } = useParams({ strict: false });
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant={"ghost"} className="">
                    <Menu />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-48">
                <DropdownMenuLabel>The menu!</DropdownMenuLabel>
                <DropdownMenuGroup>
                    <Link to="/farm/$farmId/dashboard" params={{ farmId: farmId! }}>
                        <DropdownMenuItem>
                            Dashboard
                            <DropdownMenuShortcut>D</DropdownMenuShortcut>
                        </DropdownMenuItem>
                    </Link>
                    <Link to="/farm/$farmId/animals" params={{ farmId: farmId! }}>
                        <DropdownMenuItem>
                            Animals
                            <DropdownMenuShortcut>A</DropdownMenuShortcut>
                        </DropdownMenuItem>
                    </Link>
                    <DropdownMenuItem>
                        Farms
                        <DropdownMenuShortcut>F</DropdownMenuShortcut>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger>Invite</DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                            <DropdownMenuSubContent>
                                <DropdownMenuItem>Email</DropdownMenuItem>
                                <DropdownMenuItem>Message</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>More coming soon!</DropdownMenuItem>
                            </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                    </DropdownMenuSub>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
