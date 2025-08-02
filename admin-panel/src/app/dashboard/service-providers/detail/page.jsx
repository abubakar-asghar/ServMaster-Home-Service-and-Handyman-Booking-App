"use client";

import React, { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useGetServiceProviderDetail } from "../../../../hooks/useProvider";
import { Separator } from "../../../../components/ui/separator";
import { Input } from "../../../../components/ui/input";
import { Label } from "../../../../components/ui/label";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../../../components/ui/dialog";
import { Textarea } from "../../../../components/ui/textarea";
import { Badge } from "../../../../components/ui/badge";
import { Skeleton } from "../../../../components/ui/skeleton";
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
import Image from "next/image";
import {
  VerifiedIcon,
  ClockIcon,
  XIcon,
  CheckIcon,
  CheckCircle,
  Phone,
  ShieldCheck,
  Briefcase,
  UserCheck,
  AlertCircle,
  ChevronRight,
  Download,
  ZoomIn,
  Loader2,
  Power,
  PowerOff,
} from "lucide-react";
import { useUpdateVerificationStatus } from "../../../../hooks/useProvider";
import toast from "react-hot-toast";

// Reusable Components
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

const VerificationBadge = ({ status, type }) => {
  const statusMap = {
    verified: {
      variant: "default",
      icon: <VerifiedIcon className="h-4 w-4" />,
      text: "Verified",
    },
    pending: {
      variant: "secondary",
      icon: <ClockIcon className="h-4 w-4" />,
      text: "Pending",
    },
    submitted: {
      variant: "secondary",
      icon: <CheckCircle className="h-4 w-4" />,
      text: "Submitted",
    },
    rejected: {
      variant: "destructive",
      icon: <XIcon className="h-4 w-4" />,
      text: "Rejected",
    },
    default: {
      variant: "outline",
      icon: null,
      text: "Not Submitted",
    },
  };

  const currentStatus = status
    ? statusMap[status] || statusMap.default
    : statusMap.default;

  return (
    <div className="flex items-center gap-2">
      <Badge variant={currentStatus.variant} className="gap-1 capitalize">
        {currentStatus.icon}
        {currentStatus.text}
      </Badge>
      <span className="text-sm text-muted-foreground">{type}</span>
    </div>
  );
};

const DocumentPreview = ({ src, label, onPreview }) => {
  if (!src) {
    return (
      <div className="flex flex-col items-center justify-center h-48 bg-muted rounded-md gap-2">
        <AlertCircle className="h-6 w-6 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Document not uploaded</p>
      </div>
    );
  }

  return (
    <div className="border rounded-md overflow-hidden group relative aspect-[4/3]">
      <Image src={src} alt={label} fill className="object-cover" />
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/10"
          onClick={() => onPreview(src)}
        >
          <ZoomIn className="h-4 w-4 mr-1" />
          Enlarge
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="text-white hover:bg-white/10"
          asChild
        >
          <a href={src} download target="_blank" rel="noopener noreferrer">
            <Download className="h-4 w-4 mr-1" />
            Download
          </a>
        </Button>
      </div>
    </div>
  );
};

