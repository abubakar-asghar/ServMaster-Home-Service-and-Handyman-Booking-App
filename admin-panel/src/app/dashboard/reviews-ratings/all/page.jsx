"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../../../../components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../../components/ui/table";
import { Button } from "../../../../components/ui/button";
import {
  Star,
  Search,
  ArrowUpDown,
  Trash2,
  Eye,
  MoreHorizontal,
} from "lucide-react";
import { Input } from "../../../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../../components/ui/select";
import { Badge } from "../../../../components/ui/badge";
import {
  Avatar,
  AvatarImage,
  AvatarFallback,
} from "../../../../components/ui/avatar";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationLink,
  PaginationNext,
} from "../../../../components/ui/pagination";
import { Skeleton } from "../../../../components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../../../../components/ui/dropdown-menu";
import { toast } from "react-hot-toast";
import {
  useGetAllReviews,
  useGetReviewsStats,
  useDeleteReview,
} from "../../../../hooks/useReviews";

export default function AdminReviewsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State for filters and pagination
  const [filters, setFilters] = useState({
    rating: searchParams.get("rating") || "",
    sort: searchParams.get("sort") || "newest",
    search: searchParams.get("search") || "",
    page: parseInt(searchParams.get("page") || 1),
    limit: 10,
  });

  // Fetch reviews with query
  const {
    data: rData,
    isLoading: reviewsLoading,
    isError: reviewsError,
  } = useGetAllReviews(filters);

  const reviewsData = rData?.data;

  // Fetch review stats
  const {
    data: sData,
    isLoading: statsLoading,
    isError: statsError,
  } = useGetReviewsStats();

  const statsData = sData?.data;

  // Delete review mutation
  const { mutate: deleteReview } = useDeleteReview();

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value, page: 1 };
    setFilters(newFilters);
    updateURL(newFilters);
  };

  // Handle page change
  const handlePageChange = (page) => {
    const newFilters = { ...filters, page };
    setFilters(newFilters);
    updateURL(newFilters);
  };

  // Update URL with current filters
  const updateURL = (filters) => {
    const params = new URLSearchParams();
    if (filters.rating) params.set("rating", filters.rating);
    if (filters.sort) params.set("sort", filters.sort);
    if (filters.search) params.set("search", filters.search);
    if (filters.page > 1) params.set("page", filters.page.toString());
    router.replace(`/dashboard/reviews-ratings/all?${params.toString()}`);
  };

  // Handle review deletion
  const handleDelete = (reviewId) => {
    if (confirm("Are you sure you want to delete this review?")) {
      deleteReview(reviewId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Customer Reviews & Ratings</h1>
          <p className="text-muted-foreground">
            Manage and analyze customer feedback
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Reviews</CardDescription>
            <CardTitle className="text-4xl">
              {statsLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : statsError ? (
                "Error"
              ) : (
                statsData?.total || 0
              )}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Average Rating</CardDescription>
            <CardTitle className="text-4xl flex items-center">
              {statsLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : statsError ? (
                "Error"
              ) : (
                <>
                  {statsData?.averageRating?.toFixed(1) || 0}
                  <Star className="h-6 w-6 text-yellow-500 ml-1 fill-yellow-500" />
                </>
              )}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Rating Distribution</CardDescription>
            <div className="flex items-center space-x-2">
              {[5, 4, 3, 2, 1].map((rating) => (
                <div key={rating} className="text-center">
                  <div className="font-bold">
                    {statsLoading ? (
                      <Skeleton className="h-6 w-6" />
                    ) : statsError ? (
                      "-"
                    ) : (
                      statsData?.ratingDistribution?.find(
                        (r) => r._id === rating
                      )?.count || 0
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground">{rating}★</div>
                </div>
              ))}
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search reviews..."
                  className="pl-8"
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                />
              </div>
            </div>
            <Select
              value={filters.rating}
              onValueChange={(value) => handleFilterChange("rating", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by rating" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Ratings</SelectItem>
                <SelectItem value="5">5 Stars</SelectItem>
                <SelectItem value="4">4 Stars</SelectItem>
                <SelectItem value="3">3 Stars</SelectItem>
                <SelectItem value="2">2 Stars</SelectItem>
                <SelectItem value="1">1 Star</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={filters.sort}
              onValueChange={(value) => handleFilterChange("sort", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="highest">Highest Rated</SelectItem>
                <SelectItem value="lowest">Lowest Rated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reviews Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Reviews</CardTitle>
          <CardDescription>
            {reviewsLoading ? (
              <Skeleton className="h-5 w-40" />
            ) : reviewsError ? (
              "Error loading reviews"
            ) : (
              `${reviewsData?.pagination?.total || 0} reviews found`
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Review</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {reviewsLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className="h-10 w-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-10 w-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-10 w-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-10 w-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-10 w-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-10 w-full" />
                    </TableCell>
                    <TableCell className="text-right">
                      <Skeleton className="h-10 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              ) : reviewsError ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center h-24 text-red-500"
                  >
                    Failed to load reviews
                  </TableCell>
                </TableRow>
              ) : reviewsData?.reviews?.length > 0 ? (
                reviewsData.reviews.map((review) => (
                  <TableRow key={review._id}>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={review.customer?.image} />
                          <AvatarFallback>
                            {review.customer?.name?.charAt(0) || "C"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {review.customer?.name || "Unknown Customer"}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage src={review.provider?.image} />
                          <AvatarFallback>
                            {review.provider?.name?.charAt(0) || "P"}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {review.provider?.name || "Unknown Provider"}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{review.service?.name || "N/A"}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating
                                ? "text-yellow-500 fill-yellow-500"
                                : "text-muted-foreground"
                            }`}
                          />
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {review.review || "No review text"}
                    </TableCell>
                    <TableCell>
                      {new Date(review.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              router.push(
                                `/dashboard/service-requests/${review.requestId}`
                              )
                            }
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            View Request
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-red-600"
                            onClick={() => handleDelete(review._id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center h-24">
                    No reviews found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {reviewsData?.pagination?.pages > 1 && (
            <div className="mt-6">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() =>
                        handlePageChange(Math.max(1, filters.page - 1))
                      }
                      disabled={filters.page === 1}
                    />
                  </PaginationItem>
                  {Array.from({
                    length: Math.min(5, reviewsData.pagination.pages),
                  }).map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <PaginationItem key={i}>
                        <PaginationLink
                          isActive={filters.page === pageNum}
                          onClick={() => handlePageChange(pageNum)}
                        >
                          {pageNum}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  })}
                  <PaginationItem>
                    <PaginationNext
                      onClick={() =>
                        handlePageChange(
                          Math.min(
                            reviewsData.pagination.pages,
                            filters.page + 1
                          )
                        )
                      }
                      disabled={filters.page === reviewsData.pagination.pages}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
