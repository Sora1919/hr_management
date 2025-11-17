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
import { Switch } from "@/components/ui/switch";

export default function DashboardPage() {
  const [salary, setSalary] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());

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

  const handlePaymentChange = async (salaryId: string, status: boolean) => {
    setUpdatingIds((prev) => new Set(prev).add(salaryId));

    try {
      const response = await api.put(
          `/api/salary/v1/updateSalaryStatus/${salaryId}`,
          {
            status: status
          }
      );

      if (response.status === 200) {
        setSalary((prevSalaries) =>
            prevSalaries.map((sal) =>
                sal.id === salaryId ? { ...sal, status: status } : sal
            )
        );
        toast.success(
            `Salary ${status ? "paid" : "pending"} successfully`
        );
      }
    } catch (error: any) {
      // Revert the UI state on error
      setSalary((prevSalaries) =>
          prevSalaries.map((sal) =>
              sal.id === salaryId ? { ...sal, status: !status } : sal
          )
      );
      toast.error(error.response?.data?.message || "Failed to update salary payment status");
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
        <h1 className="text-2xl font-bold mb-3">Salary Records</h1>
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
                {salary.map((s) => (
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
                    {s.status ? "Paid" : "Pending"}
                  </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Switch
                              checked={s.status}
                              onCheckedChange={(newState: boolean) =>
                                  handlePaymentChange(s.id, newState)
                              }
                              disabled={updatingIds.has(s.id)}
                          />
                          {updatingIds.has(s.id) && (
                              <span className="ml-2 text-xs text-gray-500">
                        Updating...
                      </span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                ))}
              </TableBody>
            </Table>
        )}
      </div>
  );
}