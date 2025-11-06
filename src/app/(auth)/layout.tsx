const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex justify-center items-center h-screen">
      <div className="absolute bottom-5 right-0 text-white"></div>
      {children}
    </div>
  );
};

export default AuthLayout;
