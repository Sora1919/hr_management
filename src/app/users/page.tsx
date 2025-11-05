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
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Trash2, Plus } from "lucide-react"
import { get } from "http";

export default function DashboardPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const getUsersList = async () => {
    setLoading(true);
    try {
      const fetchUsers = await api.get("/api/users/v1/getAllUsers");
      if (fetchUsers.status === 200) {
        console.log(fetchUsers.data);
        const data = fetchUsers.data;
        setUsers(data.data || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getUsersList();
  }, []);

  

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-3">Users Records</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>CreatedAt</TableHead>
              <TableHead>Role</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u.id}>
                <TableCell>{u.name}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>{u.createdAt}</TableCell>
                <TableCell>{u.role}</TableCell>
                
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
