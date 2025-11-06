"use client";
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
import { useEffect, useMemo, useState } from "react";
import { api } from "@/api/api";
import { useRouter } from "next/navigation";

const PAGE_LIMIT = 5;

interface UserPageProps {
  page?: string;
}
export default function UserPage({ page }: UserPageProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(Number(page) || 1);
  const router = useRouter();

  const totalPages = useMemo(() => {
    return Math.ceil(totalCount / PAGE_LIMIT);
  }, [totalCount]);
  const getUsersList = async (page: number) => {
    setLoading(true);
    try {
      const response = await api.get("api/users/v1/getAllUsers", {
        params: { page: page, limit: PAGE_LIMIT },
      });
      if (response.status === 200) {
        const data = response.data;
        setUsers(data.data);
        setTotalCount(data.totalCount);
      }
    } catch (error: any) {
      // Redirect to login if unauthorized
      if (error.response?.status === 401) {
        router.push("/auth");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check if token exists before making API call
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    if (!token) {
      console.warn("No token found, redirecting to login");
      router.push("/auth");
      return;
    }
    getUsersList(currentPage);
  }, [router, currentPage]);

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      setCurrentPage(page);
    }
  };
  const pages = useMemo(() => {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }, [totalPages]);

  return (
    <div>
      <div className="">
        <h1 className="text-2xl font-bold mb-3">User Lists</h1>
        {loading ? (
          <p>Loading...</p>
        ) : users.length === 0 ? (
          <p>No users found</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>CreatedAt</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>{u.name}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>
                    {new Date(u.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>{u.role}</TableCell>
                </TableRow>
              ))}
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
    </div>
  );
}
