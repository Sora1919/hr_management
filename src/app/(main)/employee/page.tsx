"use client";
import { api } from "@/api/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { FilePenLine, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

//validation form with zod
const formSchema = z.object({
  department: z.string().min(1, {
    message: "Department is required",
  }),
  position: z.string().min(1, {
    message: "Position is required",
  }),
});

//interface for Employee for type checking
interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  role: string;
  isActive: boolean;
}
const PAGE_LIMIT = 5;
interface EmployeePageProps {
  page?: string;
  search?: string;
}
export default function EmployeePage({ page, search }: EmployeePageProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [params, setParams] = useState<{ id: string } | null>(null);
  const [editEmployee, setEditEmployee] = useState(false);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(Number(page) || 1);
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState(search || "");
  const router = useRouter();
  const totalPages = useMemo(() => {
    return Math.ceil(totalCount / PAGE_LIMIT);
  }, [totalCount]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      department: "",
      position: "",
    },
  });

  const handleEdit = async (data: z.infer<typeof formSchema>) => {
    if (!params?.id) return;
    setEditEmployee(true);
    try {
      const payload = {
        department: data.department,
        position: data.position,
      };
      const response = await api.put(
        `/api/employee/v1/updateEmployee/${params.id}`,
        payload
      );
      if (response.status === 200) {
        toast.success("Employee updated successfully");
        setTimeout(() => {
          setEditEmployee(false);
          getEmployeeList(currentPage, searchTerm);
        }, 1000);
      }

      // toast.success("Employee updated successfully")
    } catch (e: any) {
      toast.error(e.response.data.message);
    }
  };

  const getEmployeeList = async (page: number, search?: string) => {
    setLoading(true);
    try {
      const response = await api.get("api/employee/v1/getAllEmployee", {
        params: { page: page, limit: PAGE_LIMIT, search: search || "" },
      });
      if (response.status === 200) {
        // Handle different response structures
        const employeesData = response.data.data;
        setEmployees(employeesData);
        setTotalCount(response.data.totalCount);
      }
    } catch (error) {
      toast.error("Failed to fetch employees");
    } finally {
      setLoading(false);
    }
  };
  // Update URL with search params
  const updateUrlParams = (page: number, search: string) => {
    const params = new URLSearchParams();
    if (page > 1) params.set("page", page.toString());
    if (search) params.set("search", search);

    const queryString = params.toString();
    const newUrl = queryString ? `/employee?${queryString}` : "/employee";

    // Replace the current URL without triggering a navigation
    window.history.replaceState(null, "", newUrl);
  };

  //page change effect
  useEffect(() => {
    updateUrlParams(currentPage, searchTerm);
    getEmployeeList(currentPage, searchTerm);
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  const filterEmployee = useMemo(() => {
    return employees.filter((emp) =>
      emp.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [employees, searchTerm]);

  const pages = useMemo(() => {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }, [totalPages]);

  const handleSearch = () => {
    setCurrentPage(1);
    updateUrlParams(1, searchTerm);
    getEmployeeList(1, searchTerm);
  };

  const handleStatusChange = async (employeeId: string, isActive: boolean) => {
    // Add to updating set to show loading for this specific switch
    setUpdatingIds((prev) => new Set(prev).add(employeeId));

    try {
      const response = await api.put(
        `/api/employee/v1/updateEmployee/${employeeId}`,
        {
          isActive: isActive,
        }
      );
      // console.log("Status update response:", response);

      if (response.status === 200) {
        // Update local state
        setEmployees((prevEmployees) =>
          prevEmployees.map((emp) =>
            emp.id === employeeId ? { ...emp, isActive: isActive } : emp
          )
        );

        // toast.success(
        //   `Employee ${isActive ? "activated" : "deactivated"} successfully`
        // );
      }
    } catch (error: any) {
      // Revert the change in UI on error
      setEmployees((prevEmployees) =>
        prevEmployees.map((emp) =>
          emp.id === employeeId ? { ...emp, isActive: !isActive } : emp
        )
      );

      // toast.error(error.response?.data?.message || "Failed to update status");
    } finally {
      // Remove from updating set
      setUpdatingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(employeeId);
        return newSet;
      });
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold mb-3">Employee Records</h1>
        <div className="flex gap-2 items-center">
          <Input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search..."
            className="mb-4"
            style={{ width: 200 }}
            onKeyUp={(e) => {
              if (e.key === "Enter") {
                handleSearch();
              }
            }}
          />
          <Button className="cursor-pointer mb-4" onClick={handleSearch}>
            <Search size={18} />
          </Button>
        </div>
      </div>
      {loading ? (
        <p>Loading employees...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filterEmployee.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  {searchTerm.trim() !== ""
                    ? "Employee not found"
                    : "No employees available"}
                </TableCell>
              </TableRow>
            ) : (
              employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>{employee.id}</TableCell>
                  <TableCell className="font-medium">{employee.name}</TableCell>
                  <TableCell className="font-medium">
                    {employee.email}
                  </TableCell>
                  <TableCell className="font-medium">
                    {employee.department}
                  </TableCell>
                  <TableCell className="font-medium">
                    {employee.position ? employee.position : "-"}
                  </TableCell>
                  <TableCell className="font-medium">{employee.role}</TableCell>

                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        employee.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {employee.isActive ? "Active" : "Inactive"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setParams({ id: employee.id });

                            // Pre-fill form using react-hook-form
                            form.setValue(
                              "department",
                              employee.department || ""
                            );
                            form.setValue("position", employee.position || "");
                          }}
                        >
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <FilePenLine className="cursor-pointer" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Edit Employee</p>
                            </TooltipContent>
                          </Tooltip>
                        </Button>
                      </DialogTrigger>

                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Edit Employee</DialogTitle>
                          <DialogDescription>
                            Update the employee's department and position
                          </DialogDescription>
                        </DialogHeader>

                        <Form {...form}>
                          <form
                            onSubmit={form.handleSubmit(handleEdit)}
                            className="space-y-4"
                          >
                            {/* Department */}
                            <FormField
                              control={form.control}
                              name="department"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Department</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            {/* Position */}
                            <FormField
                              control={form.control}
                              name="position"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Position</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            {/* Status Switch */}
                            <div className="flex items-center gap-3 pt-2">
                              <Label>Status</Label>
                              <Switch
                                checked={employee.isActive}
                                disabled={updatingIds.has(employee.id)}
                                onCheckedChange={(newStatus) =>
                                  handleStatusChange(employee.id, newStatus)
                                }
                              />
                              {updatingIds.has(employee.id) && (
                                <span className="text-xs text-gray-500">
                                  Updating...
                                </span>
                              )}
                            </div>

                            <DialogFooter>
                              <DialogClose asChild>
                                <Button variant="outline">Cancel</Button>
                              </DialogClose>
                              <Button type="submit">Save changes</Button>
                            </DialogFooter>
                          </form>
                        </Form>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                  {/* <TableCell>
                    <Switch
                      checked={employee.isActive}
                      onCheckedChange={(newStatus : boolean) =>
                        handleStatusChange(employee.id, newStatus)
                      }
                      disabled={updatingIds.has(employee.id)}
                      aria-label={
                        employee.isActive
                          ? "Deactivate employee"
                          : "Activate employee"
                      }
                    />
                    {updatingIds.has(employee.id) && (
                      <span className="ml-2 text-xs text-gray-500">
                        Updating...
                      </span>
                    )}
                  </TableCell> */}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}
      {totalPages > 1 && (
        <Pagination className="mt-8">
          <PaginationContent>
            <PaginationItem
              className={
                currentPage <= 1 ? "pointer-events-none opacity-50" : ""
              }
            >
              <PaginationPrevious
                onClick={() => handlePageChange(currentPage - 1)}
              />
            </PaginationItem>
            {pages.map((page) => (
              <PaginationItem key={page}>
                <PaginationLink
                  onClick={() => handlePageChange(page)}
                  isActive={page === currentPage}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}
            <PaginationItem
              className={
                currentPage >= totalPages
                  ? "pointer-events-none opacity-50"
                  : ""
              }
            >
              <PaginationNext
                onClick={() => handlePageChange(currentPage + 1)}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
