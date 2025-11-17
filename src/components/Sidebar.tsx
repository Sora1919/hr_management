import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  CircleDollarSign,
  ClipboardList,
  LayoutDashboard,
  Users,
} from "lucide-react";
import Link from "next/link";
import ThemeToggler from "./ThemeToggler";
import Logout from "./auth/Logout";

const Sidebar = () => {
  return (
    <Command className="bg-secondary rounded-none">
      <CommandInput placeholder="Type a command or search..." />
      <CommandList className="min-h-100">
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <Link href={"/"}>Dashboard</Link>
          </CommandItem>
          <CommandItem>
            <Users className="mr-2 h-4 w-4" />
            <Link href={"/employee"}>Employees</Link>
          </CommandItem>
          <CommandItem>
            <ClipboardList className="mr-2 h-4 w-4" />
            <Link href={"/attendance"}>Attendance</Link>
          </CommandItem>
          <CommandItem>
            <CircleDollarSign className="mr-2 h-4 w-4" />
            <Link href={"/salary"}>Salary</Link>
          </CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Settings">
          <ThemeToggler />
          <Logout />
        </CommandGroup>
      </CommandList>
    </Command>
  );
};

export default Sidebar;
