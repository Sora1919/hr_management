"use client";
import { api } from "@/api/api";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
export default function Logout() {
  const [logout, isLogout] = useState(false);
  const router = useRouter();
  const logoutBtn = async () => {
    isLogout(true);
    // localStorage.removeItem("token");
    // router.push("/auth");
    try {
      const response = await api.post("/api/employee/v1/logout", {
        withCredentials: true,
      });
      if (response.status === 200) {
        toast.success("Logout successful");
        localStorage.removeItem("token");
        router.push("/auth");
      }
    } catch (error) {
      toast.error("Failed to logout employees");
    } finally {
      isLogout(false);
    }
  };

  return (
    <div className="mt-2">
      <Button
        className="text-white dark:bg-slate-500 w-full cursor-pointer"
        onClick={logoutBtn}
      >
        {logout ? "Logging Out" : "Logout"}
      </Button>
    </div>
  );
}
