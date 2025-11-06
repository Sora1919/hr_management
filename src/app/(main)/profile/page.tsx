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

export default function DashboardPage() {
  const [profile, setProfile] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
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

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-3">Proflies Records</h1>
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
            </TableRow>
          </TableHeader>
          <TableBody>
            {profile.map((profile) => (
              <TableRow key={profile.id}>
                <TableCell>{profile.name}</TableCell>
                <TableCell>{profile.email}</TableCell>
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
                <TableCell>{profile.github ? profile.github : "-"}</TableCell>
                <TableCell>
                  {profile.linkedin ? profile.linkedin : "-"}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
