// app/dashboard/overview/page.tsx
"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../../components/ui/card";
import { Button } from "../../../components/ui/button";
import {
  Boxes,
  Users,
  UserCog,
  ClipboardList,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowUpRight,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { useGetOverviewData } from "../../../hooks/useDashboard";
import { Skeleton } from "../../../components/ui/skeleton";
import { Badge } from "../../../components/ui/badge";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useRef } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

export default function OverviewPage() {
  const router = useRouter();
  const dashboardRef = useRef(null);
  const { data, isLoading, error, refetch } = useGetOverviewData();

  const handleRefresh = () => {
    refetch();
    toast.success("Dashboard data refreshed");
  };

  // Enhanced generateReport function
  const generateReport = async () => {
    if (!dashboardRef.current) return;

    // Show loading state
    const toastId = toast.loading("Generating report...");

    try {
      // 1. Temporarily hide elements you don't want in the report
      const elementsToHide = document.querySelectorAll(".no-print");
      elementsToHide.forEach((el) => el.classList.add("invisible"));

      // 2. Capture dashboard
      const canvas = await html2canvas(dashboardRef.current, {
        scale: 2,
        useCORS: true,
        ignoreElements: (element) => element.classList.contains("no-print"),
      });

      // 3. Restore hidden elements
      elementsToHide.forEach((el) => el.classList.remove("invisible"));

      // 4. Create PDF with metadata
      const pdf = new jsPDF("landscape");
      const imgData = canvas.toDataURL("image/png");
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);

      // Add title and date
      pdf.setFontSize(12);
      pdf.text(
        `ServMaster Dashboard Report - ${new Date().toLocaleDateString()}`,
        10,
        10
      );

      pdf.save(`ServMaster-Report-${Date.now()}.pdf`);

      toast.success("Report downloaded successfully", { id: toastId });
    } catch (err) {
      console.error("Report generation failed:", err);
      toast.error("Failed to generate report", { id: toastId });
    }
  };

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Failed to load dashboard data. Please try again later.
      </div>
    );
  }

  const overviewData = data?.data;

  useEffect(() => {
    console.log("data", data?.data);
  }, [data]);

  return (
    <div className="space-y-4" ref={dashboardRef}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">
          ServMaster Dashboard
        </h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh
          </Button>
          <Button onClick={generateReport}>
            <ArrowUpRight className="mr-2 h-4 w-4" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Services"
          value={overviewData?.totals.services}
          icon={<ClipboardList className="h-4 w-4 text-muted-foreground" />}
          change={overviewData?.growthStats.servicesGrowth}
          loading={isLoading}
        />
        <StatCard
          title="Service Categories"
          value={overviewData?.totals.categories}
          icon={<Boxes className="h-4 w-4 text-muted-foreground" />}
          loading={isLoading}
        />
        <StatCard
          title="Service Providers"
          value={overviewData?.totals.providers}
          icon={<UserCog className="h-4 w-4 text-muted-foreground" />}
          change={overviewData?.growthStats.providersGrowth}
          loading={isLoading}
        />
        <StatCard
          title="Customers"
          value={overviewData?.totals.customers}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          change={overviewData?.growthStats.customersGrowth}
          loading={isLoading}
        />
      </div>

      {/* Main Content Area */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Service Status Chart */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Service Status Distribution</CardTitle>
            <CardDescription>Current status of all services</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-[300px] w-full" />
            ) : (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={overviewData?.serviceStatusDistribution}>
                    <XAxis dataKey="status" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#8884d8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Provider Verification */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Provider Verification</CardTitle>
            <CardDescription>
              Verification status of service providers
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                <VerificationItem
                  title="Identity Verified"
                  value={overviewData?.verificationStats.identityVerified}
                  total={overviewData?.verificationStats.total}
                  icon={<CheckCircle2 className="h-5 w-5 text-green-500" />}
                />
                <VerificationItem
                  title="Professional Verified"
                  value={overviewData?.verificationStats.professionalVerified}
                  total={overviewData?.verificationStats.total}
                  icon={<CheckCircle2 className="h-5 w-5 text-blue-500" />}
                />
                <VerificationItem
                  title="Pending Verification"
                  value={
                    overviewData?.verificationStats.total -
                    Math.max(
                      overviewData?.verificationStats.identityVerified,
                      overviewData?.verificationStats.professionalVerified
                    )
                  }
                  total={overviewData?.verificationStats.total}
                  icon={<Clock className="h-5 w-5 text-yellow-500" />}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Recent Services */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Services</CardTitle>
            <CardDescription>Latest services added</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {overviewData?.recent.services.map((service) => (
                  <div
                    key={service._id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="font-medium">{service.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {service.category}
                      </p>
                    </div>
                    <Badge variant="outline">{service.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Providers */}
        <Card>
          <CardHeader>
            <CardTitle>Top Providers</CardTitle>
            <CardDescription>Highest rated service providers</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {overviewData?.recent.providers.map((provider) => (
                  <div key={provider._id} className="flex items-center">
                    <div className="rounded-full bg-muted h-9 w-9 flex items-center justify-center">
                      {provider.name.charAt(0)}
                    </div>
                    <div className="ml-4 space-y-1">
                      <p className="font-medium">{provider.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {provider.businessType}
                      </p>
                    </div>
                    <div className="ml-auto font-medium">
                      {/* {provider.rating ? provider.rating.toFixed(1) : "N/A"} ★ */}
                      {provider.rating ? provider.rating : "N/A"} ★
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Customers */}
        <Card>
          <CardHeader>
            <CardTitle>New Customers</CardTitle>
            <CardDescription>Recently registered customers</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {overviewData?.recent.customers.map((customer) => (
                  <div key={customer._id} className="flex items-center">
                    <div className="rounded-full bg-muted h-9 w-9 flex items-center justify-center">
                      {customer.name.charAt(0)}
                    </div>
                    <div className="ml-4 space-y-1">
                      <p className="font-medium">{customer.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {customer.phone}
                      </p>
                    </div>
                    <div className="ml-auto text-sm text-muted-foreground">
                      {new Date(customer.joined).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Component for stat cards
function StatCard({ title, value, icon, change, loading }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        {loading ? (
          <>
            <Skeleton className="h-7 w-3/4 mb-1" />
            <Skeleton className="h-4 w-1/2" />
          </>
        ) : (
          <>
            <div className="text-2xl font-bold">{value}</div>
            {change && (
              <div className="flex items-center text-xs text-muted-foreground mt-1">
                {change.startsWith("+") ? (
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                )}
                {change}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

// Component for verification items
function VerificationItem({ title, value, total, icon }) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-4">
        {icon}
        <div>
          <p className="text-sm font-medium">{title}</p>
          <p className="text-sm text-muted-foreground">
            {value} of {total} providers
          </p>
        </div>
      </div>
      <div className="font-medium">{percentage}%</div>
    </div>
  );
}
