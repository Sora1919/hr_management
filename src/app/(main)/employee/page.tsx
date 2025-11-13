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
import { Switch } from "@/components/ui/switch";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

// Define proper interface for Employee
interface Employee {
  id: string;
  name: string;
  isActive: boolean;
}
const PAGE_LIMIT = 5;
interface EmployeePageProps {
  page?: string;
  search?: string;
}
export default function EmployeePage({ page, search }: EmployeePageProps) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(Number(page) || 1);
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState(search || "");
  const totalPages = useMemo(() => {
    return Math.ceil(totalCount / PAGE_LIMIT);
  }, [totalCount]);

  const getEmployeeList = async (page: number, search?: string) => {
    setLoading(true);
    try {
      const response = await api.get("api/employee/v1/getAllEmployee", {
        params: { page: page, limit: PAGE_LIMIT, search: search || "" },
      });
      if (response.status === 200) {
        console.log(response.data);

        // Handle different response structures
        const employeesData = response.data.data || [];
        setEmployees(employeesData);
        setTotalCount(response.data.totalCount);
      }
    } catch (error) {
      console.error(error);
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

  useEffect(() => {
    const timerId = setTimeout(() => {
      getEmployeeList(1, searchTerm);
      setCurrentPage(1);
    }, 1500);
    return () => clearTimeout(timerId);
  }, [searchTerm]);
  useEffect(() => {
    getEmployeeList(currentPage);
  }, [currentPage]);

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
  const pages = useMemo(() => {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }, [totalPages]);

  const handleSearch = () => {
    setCurrentPage(1);
    updateUrlParams(1, searchTerm);
    getEmployeeList(1, searchTerm);
  };

  const handleStatusChange = async (employeeId: string, newStatus: boolean) => {
    // Add to updating set to show loading for this specific switch
    setUpdatingIds((prev) => new Set(prev).add(employeeId));

    try {
      const response = await api.patch(
        `/api/employee/v1/updateEmployeeStatus/${employeeId}`, // Better endpoint name
        {
          isActive: newStatus,
        }
      );

      console.log("Status update response:", response);

      if (response.status === 200) {
        // Update local state
        setEmployees((prevEmployees) =>
          prevEmployees.map((emp) =>
            emp.id === employeeId ? { ...emp, isActive: newStatus } : emp
          )
        );

        toast.success(
          `Employee ${newStatus ? "activated" : "deactivated"} successfully`
        );
      }
    } catch (error: any) {
      console.error("Status update error:", error);

      // Revert the change in UI on error
      setEmployees((prevEmployees) =>
        prevEmployees.map((emp) =>
          emp.id === employeeId ? { ...emp, isActive: !newStatus } : emp
        )
      );

      toast.error(error.response?.data?.message || "Failed to update status");
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
          <Button
            className="cursor-pointer mb-4"
            // onClick={() => {
            //   setCurrentPage(1);
            //   getEmployeeList(1, searchTerm);
            // }}
            onClick={handleSearch}
          >
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
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  No employees found
                </TableCell>
              </TableRow>
            ) : (
              employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell>{employee.id}</TableCell>
                  <TableCell className="font-medium">{employee.name}</TableCell>
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
