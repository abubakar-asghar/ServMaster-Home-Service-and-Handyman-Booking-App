import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { PencilIcon, TrashIcon, EyeIcon } from "lucide-react";

export function getServiceColumns(openModal) {
  return [
    {
      accessorKey: "name",
      header: "Service Name",
      cell: ({ row }) => (
        <div className="font-medium">{row.getValue("name")}</div>
      ),
    },
    {
      accessorKey: "description",
      header: "Description",
      cell: ({ row }) => (
        <div className="text-muted-foreground line-clamp-2">
          {row.getValue("description") || "No description"}
        </div>
      ),
    },
    {
      accessorKey: "parent_service.name",
      header: "Category",
      cell: ({ row }) => (
        <div className="font-medium">
          {row.original.parent_service?.name || "Uncategorized"}
        </div>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Created At",
      cell: ({ row }) =>
        new Date(row.getValue("created_at")).toLocaleDateString(),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const service = row.original;

        return (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => openModal("view", service)}
            >
              <EyeIcon className="h-4 w-4 mr-1" />
              View
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => openModal("edit", service)}
            >
              <PencilIcon className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => openModal("delete", service)}
            >
              <TrashIcon className="h-4 w-4 mr-1" />
              Delete
            </Button>
          </div>
        );
      },
    },
  ];
}
