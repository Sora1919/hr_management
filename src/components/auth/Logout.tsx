"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
export default function Logout() {
  const [logout, isLogout] = useState(false);
  const router = useRouter();
  const logoutBtn = () => {
    isLogout(true);
    localStorage.removeItem("token");
    router.push("/auth");
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
