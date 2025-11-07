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
import { format } from "date-fns";

export default function DashboardPage() {
  const [salary, setSalary] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const getSalaryList = async () => {
    setLoading(true);
    const fetchSalary = await api.get("/api/salary/v1/getAllSalary/");
    if (fetchSalary.status === 200) {
      let data = fetchSalary.data;
      setSalary(data.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    getSalaryList();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-3">Salary Records</h1>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee Name</TableHead>
              <TableHead>Basic Salary</TableHead>
              <TableHead>Allowance</TableHead>
              <TableHead>Deduction</TableHead>
              <TableHead>Net Salary</TableHead>
              <TableHead>Pay Date</TableHead>
              <TableHead>Pay Month</TableHead>
              <TableHead>Pay Year</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {salary.map((s) => (
              <TableRow key={s.id}>
                <TableCell>{s.employee.name}</TableCell>
                <TableCell>{s.basicSalary}</TableCell>
                <TableCell>{s.allowances}</TableCell>
                <TableCell>{s.deduction}</TableCell>
                <TableCell>{s.netSalary}</TableCell>
                <TableCell>
                  {format(new Date(s.payDate), "yyyy-MM-dd")}
                </TableCell>
                <TableCell>{s.month}</TableCell>
                <TableCell>{s.year}</TableCell>
                <TableCell>{s.paymentMethod}</TableCell>
                <TableCell>{s.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
