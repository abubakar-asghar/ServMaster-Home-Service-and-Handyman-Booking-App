import ServiceRequest from "../models/serviceRequest.model.js";
import Customer from "../models/customer.model.js";
import ServiceProvider from "../models/serviceProvider.model.js";
import asyncHandler from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";
import Chat from "../models/chat.model.js";
import Message from "../models/message.model.js";
import Review from "../models/review.model.js";

/**
 * @desc    Create a new service request
 * @route   POST /api/service-requests
 * @access  Private (Customer Only)
 */
export const createServiceRequest = asyncHandler(async (req, res, next) => {
  const {
    service_provider,
    service,
    address,
    pricing,
    city,
    state,
    location,
    scheduled_time,
    customer_notes,
  } = req.body;
  const customer = req.customer._id;

  console.log({
    customer,
    service_provider,
    service,
    pricing,
    address,
    scheduled_time,
    customer_notes,
    city,
    state,
  });

  if (!service_provider || !service || !address) {
    return next(
      new ErrorHandler(400, "Service provider and category are required")
    );
  }

  const serviceProvider = await ServiceProvider.findById(service_provider);
  if (!serviceProvider) {
    return next(new ErrorHandler(404, "Service provider not found"));
  }

  const newRequest = await ServiceRequest.create({
    customer,
    service_provider,
    service,
    pricing,
    address,
    city,
    state,
    location,
    scheduled_time,
    customer_notes,
  });

  await newRequest.populate([
    {
      path: "service_provider",
      select: "fullName phone",
    },
    {
      path: "service",
      select: "name icon",
    },
  ]);

  res.status(201).json({
    success: true,
    message: "Service request created successfully",
    data: newRequest,
  });
});

/**
 * @desc    Get all service requests for a customer
 * @route   GET /api/service-requests/customer
 * @access  Private (Customer Only)
 */
export const getCustomerRequests = asyncHandler(async (req, res, next) => {
  const customer = req.customer._id;

  const requests = await ServiceRequest.find({ customer })
    .sort({ createdAt: -1 })
    .populate("service_provider", "fullName phone")
    .populate("service", "name icon");

  res.status(200).json({ success: true, data: requests });
});

/**
 * @desc    Get all service requests for a service provider
 * @route   GET /api/service-requests/provider
 * @access  Private (Service Provider Only)
 */
export const getProviderRequests = asyncHandler(async (req, res, next) => {
  const service_provider = req.serviceProvider._id;

  const requests = await ServiceRequest.find({ service_provider })
    .sort({ createdAt: -1 })
    .populate("customer", "fullName phone")
    .populate("service", "name icon");

  res.status(200).json({ success: true, data: requests });
});

/**
 * @desc    Cancel Booking By Customer
 * @route   PUT /api/service-requests/:id/cancel
 * @access  Private (Customer Only)
 */
export const cancelBookingByCustomer = asyncHandler(async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason, reason_type } = req.body;
    const customerId = req.customer._id;

    // Validate input
    if (!reason || !reason_type) {
      return next(
        new ErrorHandler(
          400,
          "Cancellation reason and reason type are required"
        )
      );
    }

    const validReasonTypes = [
      "schedule_conflict",
      "found_another_provider",
      "no_longer_needed",
      "price_issue",
      "other",
    ];
    if (!validReasonTypes.includes(reason_type)) {
      return next(new ErrorHandler(400, "Invalid reason type"));
    }

    // Find the service request
    const serviceRequest = await ServiceRequest.findOne({
      _id: id,
      customer: customerId,
    });

    if (!serviceRequest) {
      return next(
        new ErrorHandler(404, "Service request not found or unauthorized")
      );
    }

    // Check if already cancelled or completed
    if (serviceRequest.status === "cancelled") {
      return next(new ErrorHandler(400, "Request is already cancelled"));
    }

    if (serviceRequest.status === "completed") {
      return next(new ErrorHandler(400, "Cannot cancel a completed request"));
    }

    // Update the service request
    serviceRequest.status = "cancelled";
    serviceRequest.cancellation = {
      cancelled_by: "Customer",
      reason,
      reason_type,
      cancelled_at: new Date(),
    };

    await serviceRequest.save();

    // // Optionally notify the service provider via chat
    // const chat = await Chat.findOne({
    //   participants: {
    //     $all: [
    //       { $elemMatch: { user: customerId, participantType: "Customer" } },
    //       {
    //         $elemMatch: {
    //           user: serviceRequest.service_provider,
    //           participantType: "ServiceProvider",
    //         },
    //       },
    //     ],
    //   },
    // });

    // if (chat) {
    //   const cancellationMsg = await Message.create({
    //     sender: customerId,
    //     senderType: "Customer",
    //     serviceRequest: serviceRequest._id,
    //     chat: chat._id,
    //     text: `Booking cancelled. Reason: ${reason}`,
    //   });

    //   chat.lastMessage = cancellationMsg._id;
    //   chat.messages.push(cancellationMsg._id);
    //   await chat.save();
    // }

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      data: serviceRequest,
    });
  } catch (error) {
    console.log(error.message);
  }
});

/**
 * @desc    Update the status of a service request
 * @route   PUT /api/service-requests/update-status/:id
 * @access  Private (Service Provider Only)
 */
