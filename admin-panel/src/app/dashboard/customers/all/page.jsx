"use client";

import React from "react";
import { useGetAllCustomers } from "../../../../hooks/useCustomer";
import { columns } from "../../../../components/tables/customer/columns";
import DataTable from "../../../../components/tables/customer/data-table";
import { Button } from "../../../../components/ui/button";
import { TableSkeleton } from "../../../../components/tables/skeleton/TableSkeleton";

const AllCustomers = () => {
  const { data, isPending, error } = useGetAllCustomers();

  if (isPending) return <TableSkeleton />;
  if (error)
    return <div className="p-4 text-red-500">Error loading customers</div>;

  const customers = data?.data || [];

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