// Main Component
const ServiceProviderDetail = () => {
  const searchParams = useSearchParams();
  const providerId = searchParams.get("id");

  // State
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [isApproveAccountOpen, setIsApproveAccountOpen] = useState(false);
  const [isRejectAccountOpen, setIsRejectAccountOpen] = useState(false);
  const [isRejectIdentityOpen, setIsRejectIdentityOpen] = useState(false);
  const [isRejectProfessionalOpen, setIsRejectProfessionalOpen] =
    useState(false);
  const [enlargedImage, setEnlargedImage] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [activeVerification, setActiveVerification] = useState({
    type: null,
    status: null,
  });

  const { data, isLoading, refetch } = useGetServiceProviderDetail(providerId);
  const { mutateAsync: updateVerification, isUpdating } =
    useUpdateVerificationStatus();

  // Handlers
  const handlePreviewImage = (imageUrl) => {
    setEnlargedImage(imageUrl);
  };

  const handleVerificationAction = async (type, status, reason = "") => {
    try {
      await updateVerification({
        providerId,
        updateType: type,
        ...(type === "account" && { accountStatus: status }),
        ...(type === "phone" && { isPhoneVerified: status === "verified" }),
        ...(type === "identity" && { identityStatus: status }),
        ...(type === "professional" && { professionalStatus: status }),
        ...(reason && { rejectionReason: reason }),
      });

      toast.success(`Verification ${status} successfully`);
      setActiveVerification({ type: null, status: null });
      setRejectionReason("");
      refetch();
    } catch (error) {
      toast.error(error.message || "Failed to update verification");
    }
  };

  if (isLoading || !data) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-8 w-[30%]" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  const provider = data.data;

  const renderStatusActions = () => {
    switch (provider.accountStatus) {
      case "pending":
        return (
          <>
            <Dialog
              open={isStatusDialogOpen}
              onOpenChange={setIsStatusDialogOpen}
            >
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setActiveVerification({
                      type: "account",
                      status: "verified",
                    })
                  }
                >
                  <CheckIcon className="h-4 w-4 mr-1" />
                  Approve Account
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Approve Service Provider Account</DialogTitle>
                  <DialogDescription>
                    This will verify the provider's account and grant full
                    access to the platform.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <p className="text-sm">
                    Are you sure you want to approve this account? This action
                    will:
                  </p>
                  <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
                    <li>Mark the account as verified</li>
                    <li>Grant full access to the platform</li>
                  </ul>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsStatusDialogOpen(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      handleVerificationAction("account", "verified");
                      setIsStatusDialogOpen(false);
                    }}
                  >
                    Confirm Approval
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog
              open={isRejectDialogOpen}
              onOpenChange={setIsRejectDialogOpen}
            >
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setActiveVerification({
                      type: "account",
                      status: "rejected",
                    })
                  }
                >
                  <XIcon className="h-4 w-4 mr-1" />
                  Reject Account
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Reject Service Provider Account</DialogTitle>
                  <DialogDescription>
                    Please provide a reason for rejecting this account.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="rejectionReason">
                      Reason for Rejection
                    </Label>
                    <Textarea
                      id="rejectionReason"
                      placeholder="Enter reason for rejection..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setRejectionReason("");
                      setIsRejectDialogOpen(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() =>
                      handleVerificationAction(
                        "account",
                        "rejected",
                        rejectionReason
                      )
                    }
                    disabled={!rejectionReason || isUpdating("account")}
                  >
                    {isUpdating("account") ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Rejecting...
                      </>
                    ) : (
                      <>Confirm Rejection</>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        );
      case "verified":
        return (
          <>
            <Dialog
              open={isStatusDialogOpen}
              onOpenChange={setIsStatusDialogOpen}
            >
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setActiveVerification({
                      type: "account",
                      status: "inactive",
                    })
                  }
                >
                  <PowerOff className="h-4 w-4 mr-1" />
                  Mark as Inactive
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Mark Account as Inactive</DialogTitle>
                  <DialogDescription>
                    This will mark the account as inactive. The provider won't
                    be able to receive new bookings.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <p className="text-sm">
                    Are you sure you want to mark this account as inactive?
                  </p>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsStatusDialogOpen(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      handleVerificationAction("account", "inactive");
                      setIsStatusDialogOpen(false);
                    }}
                  >
                    Confirm
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog
              open={isRejectDialogOpen}
              onOpenChange={setIsRejectDialogOpen}
            >
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setActiveVerification({
                      type: "account",
                      status: "suspended",
                    })
                  }
                >
                  <XIcon className="h-4 w-4 mr-1" />
                  Suspend Account
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Suspend Service Provider Account</DialogTitle>
                  <DialogDescription>
                    Please provide a reason for suspending this account.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="rejectionReason">
                      Reason for Suspension
                    </Label>
                    <Textarea
                      id="rejectionReason"
                      placeholder="Enter reason for suspension..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setRejectionReason("");
                      setIsRejectDialogOpen(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() =>
                      handleVerificationAction(
                        "account",
                        "suspended",
                        rejectionReason
                      )
                    }
                    disabled={!rejectionReason || isUpdating("account")}
                  >
                    {isUpdating("account") ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Suspending...
                      </>
                    ) : (
                      <>Confirm Suspension</>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        );
      case "inactive":
        return (
          <>
            <Dialog
              open={isStatusDialogOpen}
              onOpenChange={setIsStatusDialogOpen}
            >
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setActiveVerification({
                      type: "account",
                      status: "verified",
                    })
                  }
                >
                  <Power className="h-4 w-4 mr-1" />
                  Mark as Active
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Reactivate Account</DialogTitle>
                  <DialogDescription>
                    This will mark the account as active and allow the provider
                    to receive bookings again.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                  <p className="text-sm">
                    Are you sure you want to reactivate this account?
                  </p>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsStatusDialogOpen(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => {
                      handleVerificationAction("account", "verified");
                      setIsStatusDialogOpen(false);
                    }}
                  >
                    Confirm
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Dialog
              open={isRejectDialogOpen}
              onOpenChange={setIsRejectDialogOpen}
            >
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setActiveVerification({
                      type: "account",
                      status: "suspended",
                    })
                  }
                >
                  <XIcon className="h-4 w-4 mr-1" />
                  Suspend Account
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Suspend Service Provider Account</DialogTitle>
                  <DialogDescription>
                    Please provide a reason for suspending this account.
                  </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="rejectionReason">
                      Reason for Suspension
                    </Label>
                    <Textarea
                      id="rejectionReason"
                      placeholder="Enter reason for suspension..."
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setRejectionReason("");
                      setIsRejectDialogOpen(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() =>
                      handleVerificationAction(
                        "account",
                        "suspended",
                        rejectionReason
                      )
                    }
                    disabled={!rejectionReason || isUpdating("account")}
                  >
                    {isUpdating("account") ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Suspending...
                      </>
                    ) : (
                      <>Confirm Suspension</>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </>
        );
      case "suspended":
        return (
          <Dialog
            open={isStatusDialogOpen}
            onOpenChange={setIsStatusDialogOpen}
          >
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setActiveVerification({ type: "account", status: "verified" })
                }
              >
                <CheckIcon className="h-4 w-4 mr-1" />
                Reinstate Account
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Reinstate Service Provider Account</DialogTitle>
                <DialogDescription>
                  This will restore the provider's account and grant full access
                  to the platform.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <p className="text-sm">
                  Are you sure you want to reinstate this account?
                </p>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsStatusDialogOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    handleVerificationAction("account", "verified");
                    setIsStatusDialogOpen(false);
                  }}
                >
                  Confirm
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        );
      case "rejected":
        return (
          <Dialog
            open={isStatusDialogOpen}
            onOpenChange={setIsStatusDialogOpen}
          >
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setActiveVerification({ type: "account", status: "verified" })
                }
              >
                <CheckIcon className="h-4 w-4 mr-1" />
                Approve Account
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Approve Previously Rejected Account</DialogTitle>
                <DialogDescription>
                  This will verify the provider's account despite previous
                  rejection.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <p className="text-sm">
                  Are you sure you want to approve this previously rejected
                  account?
                </p>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsStatusDialogOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    handleVerificationAction("account", "verified");
                    setIsStatusDialogOpen(false);
                  }}
                >
                  Confirm Approval
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <ScrollArea className="h-full">
        <div className="p-6 space-y-8 max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={provider.profileImage} />
                <AvatarFallback>
                  {provider.fullName?.charAt(0) || "SP"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold tracking-tight">
                  {provider.fullName}
                </h2>
                <p className="text-muted-foreground">
                  {provider.businessInfo?.name || "Service Provider"}
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Badge
                variant={
                  provider.accountStatus === "verified"
                    ? "default"
                    : provider.accountStatus === "suspended"
                    ? "destructive"
                    : provider.accountStatus === "rejected"
                    ? "destructive"
                    : "secondary"
                }
                className="capitalize"
              >
                {provider.accountStatus}
              </Badge>
              <Button variant="outline" size="sm">
                Edit Profile
              </Button>
            </div>
          </div>

          <div className="flex gap-2">{renderStatusActions()}</div>

          <Separator />

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="services">Services</TabsTrigger>
              <TabsTrigger value="verification">Verification</TabsTrigger>
              <TabsTrigger value="documents">Documents</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Personal Information */}
              <DetailSection title="Personal Information">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <LabelValue label="Full Name" value={provider.fullName} />
                  <LabelValue
                    label="Phone"
                    value={
                      <div className="flex items-center gap-2">
                        {provider.phone}
                        {provider.isPhoneVerified ? (
                          <Badge variant="default" className="gap-1">
                            <CheckIcon className="h-3 w-3" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="outline">Not Verified</Badge>
                        )}
                      </div>
                    }
                  />
                  <LabelValue
                    label="Email"
                    value={provider.personalInfo?.email}
                  />
                  <LabelValue
                    label="WhatsApp"
                    value={provider.personalInfo?.whatsapp}
                  />
                  <LabelValue
                    label="Gender"
                    value={
                      provider.personalInfo?.gender &&
                      provider.personalInfo.gender
                        .split("_")
                        .map(
                          (word) => word.charAt(0).toUpperCase() + word.slice(1)
                        )
                        .join(" ")
                    }
                  />
                </div>
              </DetailSection>

              {/* Business Information */}
              <DetailSection title="Business Information">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <LabelValue
                    label="Business Type"
                    value={
                      <Badge variant="outline" className="capitalize">
                        {provider.businessInfo?.type === "individual"
                          ? "Individual"
                          : "Registered Business"}
                      </Badge>
                    }
                  />
                  <LabelValue
                    label="Business Name"
                    value={provider.businessInfo?.name}
                  />
                  <LabelValue
                    label="Description"
                    value={provider.businessInfo?.description}
                  />
                  <LabelValue
                    label="City"
                    value={provider.businessInfo?.city}
                  />
                  <LabelValue
                    label="Address"
                    value={provider.businessInfo?.address}
                  />
                  <LabelValue
                    label="Working Hours"
                    value={
                      provider.businessInfo?.workingHours?.startTime &&
                      provider.businessInfo?.workingHours?.endTime
                        ? `${provider.businessInfo.workingHours.startTime} - ${provider.businessInfo.workingHours.endTime}`
                        : "Not specified"
                    }
                  />
                  <LabelValue
                    label="Working Days"
                    value={
                      provider.businessInfo?.workingDays?.length > 0
                        ? provider.businessInfo.workingDays
                            .map(
                              (day) =>
                                day.charAt(0).toUpperCase() + day.slice(1)
                            )
                            .join(", ")
                        : "Not specified"
                    }
                  />
                </div>
              </DetailSection>
            </TabsContent>

            <TabsContent value="services" className="space-y-6">
              <DetailSection title="Services Offered">
                {provider.selectedServices?.length > 0 ? (
                  <div className="space-y-6">
                    {provider.selectedServices.map((group, index) => (
                      <div
                        key={index}
                        className="space-y-4 border-b pb-6 last:border-b-0 last:pb-0"
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium text-lg">
                            {group.category?.name || "Uncategorized Services"}
                          </h4>
                          <span className="text-sm text-muted-foreground">
                            {group.services?.length || 0} services
                          </span>
                        </div>
                        <div className="space-y-3">
                          {group.services?.map((service, idx) => (
                            <div
                              key={idx}
                              className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-muted/50 rounded-lg"
                            >
                              <div className="space-y-1">
                                <p className="font-medium">
                                  {service.service?.name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {service.pricing?.notes ||
                                    "No additional notes"}
                                </p>
                              </div>
                              <div className="flex items-center">
                                <Badge variant="outline" className="capitalize">
                                  {service.pricing?.type?.replace("_", " ") ||
                                    "Not specified"}
                                </Badge>
                              </div>
                              <div className="flex items-center">
                                {service.pricing?.amount ? (
                                  <span className="font-medium">
                                    {service.pricing.amount}{" "}
                                    {service.pricing?.currency || "PKR"}
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground">
                                    Negotiable
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center justify-end">
                                <Button variant="ghost" size="sm">
                                  View Details
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 gap-2">
                    <p className="text-muted-foreground">
                      No services selected
                    </p>
                    <Button variant="outline" size="sm">
                      Assign Services
                    </Button>
                  </div>
                )}
              </DetailSection>
            </TabsContent>

            <TabsContent value="verification" className="space-y-6">
              <DetailSection title="Verification Status">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Account Status */}
                  {/* <div className="space-y-4">
                    <h4 className="font-medium">Account Status</h4>
                    <VerificationBadge
                      status={provider.accountStatus}
                      type="Account"
                    />
                    <div className="flex gap-2 flex-wrap">
                      <Dialog
                        open={isApproveAccountOpen}
                        onOpenChange={setIsApproveAccountOpen}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setActiveVerification({
                                type: "account",
                                status: "verified",
                              })
                            }
                          >
                            <CheckIcon className="h-4 w-4 mr-1" />
                            Approve Account
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>
                              Approve Service Provider Account
                            </DialogTitle>
                            <DialogDescription>
                              This will verify the provider's account and grant
                              full access to the platform.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="py-4">
                            <p className="text-sm">
                              Are you sure you want to approve this account?
                              This action will:
                            </p>
                            <ul className="list-disc pl-5 mt-2 space-y-1 text-sm">
                              <li>Mark the account as verified</li>
                              <li>
                                Automatically verify phone, identity and
                                professional status
                              </li>
                              <li>Grant full access to the platform</li>
                            </ul>
                          </div>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setActiveVerification({
                                  type: null,
                                  status: null,
                                });
                                setIsApproveAccountOpen(false);
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              onClick={() => {
                                handleVerificationAction("account", "verified");
                                setIsApproveAccountOpen(false);
                              }}
                            >
                              Confirm Approval
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <Dialog
                        open={isRejectAccountOpen}
                        onOpenChange={setIsRejectAccountOpen}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setActiveVerification({
                                type: "account",
                                status: "suspend",
                              })
                            }
                          >
                            <XIcon className="h-4 w-4 mr-1" />
                            Suspened Account
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>
                              Reject Service Provider Account
                            </DialogTitle>
                            <DialogDescription>
                              Please provide a reason for rejecting this
                              account.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="py-4 space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="rejectionReason">
                                Reason for Rejection
                              </Label>
                              <Textarea
                                id="rejectionReason"
                                placeholder="Enter reason for rejection..."
                                value={rejectionReason}
                                onChange={(e) =>
                                  setRejectionReason(e.target.value)
                                }
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setActiveVerification({
                                  type: null,
                                  status: null,
                                });
                                setRejectionReason("");
                                setIsRejectAccountOpen(false);
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() =>
                                handleVerificationAction(
                                  "account",
                                  "rejected",
                                  rejectionReason
                                )
                              }
                              disabled={
                                !rejectionReason || isUpdating("account")
                              }
                            >
                              {isUpdating("account") ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Rejecting...
                                </>
                              ) : (
                                <>Confirm Rejection</>
                              )}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div> */}

                  {/* Phone Verification */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Phone Verification</h4>
                    <VerificationBadge
                      status={provider.isPhoneVerified ? "verified" : "pending"}
                      type="Phone"
                    />
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleVerificationAction("phone", "verified")
                        }
                        disabled={
                          provider.isPhoneVerified || isUpdating("phone")
                        }
                      >
                        {isUpdating("phone") ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Verifying...
                          </>
                        ) : (
                          <>
                            <CheckIcon className="h-4 w-4 mr-1" />
                            Verify Phone
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Identity Verification */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Identity Verification</h4>
                    <VerificationBadge
                      status={provider.verification?.identity?.status}
                      type="CNIC"
                    />
                    {provider.verification?.identity?.cnicNumber && (
                      <LabelValue
                        label="CNIC Number"
                        value={provider.verification.identity.cnicNumber}
                        className="mt-2"
                      />
                    )}
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleVerificationAction("identity", "verified")
                        }
                        disabled={
                          provider.verification?.identity?.status ===
                            "verified" || isUpdating("identity")
                        }
                      >
                        {isUpdating("identity") ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Approving...
                          </>
                        ) : (
                          <>
                            <CheckIcon className="h-4 w-4 mr-1" />
                            Approve ID
                          </>
                        )}
                      </Button>

                      <Dialog
                        open={isRejectIdentityOpen}
                        onOpenChange={setIsRejectIdentityOpen}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setActiveVerification({
                                type: "identity",
                                status: "rejected",
                              })
                            }
                            disabled={!provider.verification?.identity?.status}
                          >
                            <XIcon className="h-4 w-4 mr-1" />
                            Reject ID
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>
                              Reject Identity Verification
                            </DialogTitle>
                            <DialogDescription>
                              Please provide a reason for rejecting this
                              identity verification.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="py-4 space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="rejectionReason">
                                Reason for Rejection
                              </Label>
                              <Textarea
                                id="rejectionReason"
                                placeholder="Enter reason for rejection..."
                                value={rejectionReason}
                                onChange={(e) =>
                                  setRejectionReason(e.target.value)
                                }
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setActiveVerification({
                                  type: null,
                                  status: null,
                                });
                                setRejectionReason("");
                                setIsRejectIdentityOpen(false);
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() =>
                                handleVerificationAction(
                                  "identity",
                                  "rejected",
                                  rejectionReason
                                )
                              }
                              disabled={
                                !rejectionReason || isUpdating("identity")
                              }
                            >
                              {isUpdating("identity") ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Rejecting...
                                </>
                              ) : (
                                <>Confirm Rejection</>
                              )}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>

                  {/* Professional Verification */}
                  <div className="space-y-4">
                    <h4 className="font-medium">Professional Verification</h4>
                    <VerificationBadge
                      status={provider.verification?.professional?.status}
                      type="Professional"
                    />
                    {provider.verification?.professional?.experienceYears && (
                      <LabelValue
                        label="Experience"
                        value={`${provider.verification.professional.experienceYears} years`}
                        className="mt-2"
                      />
                    )}
                    <div className="flex gap-2 flex-wrap">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleVerificationAction("professional", "verified")
                        }
                        disabled={
                          provider.verification?.professional?.status ===
                            "verified" || isUpdating("professional")
                        }
                      >
                        {isUpdating("professional") ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Approving...
                          </>
                        ) : (
                          <>
                            <CheckIcon className="h-4 w-4 mr-1" />
                            Approve Professional
                          </>
                        )}
                      </Button>

                      <Dialog
                        open={isRejectProfessionalOpen}
                        onOpenChange={setIsRejectProfessionalOpen}
                      >
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              setActiveVerification({
                                type: "professional",
                                status: "rejected",
                              })
                            }
                            disabled={
                              !provider.verification?.professional?.status ||
                              isUpdating("professional")
                            }
                          >
                            <XIcon className="h-4 w-4 mr-1" />
                            Reject Professional
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>
                              Reject Professional Verification
                            </DialogTitle>
                            <DialogDescription>
                              Please provide a reason for rejecting this
                              professional verification.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="py-4 space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="rejectionReason">
                                Reason for Rejection
                              </Label>
                              <Textarea
                                id="rejectionReason"
                                placeholder="Enter reason for rejection..."
                                value={rejectionReason}
                                onChange={(e) =>
                                  setRejectionReason(e.target.value)
                                }
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              variant="outline"
                              onClick={() => {
                                setActiveVerification({
                                  type: null,
                                  status: null,
                                });
                                setRejectionReason("");
                                setIsRejectProfessionalOpen(false);
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() =>
                                handleVerificationAction(
                                  "professional",
                                  "rejected",
                                  rejectionReason
                                )
                              }
                              disabled={
                                !rejectionReason || isUpdating("professional")
                              }
                            >
                              {isUpdating("professional") ? (
                                <>
                                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                  Rejecting...
                                </>
                              ) : (
                                <>Confirm Rejection</>
                              )}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </div>
              </DetailSection>
            </TabsContent>

            <TabsContent value="documents" className="space-y-6">
              {/* Identity Documents */}
              <DetailSection title="Identity Verification Documents">
                {/* CNIC Info */}
                <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="font-medium text-blue-800">
                        CNIC Information
                      </h4>
                      {provider.verification?.identity?.cnicNumber ? (
                        <p className="text-lg font-mono font-bold mt-1">
                          {provider.verification.identity.cnicNumber}
                        </p>
                      ) : (
                        <p className="text-muted-foreground">Not provided</p>
                      )}
                    </div>
                    <VerificationBadge
                      status={provider.verification?.identity?.status}
                      type="Status"
                    />
                  </div>
                </div>

                {/* Document Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {[
                    { key: "selfie", label: "Selfie" },
                    { key: "cnicFront", label: "CNIC Front Side" },
                    { key: "cnicBack", label: "CNIC Back Side" },
                  ].map(({ key, label }) => (
                    <div key={key} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{label}</p>
                        {!provider.verification?.identity?.[key] && (
                          <Badge variant="outline" className="text-xs">
                            Missing
                          </Badge>
                        )}
                      </div>
                      <DocumentPreview
                        src={provider.verification?.identity?.[key]}
                        label={label}
                        onPreview={handlePreviewImage}
                      />
                    </div>
                  ))}
                </div>
              </DetailSection>

              {/* Professional Documents */}
              {provider.verification?.professional?.certification && (
                <DetailSection title="Professional Certification">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border p-4 rounded-lg hover:shadow-sm transition-shadow">
                      <h4 className="font-medium flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-yellow-500" />
                        {provider.verification.professional.certification
                          .name || "Professional Certification"}
                      </h4>
                      <div className="grid grid-cols-2 gap-4 mt-3">
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Organization
                          </p>
                          <p className="font-medium mt-1">
                            {provider.verification.professional.certification
                              .issuingOrganization || "—"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Year Obtained
                          </p>
                          <p className="font-medium mt-1">
                            {provider.verification.professional.certification
                              .yearObtained || "—"}
                          </p>
                        </div>
                      </div>
                      {provider.verification.professional.certification
                        .document && (
                        <div className="mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            asChild
                          >
                            <a
                              href={
                                provider.verification.professional.certification
                                  .document
                              }
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <Download className="h-4 w-4 mr-2" />
                              View Certificate
                            </a>
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </DetailSection>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>

      {/* Image Preview Modal */}
      {enlargedImage && (
        <Dialog
          open={!!enlargedImage}
          onOpenChange={() => setEnlargedImage(null)}
        >
          <DialogContent className="max-w-[90vw] max-h-[90vh] p-0">
            <div className="relative w-full h-full aspect-video">
              <Image
                src={enlargedImage}
                alt="Enlarged document"
                fill
                className="object-contain"
                unoptimized={true}
                priority
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default ServiceProviderDetail;