export const updateServiceRequestStatus = asyncHandler(
  async (req, res, next) => {
    const {
      status,
      cancelled_by = "ServiceProvider",
      reason,
      reason_type,
    } = req.body;
    const requestId = req.params.id;

    console.log(status);
    const validStatuses = [
      "pending",
      "accepted",
      "completed",
      "cancelled",
      "declined",
    ];
    if (!validStatuses.includes(status)) {
      return next(new ErrorHandler(400, "Invalid status value"));
    }

    const serviceRequest = await ServiceRequest.findById(requestId);
    if (!serviceRequest) {
      return next(new ErrorHandler(404, "Service request not found"));
    }

    const customerId = serviceRequest.customer;
    const providerId = serviceRequest.service_provider;

    // ✅ Check permission
    if (
      serviceRequest.service_provider.toString() !==
      req.serviceProvider._id.toString()
    ) {
      return next(new ErrorHandler(403, "Unauthorized to update this request"));
    }

    if (serviceRequest.status === status) {
      return res.status(200).json({
        success: true,
        message: "No status change needed.",
        data: serviceRequest,
      });
    }

    // ✅ Require reason for cancellation
    if (status === "cancelled") {
      if (!reason || !reason_type || !cancelled_by) {
        return next(
          new ErrorHandler(
            400,
            "Cancellation reason, type, and who cancelled it are all required."
          )
        );
      }

      serviceRequest.cancellation = {
        cancelled_by,
        reason,
        reason_type,
        cancelled_at: new Date(),
      };
    }

    // ✅ Update request status
    serviceRequest.status = status;
    await serviceRequest.save();

    // ✅ Chat logic
    let chat = await Chat.findOne({
      participants: {
        $all: [
          { $elemMatch: { user: customerId, participantType: "Customer" } },
          {
            $elemMatch: {
              user: providerId,
              participantType: "ServiceProvider",
            },
          },
        ],
      },
    });

    // ✅ Handle "accepted" request
    if (status === "accepted") {
      if (!chat) {
        chat = await Chat.create({
          participants: [
            { user: customerId, participantType: "Customer" },
            { user: providerId, participantType: "ServiceProvider" },
          ],
        });
      }

      chat.isActive = true;
      chat.activeServiceRequest = serviceRequest._id;

      const msg = await Message.create({
        sender: providerId,
        senderType: "ServiceProvider",
        chat: chat._id,
        serviceRequest: serviceRequest._id,
        text: "Your service request has been accepted.",
      });

      chat.lastMessage = msg._id;
      chat.messages.push(msg._id);
      await chat.save();
    }

    // ✅ Handle completed / declined / cancelled
    if (["completed", "cancelled"].includes(status)) {
      if (chat) {
        // ✅ Check if any active "accepted" requests exist
        const hasOtherAccepted = await ServiceRequest.findOne({
          service_provider: providerId,
          customer: customerId,
          status: "accepted",
        });

        if (!hasOtherAccepted) {
          chat.isActive = false;
          chat.activeServiceRequest = null;
        }

        const msgTextMap = {
          completed: `Service has been marked as completed.`,
          cancelled: `Booking #${serviceRequest._id
            .toString()
            .slice(-6)
            .toUpperCase()} has been cancelled.`,
        };

        const msg = await Message.create({
          sender: providerId,
          senderType: "ServiceProvider",
          chat: chat._id,
          serviceRequest: serviceRequest._id,
          text: msgTextMap[status],
        });

        chat.lastMessage = msg._id;
        chat.messages.push(msg._id);
        chat.activeServiceRequest = hasOtherAccepted
          ? hasOtherAccepted._id
          : null;
        await chat.save();
      }
    }

    res.status(200).json({
      success: true,
      message: "Service request status updated successfully.",
      data: serviceRequest,
    });
  }
);

/**
 * @desc    Delete a service request (Only by customer)
 * @route   DELETE /api/service-requests/:id
 * @access  Private (Customer Only)
 */
export const deleteServiceRequest = asyncHandler(async (req, res, next) => {
  const requestId = req.params.id;
  const customer = req.customer._id;

  const serviceRequest = await ServiceRequest.findOne({
    _id: requestId,
    customer,
  });
  if (!serviceRequest) {
    return next(
      new ErrorHandler("Service request not found or unauthorized", 404)
    );
  }

  await serviceRequest.deleteOne();
  res
    .status(200)
    .json({ success: true, message: "Service request deleted successfully" });
});

/**
 * @desc    Get service request detail
 * @route   GET /api/service-requests/:id
 * @access  Private (Authenticated Users Only)
 */
export const getBookingDetails = asyncHandler(async (req, res, next) => {
  const requestId = req.params.id;

  const serviceRequest = await ServiceRequest.findById(requestId)
    .populate(
      "service_provider",
      "fullName phone profileImage businessInfo.address location"
    )
    .populate("service", "name icon")
    .populate("customer", "fullName phone profileImage");

  if (!serviceRequest) {
    return next(
      new ErrorHandler("Service request not found or unauthorized", 404)
    );
  }

  let review = null;

  if (
    serviceRequest.status.toString() === "completed" &&
    serviceRequest.hasReview
  ) {
    review = await Review.findOne({
      service_request: serviceRequest._id,
      customer: serviceRequest.customer._id,
    });
  }

  let bookingDetails = serviceRequest.toObject();

  if (review) {
    bookingDetails.review = review;
  }

  res.status(200).json({
    success: true,
    message: "Service request fetched successfully",
    data: bookingDetails,
  });
});
