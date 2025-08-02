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
  Users,
  UserCog,
  ClipboardList,
  Boxes,
  CalendarCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  MapPin,
  Star,
  BadgeCheck,
  CircleDollarSign,
} from "lucide-react";
import { useGetStatisticsData } from "../../../hooks/useDashboard";
import { Skeleton } from "../../../components/ui/skeleton";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../components/ui/tabs";
import { Badge } from "../../../components/ui/badge";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

export default function StatisticsPage() {
  const { data, isLoading, error } = useGetStatisticsData();

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Failed to load dashboard statistics. Please try again later.
      </div>
    );
  }

  const statisticsData = data?.data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Advanced Statistics
          </h1>
          <p className="text-muted-foreground">
            Comprehensive analytics for your ServMaster platform
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Export</Button>
          <Button>Generate Report</Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="providers">Providers</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Customers"
              value={statisticsData?.customers?.total}
              icon={<Users className="h-4 w-4 text-muted-foreground" />}
              change="+12%"
              loading={isLoading}
            />
            <StatCard
              title="Service Providers"
              value={statisticsData?.providers?.total}
              icon={<UserCog className="h-4 w-4 text-muted-foreground" />}
              change="+8%"
              loading={isLoading}
            />
            <StatCard
              title="Completed Requests"
              value={statisticsData?.requests?.completionRate?.completed}
              icon={<CheckCircle2 className="h-4 w-4 text-muted-foreground" />}
              change={`${Math.round(
                (statisticsData?.requests?.completionRate.completed /
                  statisticsData?.requests?.completionRate.total) *
                  100 || 0
              )}%`}
              loading={isLoading}
            />
            <StatCard
              title="Total Revenue"
              value={`$${(
                statisticsData?.financials?.totalRevenue || 0
              ).toLocaleString()}`}
              icon={
                <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
              }
              change="+18%"
              loading={isLoading}
            />
          </div>

          {/* Charts Row 1 */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            {/* Growth Trends */}
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Growth Trends</CardTitle>
                <CardDescription>Last 30 days activity</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={statisticsData?.timeline}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis dataKey="_id" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="requests"
                          stroke="#8884d8"
                          strokeWidth={2}
                          name="Total Requests"
                        />
                        <Line
                          type="monotone"
                          dataKey="completed"
                          stroke="#82ca9d"
                          strokeWidth={2}
                          name="Completed"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Verification Status */}
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Provider Verification</CardTitle>
                <CardDescription>Current verification status</CardDescription>
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
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <BadgeCheck className="h-6 w-6 text-blue-500" />
                        <div>
                          <p className="text-sm font-medium">
                            Identity Verified
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {statisticsData?.verification?.identityVerified} of{" "}
                            {statisticsData?.verification?.total}
                          </p>
                        </div>
                      </div>
                      <div className="font-medium">
                        {Math.round(
                          (statisticsData?.verification?.identityVerified /
                            statisticsData?.verification?.total) *
                            100
                        )}
                        %
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <BadgeCheck className="h-6 w-6 text-green-500" />
                        <div>
                          <p className="text-sm font-medium">
                            Professionally Verified
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {statisticsData?.verification?.professionalVerified}{" "}
                            of {statisticsData?.verification?.total}
                          </p>
                        </div>
                      </div>
                      <div className="font-medium">
                        {Math.round(
                          (statisticsData?.verification?.professionalVerified /
                            statisticsData?.verification?.total) *
                            100
                        )}
                        %
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Clock className="h-6 w-6 text-yellow-500" />
                        <div>
                          <p className="text-sm font-medium">
                            Pending Verification
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {statisticsData?.verification.total -
                              statisticsData?.verification
                                .identityVerified}{" "}
                            providers
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Charts Row 2 */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Service Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Service Categories</CardTitle>
                <CardDescription>
                  Top categories by service count
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statisticsData?.services.byCategory}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                          nameKey="_id"
                        >
                          {statisticsData?.services.byCategory.map(
                            (entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            )
                          )}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Customer Locations */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Locations</CardTitle>
                <CardDescription>Top cities by customer count</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={statisticsData?.customers.byCity}
                        layout="vertical"
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis type="number" />
                        <YAxis dataKey="_id" type="category" />
                        <Tooltip />
                        <Bar
                          dataKey="count"
                          fill="#8884d8"
                          radius={[0, 4, 4, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Ratings Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Service Ratings</CardTitle>
                <CardDescription>Customer rating distribution</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : statisticsData?.ratings ? (
                  <div className="h-[300px]">
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="text-4xl font-bold flex items-center justify-center">
                          <Star className="h-8 w-8 text-yellow-500 mr-2" />
                          {statisticsData?.ratings.avgRating.toFixed(1)}
                        </div>
                        <p className="text-muted-foreground">
                          from {statisticsData?.ratings.totalReviews} reviews
                        </p>
                        <div className="mt-4 space-y-2">
                          {[5, 4, 3, 2, 1].map((rating) => (
                            <div key={rating} className="flex items-center">
                              <span className="w-8">{rating}★</span>
                              <div className="flex-1 mx-2 h-4 bg-gray-200 rounded-full">
                                <div
                                  className="h-4 bg-yellow-500 rounded-full"
                                  style={{
                                    width: `${
                                      (statisticsData?.ratings
                                        .ratingDistribution[rating - 1] /
                                        statisticsData?.ratings.totalReviews) *
                                      100
                                    }%`,
                                  }}
                                />
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {
                                  statisticsData?.ratings.ratingDistribution[
                                    rating - 1
                                  ]
                                }
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : null}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Customers Tab */}
        <TabsContent value="customers" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Customer Growth</CardTitle>
                <CardDescription>New customers over time</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={statisticsData?.customers.growth}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis dataKey="_id" />
                        <YAxis />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="count"
                          stroke="#8884d8"
                          strokeWidth={2}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Geographic Distribution</CardTitle>
                <CardDescription>Customers by location</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : (
                  <div className="h-[300px] overflow-y-auto">
                    <div className="space-y-4">
                      {statisticsData?.customers.byCity.map((city) => (
                        <div key={city._id} className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                          <div className="flex-1">
                            <p className="font-medium">
                              {city._id || "Unknown"}
                            </p>
                          </div>
                          <div className="text-muted-foreground">
                            {city.count} customers
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Providers Tab */}
        <TabsContent value="providers" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Provider Status</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statisticsData?.providers.byStatus}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                          nameKey="_id"
                        >
                          {statisticsData?.providers.byStatus.map(
                            (entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            )
                          )}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Business Types</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={statisticsData?.providers.byBusinessType}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis dataKey="_id" />
                        <YAxis />
                        <Tooltip />
                        <Bar
                          dataKey="count"
                          fill="#8884d8"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Top Rated Providers</CardTitle>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="h-16 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="h-[300px] overflow-y-auto">
                    <div className="space-y-4">
                      {statisticsData?.providers.topRated.map((provider) => (
                        <div key={provider._id} className="flex items-center">
                          <div className="rounded-full bg-muted h-10 w-10 flex items-center justify-center">
                            {provider.fullName.charAt(0)}
                          </div>
                          <div className="ml-4 space-y-1">
                            <p className="font-medium">{provider.fullName}</p>
                            <p className="text-sm text-muted-foreground capitalize">
                              {provider.accountStatus}
                            </p>
                          </div>
                          <div className="ml-auto font-medium flex items-center">
                            <Star className="h-4 w-4 text-yellow-500 mr-1" />
                            {provider.rating?.average?.toFixed(1) || "N/A"}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Service Distribution</CardTitle>
                <CardDescription>By category</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-[300px] w-full" />
                ) : (
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={statisticsData?.services.byCategory}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                        <XAxis dataKey="_id" />
                        <YAxis />
                        <Tooltip />
                        <Bar
                          dataKey="count"
                          fill="#8884d8"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Recent Requests</CardTitle>
                <CardDescription>Latest service activities</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <Skeleton key={i} className="h-12 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="h-[300px] overflow-y-auto">
                    <div className="space-y-4">
                      {statisticsData?.requests.recent.map((request) => (
                        <div
                          key={request._id}
                          className="flex items-center justify-between"
                        >
                          <div>
                            <p className="font-medium">
                              {request.service?.name || "Unknown Service"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {new Date(
                                request.createdAt
                              ).toLocaleDateString()}
                            </p>
                          </div>
                          <Badge variant="outline" className="capitalize">
                            {request.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Reusable Stat Card Component
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
                ) : change.startsWith("-") ? (
                  <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                ) : (
                  <span className="h-4 w-4 mr-1" />
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
