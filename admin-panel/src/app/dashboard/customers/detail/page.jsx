"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useGetCustomerDetail } from "../../../../hooks/useCustomer";
import { Badge } from "../../../../components/ui/badge";
import { Separator } from "../../../../components/ui/separator";
import { Skeleton } from "../../../../components/ui/skeleton";
import Image from "next/image";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "../../../../components/ui/avatar";
import { Button } from "../../../../components/ui/button";
import { ScrollArea } from "../../../../components/ui/scroll-area";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../../../components/ui/tabs";
import { VerifiedIcon, ClockIcon, MapPinIcon } from "lucide-react";

const DetailSection = ({ title, children, className = "" }) => (
  <div className={`space-y-4 ${className}`}>
    <h3 className="text-lg font-semibold flex items-center gap-2">{title}</h3>
    <div className="space-y-4 rounded-lg border p-6 bg-background">
      {children}
    </div>
  </div>
);

const LabelValue = ({ label, value, className = "" }) => (
  <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 py-2 ${className}`}>
    <span className="text-muted-foreground col-span-1">{label}</span>
    <span className="font-medium col-span-2">{value || "—"}</span>
  </div>
);

const CustomerDetail = () => {
  // State for image modal
  const [enlargedImage, setEnlargedImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch customer data
  const searchParams = useSearchParams();
  const customerId = searchParams.get("id");
  const { data, isPending, error } = useGetCustomerDetail(customerId);

  // Modal handlers
  const openImageModal = (imageUrl) => {
    setEnlargedImage(imageUrl);
    setIsModalOpen(true);
  };

  const closeImageModal = () => {
    setIsModalOpen(false);
    setEnlargedImage(null);
  };

  if (isPending || !data)
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-[30%]" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );

  const customer = data?.data;

  return (
    <>
      <ScrollArea className="h-full">
        <div className="p-6 space-y-8 max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={customer.profileImage} />
                <AvatarFallback>
                  {customer.fullName?.charAt(0) || "C"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold tracking-tight">
                  {customer.fullName}
                </h2>
                <p className="text-muted-foreground">
                  Customer since:{" "}
                  {new Date(customer.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge
                variant={customer.isPhoneVerified ? "default" : "secondary"}
              >
                {customer.isPhoneVerified ? (
                  <span className="flex items-center gap-1">
                    <VerifiedIcon className="h-4 w-4" />
                    Verified
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <ClockIcon className="h-4 w-4" />
                    Unverified
                  </span>
                )}
              </Badge>
              <Button variant="outline">Edit Profile</Button>
            </div>
          </div>

          <Separator />

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="location">Location</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Personal Information */}
              <DetailSection title="Personal Information">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <LabelValue label="Full Name" value={customer.fullName} />
                  <LabelValue label="Phone" value={customer.phone} />
                  <LabelValue label="Address" value={customer.address} />
                  <LabelValue label="City" value={customer.city} />
                </div>
              </DetailSection>

              {/* Profile Image */}
              {customer.profileImage && (
                <DetailSection title="Profile Image">
                  <div className="flex justify-center">
                    <div className="relative w-48 h-48 rounded-md overflow-hidden group">
                      <Image
                        src={customer.profileImage}
                        alt="Profile image"
                        fill
                        className="object-cover cursor-pointer"
                        onClick={() => openImageModal(customer.profileImage)}
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-white"
                          onClick={() => openImageModal(customer.profileImage)}
                        >
                          Enlarge
                        </Button>
                      </div>
                    </div>
                  </div>
                </DetailSection>
              )}
            </TabsContent>

            <TabsContent value="location" className="space-y-6">
              <DetailSection title="Location Details">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <LabelValue label="Address" value={customer.address} />
                  <LabelValue label="City" value={customer.city} />
                  {customer.location?.coordinates && (
                    <>
                      <LabelValue
                        label="Latitude"
                        value={customer.location.coordinates[1]}
                      />
                      <LabelValue
                        label="Longitude"
                        value={customer.location.coordinates[0]}
                      />
                    </>
                  )}
                </div>
                {customer.location?.coordinates && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center gap-2 text-blue-800">
                      <MapPinIcon className="h-5 w-5" />
                      <h4 className="font-medium">Map Location</h4>
                    </div>
                    <div className="mt-4 aspect-video bg-muted rounded-md flex items-center justify-center">
                      <Button variant="outline" className="gap-2">
                        <MapPinIcon className="h-4 w-4" />
                        View on Map
                      </Button>
                    </div>
                  </div>
                )}
              </DetailSection>
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>

      {/* Image Modal */}
      {isModalOpen && enlargedImage && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full max-h-[90vh]">
            <button
              onClick={closeImageModal}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
            <div className="relative w-full h-full">
              <Image
                src={enlargedImage}
                alt="Enlarged image"
                fill
                className="object-contain"
                unoptimized
              />
            </div>
            <div className="absolute bottom-4 left-0 right-0 flex justify-center">
              <Button
                variant="secondary"
                onClick={closeImageModal}
                className="shadow-lg"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CustomerDetail;
