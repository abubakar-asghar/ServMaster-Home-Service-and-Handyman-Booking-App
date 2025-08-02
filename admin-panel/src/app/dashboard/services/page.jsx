// app/dashboard/services/page.jsx
"use client";

import React, { useState } from "react";
import { getServiceColumns } from "../../../components/tables/services/columns";
import DataTable from "../../../components/tables/services/data-table";
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
  useGetAllServices,
  useCreateService,
  useUpdateService,
  useDeleteService,
  useGetAllServiceCategories,
} from "../../../hooks/useServices";
import toast from "react-hot-toast";
import { Button } from "../../../components/ui/button";
import { Loader2, PencilIcon } from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { TableSkeleton } from "../../../components/tables/skeleton/TableSkeleton";

const AllServices = () => {
  const {
    data: servicesData,
    isPending: isServicesPending,
    error: servicesError,
  } = useGetAllServices();
  const { data: categoriesData } = useGetAllServiceCategories();
  const [modalState, setModalState] = useState({
    type: null,
    service: null,
    isOpen: false,
  });

  const form = useForm();
  const { mutateAsync: createMutation, isPending: isCreating } =
    useCreateService();
  const { mutateAsync: updateMutation, isPending: isUpdating } =
    useUpdateService();
  const { mutateAsync: deleteMutation, isPending: isDeleting } =
    useDeleteService();

  const openModal = (type, service = null) => {
    setModalState({ type, service, isOpen: true });
    if (service) {
      form.reset({
        name: service.name,
        description: service.description,
        parent_service: service.parent_service?._id,
      });
    } else {
      form.reset();
    }
  };

  const closeModal = () => {
    setModalState({ type: null, service: null, isOpen: false });
    form.reset();
  };

  const onSubmit = async (data) => {
    try {
      if (modalState.type === "create") {
        await createMutation(data);
      } else if (modalState.type === "edit") {
        await updateMutation({
          serviceId: modalState.service._id,
          ...data,
        });
      }
      closeModal();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMutation(modalState.service._id);
      closeModal();
    } catch (error) {
      toast.error(error.message);
    }
  };

  if (isServicesPending) return <TableSkeleton />;
  if (servicesError)
    return <div className="p-4 text-red-500">Error loading services</div>;

  const services = servicesData?.data || [];
  const categories = categoriesData?.data || [];

  const columns = getServiceColumns(openModal);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Services</h2>
      </div>
      <DataTable columns={columns} data={services} openModal={openModal} />

      {/* View Modal */}
      <Dialog
        open={modalState.isOpen && modalState.type === "view"}
        onOpenChange={closeModal}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              {modalState.service?.name}
              <Badge variant="outline" className="text-sm font-normal">
                ID: {modalState.service?._id}
              </Badge>
            </DialogTitle>
            <DialogDescription>View service details</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Category Section */}
            <div className="space-y-2">
              <Label className="text-base">Category</Label>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-muted-foreground">
                  {modalState.service?.parent_service?.name || (
                    <span className="italic text-muted-foreground/70">
                      No category assigned
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Description Section */}
            <div className="space-y-2">
              <Label className="text-base">Description</Label>
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-muted-foreground">
                  {modalState.service?.description || (
                    <span className="italic text-muted-foreground/70">
                      No description provided
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                closeModal();
                openModal("edit", modalState.service);
              }}
            >
              <PencilIcon className="h-4 w-4 mr-2" />
              Edit Service
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
                ? "Create New Service"
                : "Edit Service"}
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
              <Label htmlFor="parent_service">Category*</Label>
              <Select
                onValueChange={(value) =>
                  form.setValue("parent_service", value)
                }
                defaultValue={form.watch("parent_service")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category._id} value={category._id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.parent_service && (
                <p className="text-sm text-red-500">
                  {form.formState.errors.parent_service.message}
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" {...form.register("description")} />
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
            <DialogTitle>Delete Service</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{modalState.service?.name}"? This
              action cannot be undone.
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

export default AllServices;
