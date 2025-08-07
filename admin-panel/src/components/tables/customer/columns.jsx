import { format } from "date-fns";
import { Button } from "../../../components/ui/button";
import Link from "next/link";
import { Badge } from "../../../components/ui/badge";
import { CheckIcon, XIcon } from "lucide-react";

export function getCustomerColumns(
  updatePhoneStatus,
  updateBlockStatus,
  refetch
) {
  return [
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
      accessorKey: "isBlocked",
      header: "Blocked",
      cell: ({ row }) => (
        <Badge
          variant={row.getValue("isBlocked") ? "destructive" : "default"}
          className="gap-1"
        >
          {row.getValue("isBlocked") ? (
            <>
              <XIcon className="h-3 w-3" />
              Blocked
            </>
          ) : (
            <>
              <CheckIcon className="h-3 w-3" />
              Active
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
    // {
    //   accessorKey: "lastActive",
    //   header: "Last Active",
    //   cell: ({ row }) =>
    //     row.getValue("lastActive")
    //       ? format(new Date(row.getValue("lastActive")), "PPPp")
    //       : "Never",
    // },
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
              onClick={async () => {
                updatePhoneStatus({
                  customerId: customer._id,
                  phoneStatus: !customer.isPhoneVerified,
                });
                await refetch();
              }}
            >
              {customer.isPhoneVerified ? "Unverify" : "Verify"}
            </Button>
            <Button
              variant={customer.isBlocked ? "outline" : "default"}
              size="sm"
              onClick={async () => {
                updateBlockStatus({
                  customerId: customer._id,
                  blockStatus: !customer.isBlocked,
                });
                await refetch();
              }}
            >
              {customer.isBlocked ? "Unblock" : "Block"}
            </Button>
          </div>
        );
      },
    },
  ];
}
