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
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useRouter } from "next/navigation";

const PAGE_LIMIT = 5;

interface Employee {
  id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  role: string;
  isActive: boolean;
}

//validation form with zod
const formSchema = z.object({
  basicSalary: z.string().min(1, {
    message: "Basic salary is required",
  }),
  month: z.string().min(1, {
    message: "Month is required",
  }),
  year: z.string().min(1, {
    message: "Year is required",
  }),
  paymentMethod: z.string().min(1, {
    message: "Payment method is required",
  }),
  employeeId: z.string(),
});

interface SalaryRecordProps {
  page?: string;
  search?: string;
}

export default function SalaryRecord({ search, page }: SalaryRecordProps) {
  const [salary, setSalary] = useState<any[]>([]);
  const [employee, setEmployee] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(Number(page) || 1);
  const [searchTerm, setSearchTerm] = useState(search || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const totalPages = useMemo(() => {
    return Math.ceil(totalCount / PAGE_LIMIT);
  }, [totalCount]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      basicSalary: "",
      month: "",
      year: "",
      paymentMethod: "",
      employeeId: "",
    },
  });

  const handleSubmit = async (data: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    try {
      const payload = {
        basicSalary: parseFloat(data.basicSalary),
        month: parseInt(data.month),
        year: parseInt(data.year),
        paymentMethod: data.paymentMethod,
        status: false,
        employeeId: parseInt(data.employeeId),
      };
      const response = await api.post("/api/salary/v1/storeSalary", payload);
      console.log(response);
      if (response.status === 201) {
        toast.success("Salary created successfully");
        setTimeout(() => {
          setIsSubmitting(false);
          getSalary(currentPage);
        }, 1500);
      }
    } catch (e: any) {
      toast.error("Failed to create salary");
    }
  };

  const getSalary = async (page: number, search?: string) => {
    setLoading(true);
    try {
      const fetchAttendance = await api.get("api/salary/v1/getAllSalary", {
        params: { page: page, limit: PAGE_LIMIT, search: search || "" },
      });
      if (fetchAttendance.status === 200) {
        const data = fetchAttendance.data;
        setSalary(data.data);
        setTotalCount(data.totalCount);
      }
    } catch (error) {
      toast.error(`No slary records found for ${searchTerm}`);
    } finally {
      setLoading(false);
    }
  };
  //get employee list for select
  useEffect(() => {
    const getEmployeeList = async () => {
      setLoading(true);
      try {
        const response = await api.get("api/employee/v1/getAllEmployee");
        if (response.status === 200) {
          // Handle different response structures
          const employeesData = response.data.data;
          setEmployee(employeesData);
          // setTotalCount(response.data.totalCount);
        }
      } catch (error) {
        toast.error(`No employee records found`);
      } finally {
        setLoading(false);
      }
    };
    getEmployeeList();
  }, []);

  const updateUrlParams = (page: number, search: string) => {
    const params = new URLSearchParams();
    if (page > 1) params.set("page", page.toString());
    if (search) params.set("search", search);

    const queryString = params.toString();
    const newUrl = queryString ? `/salary?${queryString}` : "/salary";

    // Replace the current URL without triggering a navigation
    window.history.replaceState(null, "", newUrl);
  };

  //page change effect
  useEffect(() => {
    updateUrlParams(currentPage, searchTerm);
    getSalary(currentPage, searchTerm);
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    updateUrlParams(1, searchTerm);
    getSalary(1, searchTerm);
  };

  const filterSalary = useMemo(() => {
    return salary.filter((s) =>
      [s.employee.name].some((field) =>
        field.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [salary, searchTerm]);

  const pages = useMemo(() => {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }, [totalPages]);

  const handelPaymntChange = async (salaryId: string, status: boolean) => {
    setUpdatingIds((prev) => new Set(prev).add(salaryId));

    try {
      const response = await api.patch(
        `/api/salary/v1/updateSalaryStatus/${salaryId}`,
        {
          status: status,
        }
      );

      if (response.status === 200) {
        setSalary((prevSalarys) =>
          prevSalarys.map((sal) =>
            sal.id === salaryId ? { ...sal, status: status } : sal
          )
        );
        toast.success(
          `Make Sarary ${status ? "paid" : "pending"} successfully`
        );
      }
    } catch (error: any) {
      setSalary((prevSalarys) =>
        prevSalarys.map((sal) =>
          sal.id === salaryId ? { ...sal, status: !status } : sal
        )
      );
      toast.error(
        error.response?.data?.message || "Fail to update salary payment status"
      );
    } finally {
      setUpdatingIds((prev) => {
        const newSet = new Set(prev);
        newSet.delete(salaryId);
        return newSet;
      });
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold mb-3">Salary Records</h1>
        <div className="flex itcems-center gap-2">
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
          <Dialog>
            <form>
              <DialogTrigger asChild>
                <Button variant="outline" className="cursor-pointer">
                  Add Salary
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add Employee's Salary</DialogTitle>
                  <DialogDescription>
                    Make changes to employee's salary here. Click save when
                    you&apos;re done.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(handleSubmit)}
                    className="space-y-4"
                  >
                    {/* basic salary */}
                    <FormField
                      control={form.control}
                      name="basicSalary"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Basic Salary</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Year */}
                    <FormField
                      control={form.control}
                      name="year"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Year</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Month */}
                    <FormField
                      control={form.control}
                      name="month"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Month</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="paymentMethod"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment Method</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="employeeId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Employee</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Select Employee" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {employee.map((emp) => (
                                <SelectItem
                                  key={emp.id}
                                  value={emp.id.toString()}
                                >
                                  {emp.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Status Switch */}
                    {/* <FormField
                              control={form.control}
                              name="isActive"
                              render={({ field }) => (
                                <FormItem className="flex flex-row items-center gap-2">
                                  <FormLabel>Status</FormLabel>
                                  <FormControl>
                                    <Switch
                                      checked={field.value}
                                      onCheckedChange={field.onChange}
                                    />
                                  </FormControl>
                                </FormItem>
                              )}
                            /> */}
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline" className="cursor-pointer">
                          Cancel
                        </Button>
                      </DialogClose>
                      <Button type="submit" className="cursor-pointer">
                        Submit
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </form>
          </Dialog>
        </div>
      </div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Employee Name</TableHead>
              <TableHead>Employee Position</TableHead>
              <TableHead>Basic Salary</TableHead>
              <TableHead>Pay Month</TableHead>
              <TableHead>Pay Year</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filterSalary.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-4 text-center">
                  {searchTerm.trim()
                    ? `No Salary Record found for "${searchTerm}"`
                    : "No Salary Record found."}
                </TableCell>
              </TableRow>
            ) : salary.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-4 text-center">
                  No Salary Record found.
                </TableCell>
              </TableRow>
            ) : (
              salary.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>{s.id}</TableCell>
                  <TableCell>{s.employee.name}</TableCell>
                  <TableCell>{s.employee.position}</TableCell>
                  <TableCell>{s.basicSalary}</TableCell>
                  <TableCell>{s.month}</TableCell>
                  <TableCell>{s.year}</TableCell>
                  <TableCell>{s.paymentMethod}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs ${
                        s.status
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {s.status ? "Paided" : "Pending"}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={s.status}
                      onCheckedChange={(newState: boolean) =>
                        handelPaymntChange(s.id, newState)
                      }
                      disabled={updatingIds.has(s.id)}
                      aria-label={s.status ? "Cancel Payment" : "Pay Now"}
                    />
                    {updatingIds.has(s.id) && (
                      <span className="ml-2 text-xs text-gray-500">
                        Updating...
                      </span>
                    )}
                  </TableCell>
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
