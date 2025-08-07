"use client";

import React from "react";
import { useGetAllServiceProviders } from "../../../../hooks/useProvider";
import { getServiceProvidersColumns } from "../../../../components/tables/service-provider/columns";
import DataTable from "../../../../components/tables/service-provider/data-table";
import { Button } from "../../../../components/ui/button";
import { TableSkeleton } from "../../../../components/tables/skeleton/TableSkeleton";

const AllServiceProviders = () => {
  const { data, isPending, error } = useGetAllServiceProviders();

  if (isPending) return <TableSkeleton />;
  if (error)
    return <div className="p-4 text-red-500">Error loading providers</div>;

  const providers = data?.data || [];
  const columns = getServiceProvidersColumns();
  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">All Service Providers</h2>
      </div>
      <DataTable columns={columns} data={providers} />
    </div>
  );
};

export default AllServiceProviders;
