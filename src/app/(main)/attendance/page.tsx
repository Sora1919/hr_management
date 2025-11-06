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
import { format} from "date-fns";
import { get } from "http";
import { useEffect, useState } from "react";
import { set } from "zod";

export default function DashboardPage() {
  const [attendance, setattendance] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const getAttendance = async () => {
    setLoading(true);
    try {
      const fetchAttendance = await api.get("/api/attendance/v1/getAttendance/");
      if (fetchAttendance.status === 200) {
        console.log(fetchAttendance.data);
        const data = fetchAttendance.data;
        setattendance(data.data); 
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAttendance();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-3">Attandence Records</h1>
      {loading ? (
        <span className="loading loading-spinner loading-md">Loading...</span>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Check-In Time</TableHead>
              <TableHead>Check-out Time</TableHead>
              <TableHead>Location</TableHead>
              {/* <TableHead>Image</TableHead> */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {attendance.map((a) => (
              <TableRow key={a.id}>
                <TableCell>{a.employee.name}</TableCell>
                <TableCell>{format(new Date(a.checkIn),"dd/MM/yyyy HH:mm")}</TableCell>
                <TableCell>{format(new Date(a.checkOut),"dd/MM/yyyy HH:mm")}</TableCell>
                <TableCell>{a.location}</TableCell>
                {/* <TableCell>{e.imageUrl}</TableCell> */}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
