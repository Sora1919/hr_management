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
import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";


const PAGE_LIMIT = 5;

interface SalaryRecordProps {
  page?: string;
  search?: string;
}

export default function SalaryRecord( { search, page }: SalaryRecordProps) {
  const [salary, setSalary] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(Number(page) || 1);
  const [searchTerm, setSearchTerm] = useState(search || "");


    const totalPages = useMemo(() => {
      return Math.ceil(totalCount / PAGE_LIMIT);
    }, [totalCount]);


    const getSalary = async (page: number, search?: string) => {
        setLoading(true);
        try {
          const fetchAttendance = await api.get("api/salary/v1/getAllSalary", {
            params: { page: page, limit: PAGE_LIMIT, search: search || "" },
          });
          if (fetchAttendance.status === 200) {
            const data = fetchAttendance.data;
            setSalary(data.data || []);
            setTotalCount(data.totalCount || 0);
          }
        } catch (error) {
          toast.error(`No slary records found for ${searchTerm}`);
        } finally {
          setLoading(false);
        }
      };



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




  
  const getSalaryList = async () => {
    setLoading(true);
    try {
      const fetchSalary = await api.get("/api/salary/v1/getAllSalary/");
      if (fetchSalary.status === 200) {
        const data = fetchSalary.data;
        setSalary(data.data);
      }
    } catch (error) {
      toast.error("Failed to fetch salary records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getSalaryList();
  }, []);

  const handelPaymntChange = async (salaryId: string, status: boolean) => {
    setUpdatingIds((prev) => new Set(prev).add(salaryId));

    try {

      const response = await api.patch(
          `/api/salary/v1/updateSalaryStatus/${salaryId}`,
          {
            status: status
          }

      );

      if (response.status === 200) {
        setSalary((prevSalarys) =>
          prevSalarys.map((sal) =>
            sal.id === salaryId ? { ...sal, status: status } : sal
          )
        );
        toast.success(`Make Sarary ${status ? "paid" : "pending"} successfully`);
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
            ) :
          
            (salary.map((s) => (
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
