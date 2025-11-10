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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useEffect, useMemo, useState } from "react";
import { api } from "@/api/api";
import { Plus, Router } from "lucide-react";
import { useRouter } from "next/navigation";

const PAGE_LIMIT = 5;

const formSchema = z.object({
  name: z.string().min(2, "name required"),
  email: z.string().email("Invalid email"),
  bio: z.string()
})


interface UserPageProps {
  page?: string;
}
export default function UserPage({ page }: UserPageProps) {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(Number(page) || 1);
  const router = useRouter();
  const [isAdding, setIsAdding] = useState(false);

  
  const userForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  })

  const handelAdd = async (data: z.infer<typeof formSchema>) => {
    setIsAdding(true);
    const payload = {
      name : data.name,
      email : data.email,
    };
    try{
      const createUser = await api.post("/api/users/v1/register", payload);
      if(createUser.status === 201){
        toast.success("User created successfully");
        setTimeout(() => {
          router.push("/users");
          location.reload();
        },2000);
      }
    }catch(error){
      toast.error("Can't create user");
    }
  };

  

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
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold mb-3">User Lists</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="icon" variant="outline">
              <Plus className="h-4 w-4"/>
            </Button>
          </DialogTrigger>  
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add a new User</DialogTitle>
            </DialogHeader>
            <Form {...userForm}>
              <form
                onSubmit={userForm.handleSubmit(handelAdd)}
                className="space-y-4"
              >
                <FormField
                  control={userForm.control}
                  name="name"
                  render={ ({field}) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Willian" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={userForm.control}
                  name="email"
                  render={ ({field}) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="willian.user@gmail.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit">Add</Button>
              </form>
            </Form>  
          </DialogContent>
        </Dialog>
      </div>
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
  );
}
