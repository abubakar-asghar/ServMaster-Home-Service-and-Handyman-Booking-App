import { format } from "date-fns";
import { Button } from "../../../components/ui/button";
import Link from "next/link";
import { Badge } from "../../../components/ui/badge";
import { CheckIcon, XIcon } from "lucide-react";

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
    accessorKey: "isPhoneVerified",
    header: "Verified",
    cell: ({ row }) => (
      <Badge
        variant={row.getValue("isPhoneVerified") ? "default" : "destructive"}
        className="gap-1"
      >
        {row.getValue("isPhoneVerified") ? (
          <>
            <CheckIcon className="h-3 w-3" />
            Verified
          </>
        ) : (
          <>
            <XIcon className="h-3 w-3" />
            Unverified
          </>
        )}
      </Badge>
    ),
  },
  {
    accessorKey: "city",
    header: "City",
  },
  {
    accessorKey: "createdAt",
    header: "Joined",
    cell: ({ row }) => format(new Date(row.getValue("createdAt")), "PPP"),
  },
  {
    accessorKey: "lastActive",
    header: "Last Active",
    cell: ({ row }) =>
      row.getValue("lastActive")
        ? format(new Date(row.getValue("lastActive")), "PPPp")
        : "Never",
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => {
      const customer = row.original;

      return (
        <div className="flex gap-2">
          <Link href={`/dashboard/customers/detail?id=${customer._id}`}>
            <Button variant="outline" size="sm">
              View
            </Button>
          </Link>
          <Button
            variant={customer.isPhoneVerified ? "outline" : "default"}
            size="sm"
          >
            {customer.isPhoneVerified ? "Unverify" : "Verify"}
          </Button>
        </div>
      );
    },
  },
];
