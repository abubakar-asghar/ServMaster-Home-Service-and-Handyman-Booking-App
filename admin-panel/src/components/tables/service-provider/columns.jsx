import { format } from "date-fns";
import { Button } from "../../../components/ui/button";
import Link from "next/link";
import { Badge } from "../../../components/ui/badge";
import { CheckIcon, XIcon, ClockIcon, StarIcon } from "lucide-react";

export const columns = [
  {
    accessorKey: "fullName",
    header: "Name",
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("fullName")}</div>
    ),
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorKey: "accountStatus",
    header: "Status",
    cell: ({ row }) => {
      const status = row.getValue("accountStatus");
      const variant =
        {
          active: "default",
          verified: "default",
          pending: "secondary",
          suspended: "destructive",
        }[status] || "outline";

      return (
        <Badge variant={variant} className="capitalize">
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "businessType",
    header: "Business Type",
    cell: ({ row }) => {
      const type = row.original.businessType;
      return type ? (
        <Badge variant="outline" className="capitalize">
          {type}
        </Badge>
      ) : (
        "—"
      );
    },
  },
  {
    accessorKey: "city",
    header: "City",
  },
  {
    accessorKey: "cnicStatus",
    header: "Identity Status",
    cell: ({ row }) => {
      const status = row.original.cnicStatus;
      return status ? (
        <Badge
          variant={
            status === "verified"
              ? "default"
              : status === "pending"
              ? "secondary"
              : "destructive"
          }
          className="capitalize"
        >
          {status}
        </Badge>
      ) : (
        <Badge variant="outline">Not Submitted</Badge>
      );
    },
  },
  {
    accessorKey: "professionalStatus",
    header: "Professional Status",
    cell: ({ row }) => {
      console.log(row);
      const status = row.original.professionalStatus;
      return status ? (
        <Badge
          variant={
            status === "verified"
              ? "default"
              : status === "pending"
              ? "secondary"
              : "destructive"
          }
          className="capitalize"
        >
          {status}
        </Badge>
      ) : (
        <Badge variant="outline">Not Submitted</Badge>
      );
    },
  },
  {
    accessorKey: "servicesCount",
    header: "Services",
    cell: ({ row }) => {
      const count = row.original.servicesCount || 0;
      return <Badge variant="outline">{count} Services</Badge>;
    },
  },
  {
    accessorKey: "rating",
    header: "Rating",
    cell: ({ row }) => {
      const rating = row.original.rating;
      return rating ? (
        <div className="flex items-center gap-1">
          <StarIcon className="h-4 w-4 text-yellow-500 fill-yellow-500" />
          <span>{rating.toFixed(1)}</span>
        </div>
      ) : (
        "No ratings"
      );
    },
  },
  {
    accessorKey: "onlineStatus",
    header: "Online",
    cell: ({ row }) => (
      <Badge
        variant={
          row.getValue("onlineStatus") === "online" ? "default" : "outline"
        }
      >
        {row.getValue("onlineStatus") === "online" ? (
          <span className="flex items-center gap-1">
            <div className="h-2 w-2 rounded-full bg-green-500" />
            Online
          </span>
        ) : (
          "Offline"
        )}
      </Badge>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Joined",
    cell: ({ row }) => {
      const createdAt = row.getValue("createdAt");
      const date = new Date(createdAt);
      return date instanceof Date && !isNaN(date)
        ? format(date, "PPP")
        : "Invalid Date";
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const provider = row.original;

      return (
        <div className="flex gap-2">
          <Link href={`/dashboard/service-providers/detail?id=${provider._id}`}>
            <Button variant="outline" size="sm">
              View
            </Button>
          </Link>
          <Button
            variant={
              provider.accountStatus === "suspended" ? "default" : "outline"
            }
            size="sm"
          >
            {provider.accountStatus === "suspended"
              ? "Activate"
              : provider.accountStatus === "pending"
              ? "Set Verified"
              : "Suspend"}
          </Button>
        </div>
      );
    },
  },
];
