"use client";

import React, { useState } from "react";
import { getServiceCategoryColumns } from "../../../components/tables/service-categories/columns";
import DataTable from "../../../components/tables/service-categories/data-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import { useForm } from "react-hook-form";
import { Label } from "../../../components/ui/label";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import {
  useGetAllServiceCategories,
  useCreateServiceCategory,
  useUpdateServiceCategory,
  useDeleteServiceCategory,
} from "../../../hooks/useServices";
import toast from "react-hot-toast";
import { Button } from "../../../components/ui/button";
import { Loader2, PencilIcon } from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import Image from "next/image";
import { TableSkeleton } from "../../../components/tables/skeleton/TableSkeleton";

const AllServiceCategories = () => {
  const { data, isPending, error } = useGetAllServiceCategories();
  const [modalState, setModalState] = useState({
    type: null,
    category: null,
    isOpen: false,
  });

  const form = useForm();
  const { mutateAsync: createMutation, isPending: isCreating } =
    useCreateServiceCategory();
  const { mutateAsync: updateMutation, isPending: isUpdating } =
    useUpdateServiceCategory();
  const { mutateAsync: deleteMutation, isPending: isDeleting } =
    useDeleteServiceCategory();

  const openModal = (type, category = null) => {
    setModalState({ type, category, isOpen: true });
    if (category) {
      form.reset({
        name: category.name,
        description: category.description,
        icon: category.icon,
      });
    } else {
      form.reset();
    }
  };

  const closeModal = () => {
    setModalState({ type: null, category: null, isOpen: false });
    form.reset();
  };

  const onSubmit = async (data) => {
    const formData = new FormData();

    // Append text fields
    formData.append("name", data.name?.trim() || "");
    if (data.description) {
      formData.append("description", data.description.trim());
    }

    // Append file if it exists
    if (data.iconFile) {
      formData.append("icon", data.iconFile);
    }

    try {
      if (modalState.type === "create") {
        await createMutation(formData);
      } else if (modalState.type === "edit") {
        await updateMutation({
          categoryId: modalState.category._id,
          formData,
        });
      }
      closeModal();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMutation(modalState.category._id);
      closeModal();
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (isPending) return <TableSkeleton />;
  if (error)
    return <div className="p-4 text-red-500">Error loading categories</div>;

  const categories = data?.data || [];

  const columns = getServiceCategoryColumns(openModal);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Service Categories</h2>
      </div>
      <DataTable columns={columns} data={categories} openModal={openModal} />

      {/* View Modal */}
      <Dialog
        open={modalState.isOpen && modalState.type === "view"}
        onOpenChange={closeModal}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              {modalState.category?.name}
              <Badge variant="outline" className="text-sm font-normal">
                ID: {modalState.category?._id}
              </Badge>
            </DialogTitle>
            <DialogDescription>
              View category details and icon
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Description Section */}
            <div className="space-y-2">
              <Label className="text-base">Description</Label>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-muted-foreground">
                  {modalState.category?.description || (
                    <span className="italic text-muted-foreground/70">
                      No description provided
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Icon Section */}
            {modalState.category?.icon && (
              <div className="space-y-2">
                <Label className="text-base">Icon</Label>
                <div className="flex flex-col items-start gap-3">
                  <div className="relative h-32 w-32 border rounded-lg overflow-hidden bg-muted/50">
                    <Image
                      src={modalState.category.icon}
                      alt="Category icon"
                      fill
                      className="object-contain p-2"
                      unoptimized
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                closeModal();
                openModal("edit", modalState.category);
              }}
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Edit Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Modal */}
      <Dialog
        open={
          modalState.isOpen &&
          (modalState.type === "create" || modalState.type === "edit")
        }
        onOpenChange={closeModal}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {modalState.type === "create"
                ? "Create New Category"
                : "Edit Category"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="name">Name*</Label>
              <Input
                id="name"
                {...form.register("name", { required: "Name is required" })}
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" {...form.register("description")} />
            </div>
            <div>
              <Label htmlFor="icon">Icon</Label>
              {/* Current icon preview (only in edit mode) */}
              {modalState.type === "edit" && modalState.category?.icon && (
                <div className="mb-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    Current Icon:
                  </p>
                  <img
                    src={modalState.category.icon}
                    alt="Current category icon"
                    className="h-16 w-16 object-contain border rounded-md"
                  />
                </div>
              )}

              {/* File input */}
              <Input
                id="icon"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    form.setValue("iconFile", file);
                    // Create preview URL
                    form.setValue("iconPreview", URL.createObjectURL(file));
                  }
                }}
              />
              {/* Preview of new selected image */}
              {form.watch("iconPreview") && (
                <div className="mt-2">
                  <p className="text-sm text-muted-foreground">
                    New Icon Preview:
                  </p>
                  <img
                    src={form.watch("iconPreview")}
                    alt="New icon preview"
                    className="h-16 w-16 object-contain border rounded-md mt-1"
                  />
                </div>
              )}
              {/* Hidden field to store the file */}
              <input type="hidden" {...form.register("iconFile")} />
              <input type="hidden" {...form.register("iconPreview")} />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isCreating || isUpdating}>
                {(isCreating || isUpdating) && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                {modalState.type === "create" ? "Create" : "Update"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        open={modalState.isOpen && modalState.type === "delete"}
        onOpenChange={closeModal}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{modalState.category?.name}"?
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AllServiceCategories;
