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
import { format } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { toast } from "sonner";

const PAGE_LIMIT = 5;

interface AttendancePageProps {
  page?: string;
  search?: string;
}
export default function AttendancePage({ page, search }: AttendancePageProps) {
  const [attendance, setattendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(Number(page) || 1);
  const [searchTerm, setSearchTerm] = useState(search || "");

  const totalPages = useMemo(() => {
    return Math.ceil(totalCount / PAGE_LIMIT);
  }, [totalCount]);

  const getAttendance = async (page: number, search?: string) => {
    setLoading(true);
    try {
      const fetchAttendance = await api.get("api/attendance/v1/getAttendance", {
        params: { page: page, limit: PAGE_LIMIT, search: search || "" },
      });
      if (fetchAttendance.status === 200) {
        const data = fetchAttendance.data;
        setattendance(data.data);
        setTotalCount(data.totalCount);
      }
    } catch (error) {
      toast.error(`No attendance records found for ${searchTerm}`);
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
    const newUrl = queryString ? `/attendance?${queryString}` : "/attendance";

    // Replace the current URL without triggering a navigation
    window.history.replaceState(null, "", newUrl);
  };

  //page change effect
  useEffect(() => {
    updateUrlParams(currentPage, searchTerm);
    getAttendance(currentPage, searchTerm);
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  const handleSearch = () => {
    setCurrentPage(1);
    updateUrlParams(1, searchTerm);
    getAttendance(1, searchTerm);
  };
  const filteredAttendance = useMemo(() => {
    return attendance.filter((att) =>
      [att.employee.name, att.location].some((field) =>
        field.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [attendance, searchTerm]);

  const pages = useMemo(() => {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }, [totalPages]);
  return (
    <div className="p-6">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold mb-3">Attandence Records</h1>
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
        <span className="loading loading-spinner loading-md">Loading...</span>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Employee</TableHead>
              <TableHead>Check-In Time</TableHead>
              <TableHead>Check-out Time</TableHead>
              <TableHead>Location</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAttendance.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-4 text-center">
                  {searchTerm
                    ? `No attendance found for "${searchTerm}"`
                    : "No attendance found."}
                </TableCell>
              </TableRow>
            ) : attendance.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-4 text-center">
                  No attendance found.
                </TableCell>
              </TableRow>
            ) : (
              attendance.map((a) => (
                <TableRow key={a.id}>
                  <TableCell>{a.id}</TableCell>
                  <TableCell>{a.employee.name}</TableCell>
                  <TableCell>
                    {format(new Date(a.checkIn), "dd/MM/yyyy hh:mm a")}
                  </TableCell>
                  <TableCell>
                    {a.checkOut
                      ? formatInTimeZone(
                          new Date(a.checkOut),
                          "Asia/Yangon",
                          "dd/MM/yyyy hh:mm a"
                        )
                      : "-"}
                  </TableCell>
                  <TableCell>{a.location}</TableCell>
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
