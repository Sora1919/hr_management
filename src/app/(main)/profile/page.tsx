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
import { Plus, Router } from "lucide-react";
import { useEffect, useState, useMemo, use } from "react";
import { useRouter } from "next/navigation";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext } from "@/components/ui/pagination";


const formSchema = z.object({
  name: z.string().min(2, "name required"),
  email: z.string().email("Invalid email"),
  phoneNumber: z.string(),
  department: z.string(),
  position: z.string(),
  github: z.string(),
  linkedin: z.string(),
  userId: z.number(),
});



const PAGE_LIMIT = 5;

interface UserPageProps {
  page?: string;
}


export default function DashboardPage({page} : UserPageProps) {
  const [profile, setProfile] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(Number(page) || 1);
  const [isAdding, setIsAdding] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [userId, setUserId] = useState<String>("")
  const [editProfile, setEditProfile] = useState<any | null>([]);
  const router = useRouter();
  const getProfileList = async () => {
    setLoading(true);
    const fetchProfiles = await api.get("/api/profile/v1/index");
    if (fetchProfiles.status === 200) {
      let data = fetchProfiles.data;
      setProfile(data.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    getProfileList();
  }, []);

  const profileForm = useForm<z.infer<typeof formSchema>>({
  resolver: zodResolver(formSchema),
  defaultValues: {
    name: "",
    email: "",
    github: "",
    linkedin: "",
    phoneNumber: "",
    department: "",
    position: "",
    userId:1,
    
  },
})

const editFrom = useForm<z.infer<typeof formSchema>>({
  resolver: zodResolver(formSchema),
  defaultValues: {
    github: "",
    linkedin: "",
    phoneNumber: "",
    department: "",
    position: "",
  },
})




  const handelAdd = async (data: z.infer<typeof formSchema>) => {
    setIsAdding(true);
    const payload = {
      name: data.name,
      email: data.email,
      phoneNumber: data.phoneNumber,
      department: data.department,
      position: data.position,
      github: data.github,
      linkedin: data.linkedin,
      userId: data.userId,
    };
    try {
      const createProfile = await api.post("/api/profile/v1/create", payload);
      if (createProfile.status === 201) {
        toast.success("Profile created successfully");
        setTimeout(() => {
          location.reload();
        }, 2000);
      }
    } catch (error) {
      toast.error("Can't create profile");
    }
  }

  const handelEdit = async (data: z.infer<typeof formSchema>) => {
    setIsUpdating(true);
    const payload = {
      github: data.github,
      linkedin: data.linkedin,
      phoneNumber: data.phoneNumber,
      department: data.department,
      position: data.position,
    };
    try{
      const updateProfile = await api.put(`/api/profile/v1/update/${userId}`, payload);
      if(updateProfile.status === 200){
        toast.success("Profile updated successfully");
        setTimeout(() => {
          location.reload();
        }, 2000);
      }
    }catch(error){
      toast.error("Can't update profile");
    }
  }




  const totalPages = useMemo(() => {
      return Math.ceil(totalCount / PAGE_LIMIT);
    }, [totalCount]);
    const getUsersList = async (page: number) => {
      setLoading(true);
      try {
        const response = await api.get("/api/profile/v1/index", {
          params: { page: page, limit: PAGE_LIMIT },
        });
        if (response.status === 200) {
          const data = response.data;
          setProfile(data.data);
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
        <h1 className="text-2xl font-bold mb-3">Proflies Records</h1>
        <Dialog>
          <DialogTrigger>
            <Button size="icon" variant="outline" suppressHydrationWarning >
              <Plus className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add a new Profile</DialogTitle>
            </DialogHeader>
            <Form {...profileForm}>
              <form
                onSubmit={profileForm.handleSubmit(handelAdd)}
                className="space-y-4"
              >
                <FormField
                  control={profileForm.control}
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
                  control={profileForm.control}
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
                <FormField
                  control={profileForm.control}
                  name="phoneNumber"
                  render={ ({field}) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl>
                        <Input placeholder="+959 123 456 789" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name="department"
                  render={ ({field}) => (
                    <FormItem>
                      <FormLabel>Department</FormLabel>
                      <FormControl>
                        <Input placeholder="IT Department" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name="position"
                  render={ ({field}) => (
                    <FormItem>
                      <FormLabel>Positon</FormLabel>
                      <FormControl>
                        <Input placeholder="Senior Developer" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name="github"
                  render={ ({field}) => (
                    <FormItem>
                      <FormLabel>Github</FormLabel>
                      <FormControl>
                        <Input placeholder="https://github.com//willion" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name="linkedin"
                  render={ ({field}) => (
                    <FormItem>
                      <FormLabel>LindedIn</FormLabel>
                      <FormControl>
                        <Input placeholder="https://www.linkedin.com//willion" {...field} />
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
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                {/* <TableHead>Image</TableHead> */}
                <TableHead>Department</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Github</TableHead>
                <TableHead>LinkedIn</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profile.map((profile) => (
                <TableRow key={profile.id}>
                  <TableCell>{profile.name}</TableCell>
                  <TableCell className="max-w-[100px] truncate">{profile.email}</TableCell>
                  <TableCell>
                    {profile.phoneNumber ? profile.phoneNumber : "-"}
                  </TableCell>
                  {/* <TableCell>{profile.profileImage}</TableCell> */}
                  <TableCell>
                    {profile.department ? profile.department : "-"}
                  </TableCell>
                  <TableCell>
                    {profile.position ? profile.position : "-"}
                  </TableCell>
                  <TableCell className="max-w-[100px] truncate">{profile.github ? profile.github : "-"}</TableCell>
                  <TableCell className="max-w-[100px] truncate">
                    {profile.linkedin ? profile.linkedin : "-"}
                  </TableCell>
                  <TableCell className="space-x-2">
                      <Dialog
                    open={editProfile?.id === profile.id}
                    onOpenChange={(open) => {
                      if (open) {
                        setEditProfile(profile)
                        editFrom.reset({
                          github: profile.github,
                          linkedin: profile.linkedin,
                          phoneNumber: profile.phoneNumber,
                          department: profile.department,
                          position: profile.position
                        })
                      }else{
                        setEditProfile(null)
                      }
                    }}>
                      <DialogTrigger>
                        <Button size="sm" variant="outline">Edit</Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Edit Profile</DialogTitle>
                          <DialogDescription>
                            Make changes to your profile here. Click save to save
                           </DialogDescription>
                        </DialogHeader>
                        <Form {...editFrom}>
                          <form
                            onSubmit={editFrom.handleSubmit(handelEdit)}
                            className="space-y-4"
                            >
                            <FormField
                              control={editFrom.control}
                              name="github"
                              render={ ({field}) => (
                                <FormItem>
                                  <FormLabel>Github</FormLabel>
                                  <FormControl>
                                    <Input placeholder="https://github.com//willion" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={editFrom.control}
                              name="linkedin"
                              render={ ({field}) => (
                                <FormItem>
                                  <FormLabel>LindedIn</FormLabel>
                                  <FormControl>
                                    <Input placeholder="https://www.linkedin.com//willion" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={editFrom.control}
                              name="phoneNumber"
                              render={ ({field}) => (
                                <FormItem>
                                  <FormLabel>Phone Number</FormLabel>
                                  <FormControl>
                                    <Input placeholder="08123456789" {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={editFrom.control}
                              name="department"
                              render={ ({field}) => (
                                <FormItem>
                                  <FormLabel>Department</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={editFrom.control}
                              name="position"
                              render={ ({field}) => (
                                <FormItem>
                                  <FormLabel>Position</FormLabel>
                                  <FormControl>
                                    <Input {...field} />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <Button type="submit">Update</Button> 
                          </form>
                        </Form>
                        </DialogContent>
                    </Dialog>
                  </TableCell>
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
