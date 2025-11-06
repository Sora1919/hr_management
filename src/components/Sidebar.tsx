import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import {
  Book,
  CircleDollarSign,
  ClipboardList,
  CreditCard,
  DollarSign,
  Folder,
  LayoutDashboard,
  List,
  Newspaper,
  Settings,
  User,
  User2,
  Users,
  Users2,
} from "lucide-react";
import Link from "next/link";
import ThemeToggler from "./ThemeToggler";

const Sidebar = () => {
  return (
    <Command className="bg-secondary rounded-none">
      <CommandInput placeholder="Type a command or search..." />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>
        <CommandGroup heading="Suggestions">
          <CommandItem>
            <LayoutDashboard className="mr-2 h-4 w-4" />
            <Link href={"/"}>Dashboard</Link>
          </CommandItem>
          <CommandItem>
            <Users className="mr-2 h-4 w-4" />
            <Link href={"/users"}>Users</Link>
          </CommandItem>
          <CommandItem>
            <User className="mr-2 h-4 w-4" />
            <Link href={"/profile"}>Profile</Link>
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
        </CommandGroup>
      </CommandList>
    </Command>
  );
};

export default Sidebar;
