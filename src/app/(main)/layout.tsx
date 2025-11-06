import Sidebar from "@/components/Sidebar";

const MainAuth = ({ children }: { children: React.ReactNode }) => {
  return (
    <>
      <div className="flex">
        <div className="hidden md:block h-screen w-[300px]">
          <Sidebar />
        </div>
        <div className="p-5 w-full md:max-w-[1140px]">{children}</div>
      </div>
    </>
  );
};

export default MainAuth;
