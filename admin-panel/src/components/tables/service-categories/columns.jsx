import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { PencilIcon, TrashIcon, EyeIcon } from "lucide-react";
import Image from "next/image";

export function getServiceCategoryColumns(openModal) {
  return [
    {
      accessorKey: "icon",
      header: "Icon",
      cell: ({ row }) => {
        const iconUrl = row.getValue("icon");
        return iconUrl ? (
          <div className="relative h-10 w-10">
            <Image
              src={iconUrl}
              alt="Category icon"
              fill
              className="object-contain rounded-md"
              unoptimized // For external URLs
            />
          </div>
        ) : (
          <Badge variant="outline">No icon</Badge>
        );
      },
    },
    {
      accessorKey: "name",
      header: "Category Name",
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
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }) =>
        new Date(row.getValue("createdAt")).toLocaleDateString(),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => {
        const category = row.original;

        return (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => openModal("view", category)}
            >
              <EyeIcon className="h-4 w-4 mr-1" />
              View
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => openModal("edit", category)}
            >
              <PencilIcon className="h-4 w-4 mr-1" />
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => openModal("delete", category)}
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
