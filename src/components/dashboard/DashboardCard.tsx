import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface dashboardCardProps {
  title: string;
  count: number;
  icon: React.ReactElement<LucideIcon>;
}
const DashboardCard = ({ title, count, icon }: dashboardCardProps) => {
  return (
    <Card className="bg-slate-100 dark:bg-slate-800 p-4 pb-0 cursor-pointer">
      <CardContent>
        <h3 className="text-3xl text-center mb-4 font-bold text-slate-700 dark:text-slate-200">
          {title}
        </h3>
        <div className="flex justify-center items-center gap-5">
          {icon}
          <h3 className="text-5xl text-slate-700 dark:text-salte-200 font-semibold">
            {count}
          </h3>
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardCard;
