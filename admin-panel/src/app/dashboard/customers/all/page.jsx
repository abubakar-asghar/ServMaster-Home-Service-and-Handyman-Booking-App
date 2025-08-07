"use client";

import React from "react";
import {
  useGetAllCustomers,
  useUpdateCustomerBlockStatus,
  useUpdateCustomerPhoneVerification,
} from "../../../../hooks/useCustomer";
import { getCustomerColumns } from "../../../../components/tables/customer/columns";
import DataTable from "../../../../components/tables/customer/data-table";
import { Button } from "../../../../components/ui/button";
import { TableSkeleton } from "../../../../components/tables/skeleton/TableSkeleton";

const AllCustomers = () => {
  const { data, isPending, error, refetch } = useGetAllCustomers();

  const { mutateAsync: updatePhoneStatus } =
    useUpdateCustomerPhoneVerification();
  const { mutateAsync: updateBlockStatus } = useUpdateCustomerBlockStatus();

  if (isPending) return <TableSkeleton />;
  if (error)
    return <div className="p-4 text-red-500">Error loading customers</div>;

  const customers = data?.data || [];

  const columns = getCustomerColumns(
    updatePhoneStatus,
    updateBlockStatus,
    refetch
  );

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">All Customers</h2>
      </div>
      <DataTable columns={columns} data={customers} />
    </div>
  );
};

export default AllCustomers;
