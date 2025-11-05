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

export default function DashboardPage() {
  const [employee, setEmployee] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const getEmployeeList = async () => {
    setLoading(true);
    try {
      const fetchEmployee = await api.get("/api/employee/v1/getAllEmployee");
      if (fetchEmployee.status === 200) {
        console.log(fetchEmployee.data);
        const data = fetchEmployee.data;
        setEmployee(data.data || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getEmployeeList();
  }, []);

  const handelDelete = async (id: number) => {
    try {
      const deleteEmployee = await api.delete(`/api/employee/v1/destroyEmployee/${id}`);
      if( deleteEmployee.status === 200 ){
        toast.success("Employee deleted successfully");
        getEmployeeList();
      }
    } catch (error) {
      toast.error("Can't delete employee");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-3">Employee Records</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Github</TableHead>
              <TableHead>LinkedIn</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {employee.map((e) => (
              <TableRow key={e.id}>
                <TableCell>{e.name}</TableCell>
                <TableCell>{e.email}</TableCell>
                <TableCell>{e.github}</TableCell>
                <TableCell>{e.linkedin}</TableCell>
                <TableCell>
                  <Button
                  size="icon"
                  variant="destructive"
                  onClick={() => handelDelete(e.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
