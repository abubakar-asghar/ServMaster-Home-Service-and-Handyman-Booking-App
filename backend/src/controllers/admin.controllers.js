import Admin from "../models/admin.model.js";
import Customer from "../models/customer.model.js";
import ServiceCategory from "../models/serviceCategory.model.js";
import Service from "../models/service.model.js";
import ServiceProvider from "../models/serviceProvider.model.js";
import asyncHandler from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";
import bcrypt from "bcryptjs";
import ServiceRequest from "../models/serviceRequest.model.js";
import Review from "../models/review.model.js";
import { generateToken } from "../services/generateJWTToken.js";
import { uploadToCloudinary } from "../utils/cloudinary.js";

export const updateCreatedAt = asyncHandler(async (req, res, next) => {
  const { modelName } = req.body;
  if (!modelName) {
    return next(new ErrorHandler(400, "Model name is required"));
  }

  let Model;
  switch (modelName) {
    case "Admin":
      Model = Admin;
      break;
    case "Customer":
      Model = Customer;
      break;
    case "ServiceCategory":
      Model = ServiceCategory;
      break;
    case "Service":
      Model = Service;
      break;
    case "ServiceProvider":
      Model = ServiceProvider;
      break;
    case "ServiceRequest":
      Model = ServiceRequest;
      break;
    case "Review":
      Model = Review;
      break;
    default:
      return next(new ErrorHandler(400, "Invalid model name"));
  }

  // Update documents: if 'createdAt' exists, copy its value to 'createdAt' and set 'createdAt' to undefined
  const updatedCount = await Model.updateMany(
    { createdAt: { $exists: true } },
    [
      {
        $set: {
          createdAt: "$createdAt",
          createdAt: undefined,
        },
      },
    ]
  );

  res.status(200).json({
    success: true,
    message: `${updatedCount.modifiedCount} documents updated successfully`,
  });
});

/**
 * @desc    Admin Login
 * @route   POST /api/admin/login
 * @access  Public
 */
export const adminLogin = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorHandler(400, "Please enter email and password"));
  }

  const admin = await Admin.findOne({ email }).select("+password");

  if (!admin) {
    return next(new ErrorHandler(401, "Invalid email or password"));
  }

  const isMatch = await bcrypt.compare(password, admin.password);

  if (!isMatch) {
    return next(new ErrorHandler(401, "Invalid email or password"));
  }

  const token = generateToken(admin._id, admin.role);

  admin.password = undefined;

  res.status(200).json({ success: true, token, data: admin });
});

/**
 * @desc    Create Admin
 * @route   POST /api/admin/create
 * @access  Private (Admin)
 */
export const createAdmin = asyncHandler(async (req, res, next) => {
  const { name, email, password, role, permissions } = req.body;

  if (!name || !email || !password || !role) {
    return next(new ErrorHandler(400, "All fields are required"));
  }

  const existingAdmin = await Admin.findOne({ email });
  if (existingAdmin) {
    return next(new ErrorHandler(400, "Admin with this email already exists"));
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newAdmin = await Admin.create({
    name,
    email,
    password: hashedPassword,
    role,
    permissions,
  });

  newAdmin.password = undefined;

  res.status(201).json({
    success: true,
    message: "Admin created successfully",
    data: newAdmin,
  });
});

/**
 * @desc    Get Admin Profile
 * @route   GET /api/admin/profile
 * @access  Private (Admin)
 */
export const getAdminProfile = asyncHandler(async (req, res, next) => {
  const admin = await Admin.findById(req.admin.id).select("-password");
  if (!admin) {
    return next(new ErrorHandler(404, "Admin not found"));
  }

  res.status(200).json({
    success: true,
    message: "Admin profile fetched successfully",
    data: admin,
  });
});

///////////////////////////// ---- ADMIN DASHBOARD ---- //////////////////////////////////

/**
 * @desc    Get Dashboard Overview Data
 * @route   GET /api/admin/dashboard/overview
 * @access  Private (Admin)
 */
export const getDashboardOverview = asyncHandler(async (req, res, next) => {
  // Get all counts in parallel
  const [
    totalServices,
    totalCategories,
    totalProviders,
    totalCustomers,
    services,
    categories,
    providers,
    customers,
  ] = await Promise.all([
    Service.countDocuments(),
    ServiceCategory.countDocuments(),
    ServiceProvider.countDocuments(),
    Customer.countDocuments(),
    Service.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("parent_service", "name"),
    ServiceCategory.find().sort({ createdAt: -1 }).limit(3),
    ServiceProvider.find()
      .sort({ rating: -1 })
      .limit(3)
      .select("fullName businessInfo rating onlineStatus"),
    Customer.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .select("fullName phone createdAt"),
  ]);

  // Get service status distribution
  const serviceStatusDistribution = await Service.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 } } },
    { $project: { status: "$_id", count: 1, _id: 0 } },
  ]);

  // Calculate provider verification status
  const providerVerification = await ServiceProvider.aggregate([
    {
      $group: {
        _id: null,
        identityVerified: {
          $sum: {
            $cond: [
              { $eq: ["$verification.identity.status", "verified"] },
              1,
              0,
            ],
          },
        },
        professionalVerified: {
          $sum: {
            $cond: [
              { $eq: ["$verification.professional.status", "verified"] },
              1,
              0,
            ],
          },
        },
        total: { $sum: 1 },
      },
    },
  ]);

  // Prepare the response data
  const data = {
    totals: {
      services: totalServices,
      categories: totalCategories,
      providers: totalProviders,
      customers: totalCustomers,
    },
    verificationStats: providerVerification[0] || {
      identityVerified: 0,
      professionalVerified: 0,
      total: 0,
    },
    recent: {
      services: services.map((service) => ({
        _id: service._id,
        name: service.name,
        category: service.parent_service?.name || "Uncategorized",
        status: service.status,
        createdAt: service.createdAt,
      })),
      categories: categories.map((category) => ({
        _id: category._id,
        name: category.name,
        servicesCount: 0, // Will be populated below
        createdAt: category.createdAt,
      })),
      providers: providers.map((provider) => ({
        _id: provider._id,
        name: provider.fullName,
        businessType: provider.businessInfo?.type || "N/A",
        rating: provider.rating.average || 0,
        status: provider.onlineStatus || "offline",
      })),
      customers: customers.map((customer) => ({
        _id: customer._id,
        name: customer.fullName,
        phone: customer.phone,
        joined: customer.createdAt,
      })),
    },
    serviceStatusDistribution,
    growthStats: {
      // These would ideally compare with previous period data
      servicesGrowth: "+12%",
      customersGrowth: "+24%",
      providersGrowth: "+8%",
    },
  };

  // Populate services count for each category
  for (const category of data.recent.categories) {
    const count = await Service.countDocuments({
      parent_service: category._id,
    });
    category.servicesCount = count;
  }

  res.status(200).json({
    success: true,
    data,
  });
});

/**
 * @desc    Get advanced statistics for dashboard
 * @route   GET /api/admin/dashboard/statistics
 * @access  Private (Admin)
 */
export const getDashboardStatistics = asyncHandler(async (req, res, next) => {
  // Date ranges for analytics (last 30 days)
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(endDate.getDate() - 30);

  // Run all analytics queries in parallel
  const [
    customerStats,
    providerStats,
    serviceStats,
    requestStats,
    revenueStats,
    categoryStats,
    locationStats,
    verificationStats,
    ratingStats,
    timelineStats,
  ] = await Promise.all([
    // 1. Customer Analytics
    Customer.aggregate([
      {
        $facet: {
          totalCount: [{ $count: "count" }],
          growth: [
            { $match: { createdAt: { $gte: startDate } } },
            {
              $group: {
                _id: {
                  $dateToString: { format: "%Y-%m-%d", date: "$createdAt" },
                },
                count: { $sum: 1 },
              },
            },
            { $sort: { _id: 1 } },
          ],
          byCity: [
            { $group: { _id: "$city", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 },
          ],
        },
      },
    ]),

    // 2. Service Provider Analytics
    ServiceProvider.aggregate([
      {
        $facet: {
          totalCount: [{ $count: "count" }],
          byStatus: [{ $group: { _id: "$accountStatus", count: { $sum: 1 } } }],
          byBusinessType: [
            { $group: { _id: "$businessInfo.type", count: { $sum: 1 } } },
          ],
          topRated: [
            { $sort: { "rating.average": -1 } },
            { $limit: 5 },
            {
              $project: { fullName: 1, "rating.average": 1, accountStatus: 1 },
            },
          ],
        },
      },
    ]),

    // 3. Service Analytics
    Service.aggregate([
      {
        $facet: {
          totalCount: [{ $count: "count" }],
          byCategory: [
            { $group: { _id: "$parent_service", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 },
          ],
        },
      },
    ]),

    // 4. Service Request Analytics
    ServiceRequest.aggregate([
      {
        $facet: {
          totalCount: [{ $count: "count" }],
          byStatus: [{ $group: { _id: "$status", count: { $sum: 1 } } }],
          completionRate: [
            {
              $group: {
                _id: null,
                completed: {
                  $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
                },
                total: { $sum: 1 },
              },
            },
          ],
          recentRequests: [
            { $sort: { createdAt: -1 } },
            { $limit: 5 },
            {
              $lookup: {
                from: "services",
                localField: "service",
                foreignField: "_id",
                as: "service",
              },
            },
            { $unwind: "$service" },
          ],
        },
      },
    ]),

    // 5. Revenue Analytics (from service requests)
    ServiceRequest.aggregate([
      {
        $match: {
          status: "completed",
          "pricing.type": { $ne: "negotiable" },
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$pricing.amount" },
          avgServicePrice: { $avg: "$pricing.amount" },
          count: { $sum: 1 },
        },
      },
    ]),

    // 6. Category Analytics
    ServiceCategory.aggregate([
      {
        $lookup: {
          from: "services",
          localField: "_id",
          foreignField: "parent_service",
          as: "services",
        },
      },
      {
        $project: {
          name: 1,
          icon: 1,
          serviceCount: { $size: "$services" },
        },
      },
      { $sort: { serviceCount: -1 } },
      { $limit: 5 },
    ]),

    // 7. Location Analytics
    Customer.aggregate([
      { $match: { city: { $exists: true, $ne: "" } } },
      { $group: { _id: "$city", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]),

    // 8. Verification Analytics
    ServiceProvider.aggregate([
      {
        $group: {
          _id: null,
          identityVerified: {
            $sum: {
              $cond: [
                { $eq: ["$verification.identity.status", "verified"] },
                1,
                0,
              ],
            },
          },
          professionalVerified: {
            $sum: {
              $cond: [
                { $eq: ["$verification.professional.status", "verified"] },
                1,
                0,
              ],
            },
          },
          total: { $sum: 1 },
        },
      },
    ]),

    // 9. Rating Analytics
    Review.aggregate([
      {
        $group: {
          _id: null,
          avgRating: { $avg: "$rating" },
          totalReviews: { $sum: 1 },
          ratingDistribution: {
            $push: {
              rating: "$rating",
              count: 1,
            },
          },
        },
      },
      {
        $project: {
          avgRating: 1,
          totalReviews: 1,
          ratingDistribution: {
            $reduce: {
              input: "$ratingDistribution",
              initialValue: [0, 0, 0, 0, 0], // Initialize counts for 1-5 stars
              in: {
                $let: {
                  vars: { idx: { $subtract: ["$$this.rating", 1] } },
                  in: {
                    $map: {
                      input: "$ratingDistribution",
                      as: "r",
                      in: {
                        $cond: [
                          { $eq: ["$$r.rating", "$$this.rating"] },
                          { $add: ["$$this.count", 1] },
                          "$$this.count",
                        ],
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    ]),

    // 10. Timeline Analytics
    ServiceRequest.aggregate([
      {
        $match: { createdAt: { $gte: startDate } },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          requests: { $sum: 1 },
          completed: {
            $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
          },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);

  // Format the response
  res.status(200).json({
    success: true,
    data: {
      customers: {
        total: customerStats[0]?.totalCount[0]?.count || 0,
        growth: customerStats[0]?.growth || [],
        byCity: customerStats[0]?.byCity || [],
      },
      providers: {
        total: providerStats[0]?.totalCount[0]?.count || 0,
        byStatus: providerStats[0]?.byStatus || [],
        byBusinessType: providerStats[0]?.byBusinessType || [],
        topRated: providerStats[0]?.topRated || [],
      },
      services: {
        total: serviceStats[0]?.totalCount[0]?.count || 0,
        byCategory: serviceStats[0]?.byCategory || [],
      },
      requests: {
        total: requestStats[0]?.totalCount[0]?.count || 0,
        byStatus: requestStats[0]?.byStatus || [],
        completionRate: requestStats[0]?.completionRate[0] || {
          completed: 0,
          total: 0,
        },
        recent: requestStats[0]?.recentRequests || [],
      },
      financials: revenueStats[0] || {
        totalRevenue: 0,
        avgServicePrice: 0,
        count: 0,
      },
      categories: categoryStats,
      locations: locationStats,
      verification: verificationStats[0] || {
        identityVerified: 0,
        professionalVerified: 0,
        total: 0,
      },
      ratings: ratingStats[0] || {
        avgRating: 0,
        totalReviews: 0,
        ratingDistribution: [0, 0, 0, 0, 0],
      },
      timeline: timelineStats,
      timeRange: {
        start: startDate,
        end: endDate,
      },
    },
  });
});

/////////////////////////////// ---- CUSTOMERS ---- ////////////////////////////////////////

/**
 * @desc    Get All Customers
 * @route   GET /api/admin/customers
 * @access  Private (Admin)
 */
export const getAllCustomers = asyncHandler(async (req, res, next) => {
  const customers = await Customer.find();

  if (!customers) {
    res.status(200).json({ success: true, data: [] });
  }

  res.status(200).json({ success: true, data: customers });
});

/**
 * @desc    Get Customer Details
 * @route   GET /api/admin/customer/:id
 * @access  Private (Admin)
 */
export const getCustomerDetails = asyncHandler(async (req, res, next) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) {
    return next(new ErrorHandler(404, "Customer not found"));
  }
  res.status(200).json({ success: true, data: customer });
});

/**
 * @desc    Update Customer Phone Verification Status
 * @route   PUT /api/admin/customer/:id/phone-verification
 * @access  Private (Admin)
 */
export const updateCustomerPhoneVerification = asyncHandler(
  async (req, res, next) => {
    const { isPhoneVerified } = req.body;
    if (typeof isPhoneVerified !== "boolean") {
      return next(new ErrorHandler(400, "isPhoneVerified must be a boolean"));
    }

    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return next(new ErrorHandler(404, "Customer not found"));
    }

    customer.isPhoneVerified = isPhoneVerified;

    if (customer.isPhoneVerified === true) {
      customer.isBlocked = false;
      customer.blockedReason = null;
      customer.blockedAt = null;
    }

    await customer.save();

    res.status(200).json({
      success: true,
      message: "Customer phone verification status updated",
      data: {
        _id: customer._id,
        isPhoneVerified: customer.isPhoneVerified,
      },
    });
  }
);

/**
 * @desc    Update Customer Block/Unblock Status
 * @route   PUT /api/admin/customer/:id/block-unblock
 * @access  Private (Admin)
 */
export const updateCustomerBlockStatus = asyncHandler(
  async (req, res, next) => {
    const { blockStatus } = req.body;
    if (typeof blockStatus !== "boolean") {
      return next(new ErrorHandler(400, "blockStatus must be a boolean"));
    }

    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return next(new ErrorHandler(404, "Customer not found"));
    }

    customer.isBlocked = blockStatus;
    if (blockStatus) {
      customer.blockedReason = "Blocked by admin for policy violation";
      customer.blockedAt = new Date();
    } else {
      customer.blockedReason = null;
      customer.blockedAt = null;
    }

    await customer.save();

    res.status(200).json({
      success: true,
      message: `Customer ${blockStatus ? "blocked" : "unblocked"} successfully`,
      data: {
        _id: customer._id,
        isBlocked: customer.isBlocked,
        blockedReason: customer.blockedReason,
        blockedAt: customer.blockedAt,
      },
    });
  }
);

/**
 * @desc    Delete Customer
 * @route   DELETE /api/admin/customer/:id
 * @access  Private (Admin)
 */
export const deleteCustomer = asyncHandler(async (req, res, next) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) {
    return next(new ErrorHandler(404, "Customer not found"));
  }

  await customer.deleteOne();
  res
    .status(200)
    .json({ success: true, message: "Customer deleted successfully" });
});

/////////////////////////// ---- SERVICE PROVIDERS ---- ////////////////////////////////////

/**
 * @desc    Get All Service Providers
 * @route   GET /api/admin/service-providers
 * @access  Private (Admin)
 */
export const getAllServiceProviders = asyncHandler(async (req, res, next) => {
  const providers = await ServiceProvider.find().lean();

  if (!providers) {
    res.status(200).json({ success: true, data: [] });
  }

  const mappedProviders = providers.map((p) => ({
    _id: p._id,
    fullName: p.fullName,
    phone: p.phone,
    accountStatus: p.accountStatus,
    businessType: p.businessInfo?.type || "N/A",
    city: p.businessInfo?.city || "N/A",
    cnicStatus: p.verification?.identity?.status || "pending",
    professionalStatus: p.verification?.professional?.status || "pending",
    servicesCount: p.selectedServices?.length || 0,
    rating: p.rating?.average || 0,
    onlineStatus: p.onlineStatus || "offline",
    createdAt: p.createdAt,
  }));

  res.status(200).json({ success: true, data: mappedProviders });
});

/**
 * @desc    Get Service Provider Details
 * @route   GET /api/admin/service-provider/:id
 * @access  Private (Admin)
 */
export const getServiceProviderDetails = asyncHandler(
  async (req, res, next) => {
    const provider = await ServiceProvider.findById(req.params.id)
      .populate({
        path: "selectedServices.category",
        select: "name icon",
      })
      .populate({
        path: "selectedServices.services.service",
        select: "name icon",
      });

    if (!provider) {
      return next(new ErrorHandler(404, "Service provider not found"));
    }
    res.status(200).json({ success: true, data: provider });
  }
);

/**
 * @desc    Delete Service Provider
 * @route   DELETE /api/admin/service-provider/:id
 * @access  Private (Admin)
 */
export const deleteServiceProvider = asyncHandler(async (req, res, next) => {
  const provider = await ServiceProvider.findById(req.params.id);
  if (!provider) {
    return next(new ErrorHandler(404, "Service provider not found"));
  }

  await provider.deleteOne();
  res
    .status(200)
    .json({ success: true, message: "Service provider deleted successfully" });
});

/**
 * @desc    Update Service Provider Verification Statuses
 * @route   PUT /api/admin/service-providers/:id/verification
 * @access  Private (Admin)
 */
export const updateServiceProviderVerification = asyncHandler(
  async (req, res, next) => {
    const { id } = req.params;
    const {
      updateType,
      accountStatus,
      isPhoneVerified,
      identityStatus,
      professionalStatus,
      rejectionReason,
    } = req.body;

    // Validate update type
    const validUpdateTypes = ["account", "phone", "identity", "professional"];
    if (!validUpdateTypes.includes(updateType)) {
      return next(new ErrorHandler(400, "Invalid update type"));
    }

    const provider = await ServiceProvider.findById(id);
    if (!provider) {
      return next(new ErrorHandler(404, "Service provider not found"));
    }

    // Initialize verification object if not exists
    provider.verification = provider.verification || {};
    provider.verification.identity = provider.verification.identity || {};
    provider.verification.professional =
      provider.verification.professional || {};

    // Handle specific verification updates
    switch (updateType) {
      case "phone":
        if (typeof isPhoneVerified !== "boolean") {
          return next(
            new ErrorHandler(400, "Phone verification status must be boolean")
          );
        }
        provider.isPhoneVerified = isPhoneVerified;
        break;

      case "identity":
        if (
          !["pending", "submitted", "verified", "rejected"].includes(
            identityStatus
          )
        ) {
          return next(new ErrorHandler(400, "Invalid identity status"));
        }
        provider.verification.identity.status = identityStatus;
        if (identityStatus === "verified") {
          provider.verification.identity.verifiedAt = new Date();
        }
        if (identityStatus === "rejected" && rejectionReason) {
          provider.verification.identity.rejectionReason = rejectionReason;
        }
        break;

      case "professional":
        if (
          !["pending", "submitted", "verified", "rejected"].includes(
            professionalStatus
          )
        ) {
          return next(new ErrorHandler(400, "Invalid professional status"));
        }
        provider.verification.professional.status = professionalStatus;
        if (professionalStatus === "verified") {
          provider.verification.professional.verifiedAt = new Date();
        }
        if (professionalStatus === "rejected" && rejectionReason) {
          provider.verification.professional.rejectionReason = rejectionReason;
        }
        break;

      case "account":
        if (
          ![
            "pending",
            "verified",
            "suspended",
            "inactive",
            "rejected",
          ].includes(accountStatus)
        ) {
          return next(new ErrorHandler(400, "Invalid account status"));
        }

        provider.accountStatus = accountStatus;

        // If account is verified, verify all other statuses
        if (accountStatus === "verified") {
          provider.isPhoneVerified = true;
          provider.verification.identity.status = "verified";
          provider.verification.identity.verifiedAt = new Date();
          provider.verification.professional.status = "verified";
          provider.verification.professional.verifiedAt = new Date();
        }
        break;
    }

    await provider.save();

    res.status(200).json({
      success: true,
      message: "Verification status updated successfully",
      data: {
        accountStatus: provider.accountStatus,
        isPhoneVerified: provider.isPhoneVerified,
        identityStatus: provider.verification.identity.status,
        professionalStatus: provider.verification.professional.status,
        updatedAt: provider.updatedAt,
      },
    });
  }
);

/////////////////////////// ---- SERVICE CATEGORIES ---- ////////////////////////////////////

/**
 * @desc    Create a new service category
 * @route   POST /api/service-categories/create
 * @access  Private (Admin only)
 */
export const createNewServiceCategory = asyncHandler(async (req, res, next) => {
  const icon = req.file;
  const { name, description } = req.body;

  if (!name) {
    return next(new ErrorHandler(400, "Service category name is required"));
  }

  const existingCategory = await ServiceCategory.findOne({ name });
  if (existingCategory) {
    return next(new ErrorHandler(400, "Service category already exists"));
  }

  try {
    let iconURL;

    if (icon && icon.path) {
      const localPath = icon.path;
      iconURL = await uploadToCloudinary(localPath, "servmaster/icons");
    }

    const category = await ServiceCategory.create({
      name,
      description,
      icon: iconURL,
    });

    res.status(201).json({
      success: true,
      message: "Service category created successfully",
      data: category,
    });
  } catch (err) {
    console.error("CREATE ERROR:", err);

    // Duplicate key error (unique field violation)
    if (err.code === 11000) {
      return next(
        new ErrorHandler(400, "Category with this name already exists")
      );
    }

    return next(new ErrorHandler(500, err.message || "Internal Server Error"));
  }
});

/**
 * @desc    Get all service categories
 * @route   GET /api/service-categories/all
 * @access  Public
 */
export const getAllServiceCategories = asyncHandler(async (req, res, next) => {
  const categories = await ServiceCategory.find().sort({ createdAt: -1 });
  res.status(200).json({
    success: true,
    message: "Service categories fetched successfully",
    data: categories,
  });
});

/**
 * @desc    Get single service category by ID
 * @route   PUT /api/service-categories/:id
 * @access  Public
 */
export const getServiceCategoryDetail = asyncHandler(async (req, res, next) => {
  const category = await ServiceCategory.findById(req.params.id);
  if (!category) {
    return next(new ErrorHandler(404, "Service category not found"));
  }

  res.status(200).json({
    success: true,
    data: category,
  });
});

/**
 * @desc    Update a service category
 * @route   PUT /api/service-categories/:id
 * @access  Private (Admin only)
 */
export const updateServiceCategory = asyncHandler(async (req, res, next) => {
  const icon = req.file;
  const { name, description } = req.body;

  let category = await ServiceCategory.findById(req.params.id);

  if (!category) {
    return next(new ErrorHandler(404, "Service category not found"));
  }

  let iconURL;

  if (icon && icon.path) {
    const localPath = icon.path;
    iconURL = await uploadToCloudinary(localPath, "servmaster/icons");
  }

  category.name = name || category.name;
  category.description = description || category.description;
  if (iconURL) category.icon = iconURL;

  await category.save();

  res.status(200).json({
    success: true,
    message: "Service category updated successfully",
    data: category,
  });
});

/**
 * @desc    Delete a service category
 * @route   DELETE /api/service-categories/:id
 * @access  Private (Admin only)
 */
export const deleteServiceCategory = asyncHandler(async (req, res, next) => {
  const category = await ServiceCategory.findById(req.params.id);
  if (!category) {
    return next(new ErrorHandler(404, "Service category not found"));
  }

  await category.deleteOne();

  res.status(200).json({
    success: true,
    message: "Service category deleted successfully",
  });
});

////////////////////////////////// ---- SERVICES ---- //////////////////////////////////////

/**
 * @desc    Create a new service
 * @route   POST /api/services/create
 * @access  Private (Admin only)
 */
export const createNewService = asyncHandler(async (req, res, next) => {
  const { name, description, parent_service } = req.body;

  if (!name || !parent_service) {
    return next(
      new ErrorHandler(400, "Service name and parent service ID are required")
    );
  }

  const parentExists = await ServiceCategory.findById(parent_service);
  if (!parentExists) {
    return next(new ErrorHandler(404, "Parent service category not found"));
  }

  const service = await Service.create({
    name,
    description,
    parent_service,
    icon: parentExists.icon,
  });

  res.status(201).json({
    success: true,
    message: "Service created successfully",
    data: service,
  });
});

/**
 * @desc    Get all services
 * @route   GET /api/services/all
 * @access  Public
 */
export const getAllServices = asyncHandler(async (req, res, next) => {
  const services = await Service.find().populate("parent_service", "name");
  res.status(200).json({
    success: true,
    data: services,
  });
});

/**
 * @desc   Get a single service by ID
 * @route  GET /api/services/:id
 * @access Public
 */
export const getServiceDetail = asyncHandler(async (req, res, next) => {
  const service = await Service.findById(req.params.id).populate(
    "parent_service",
    "name"
  );
  if (!service) {
    return next(new ErrorHandler(404, "Service not found"));
  }

  res.status(200).json({
    success: true,
    data: service,
  });
});

/**
 * @desc    Update a service
 * @route   PUT /api/services/:id
 * @access  Private (Admin only)
 */
export const updateService = asyncHandler(async (req, res, next) => {
  const { name, description, parent_service } = req.body;
  let service = await Service.findById(req.params.id);

  if (!service) {
    return next(new ErrorHandler(404, "Service not found"));
  }

  if (parent_service) {
    const parentExists = await ServiceCategory.findById(parent_service);
    if (!parentExists) {
      return next(new ErrorHandler(404, "Parent service category not found"));
    }
  }

  service.name = name || service.name;
  service.description = description || service.description;
  service.parent_service = parent_service || service.parent_service;

  await service.save();

  res.status(200).json({
    success: true,
    message: "Service updated successfully",
    data: service,
  });
});

/**
 * @desc   Delete a service
 * @route  DELETE /api/services/:id
 * @access Private (Admin only)
 */
export const deleteService = asyncHandler(async (req, res, next) => {
  const service = await Service.findById(req.params.id);
  if (!service) {
    return next(new ErrorHandler(404, "Service not found"));
  }

  await service.deleteOne();

  res.status(200).json({
    success: true,
    message: "Service deleted successfully",
  });
});

///////////////////////////// ---- REVIEWS & RATINGS ---- ////////////////////////////////

// /**
//  * @desc    Get all reviews with filters
//  * @route   GET /api/admin/reviews
//  * @access  Private (Admin)
//  */
export const getAllReviews = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 10, rating, sort, search } = req.query;
  const skip = (page - 1) * limit;

  // Build the query
  const query = {};

  // Filter by rating if provided
  if (rating) {
    query.rating = parseInt(rating);
  }

  // Search functionality
  if (search) {
    query.$or = [{ review: { $regex: search, $options: "i" } }];
  }

  // Sorting options
  const sortOptions = {};
  if (sort === "newest") {
    sortOptions.createdAt = -1;
  } else if (sort === "oldest") {
    sortOptions.createdAt = 1;
  } else if (sort === "highest") {
    sortOptions.rating = -1;
  } else if (sort === "lowest") {
    sortOptions.rating = 1;
  } else {
    sortOptions.createdAt = -1; // Default sort
  }

  // Execute query
  const reviews = await Review.find(query)
    .sort(sortOptions)
    .skip(skip)
    .limit(parseInt(limit))
    .populate([
      { path: "customer_id", select: "fullName profileImage" },
      { path: "service_provider_id", select: "fullName profileImage" },
      {
        path: "service_request_id",
        populate: {
          path: "service",
          select: "name",
        },
      },
    ]);

  const total = await Review.countDocuments(query);

  // Format response
  const formattedReviews = reviews.map((review) => ({
    _id: review._id,
    rating: review.rating,
    review: review.review,
    createdAt: review.createdAt,
    customer: {
      _id: review.customer_id._id,
      name: review.customer_id.fullName,
      image: review.customer_id.profileImage,
    },
    provider: {
      _id: review.service_provider_id._id,
      name: review.service_provider_id.fullName,
      image: review.service_provider_id.profileImage,
    },
    service: {
      _id: review.service_request_id?.service?._id,
      name: review.service_request_id?.service?.name,
    },
    requestId: review.service_request_id?._id,
  }));

  res.status(200).json({
    success: true,
    data: {
      reviews: formattedReviews,
      pagination: {
        total,
        limit: parseInt(limit),
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        hasNextPage: page * limit < total,
        hasPrevPage: page > 1,
      },
    },
  });
});
// export const getAllReviews = asyncHandler(async (req, res, next) => {
//   const { page = 1, limit = 10, rating, sort, search } = req.query;

//   // Build the query
//   const query = {};

//   // Filter by rating if provided
//   if (rating) {
//     query.rating = parseInt(rating);
//   }

//   // Search functionality
//   if (search) {
//     query.$or = [{ review: { $regex: search, $options: "i" } }];
//   }

//   // Sorting options
//   const sortOptions = {};
//   if (sort === "newest") {
//     sortOptions.createdAt = -1;
//   } else if (sort === "oldest") {
//     sortOptions.createdAt = 1;
//   } else if (sort === "highest") {
//     sortOptions.rating = -1;
//   } else if (sort === "lowest") {
//     sortOptions.rating = 1;
//   } else {
//     sortOptions.createdAt = -1; // Default sort
//   }

//   // Pagination
//   const options = {
//     page: parseInt(page),
//     limit: parseInt(limit),
//     sort: sortOptions,
//     populate: [
//       { path: "customer_id", select: "fullName profileImage" },
//       { path: "service_provider_id", select: "fullName profileImage" },
//       {
//         path: "service_request_id",
//         populate: {
//           path: "service",
//           select: "name",
//         },
//       },
//     ],
//   };

//   // Execute query with pagination
//   const reviews = await Review.paginate(query, options);

//   // Format response
//   const formattedReviews = reviews.docs.map((review) => ({
//     _id: review._id,
//     rating: review.rating,
//     review: review.review,
//     createdAt: review.createdAt,
//     customer: {
//       _id: review.customer_id._id,
//       name: review.customer_id.fullName,
//       image: review.customer_id.profileImage,
//     },
//     provider: {
//       _id: review.service_provider_id._id,
//       name: review.service_provider_id.fullName,
//       image: review.service_provider_id.profileImage,
//     },
//     service: {
//       _id: review.service_request_id?.service?._id,
//       name: review.service_request_id?.service?.name,
//     },
//     requestId: review.service_request_id?._id,
//   }));

//   res.status(200).json({
//     success: true,
//     data: {
//       reviews: formattedReviews,
//       pagination: {
//         total: reviews.totalDocs,
//         limit: reviews.limit,
//         page: reviews.page,
//         pages: reviews.totalPages,
//         hasNextPage: reviews.hasNextPage,
//         hasPrevPage: reviews.hasPrevPage,
//       },
//     },
//   });
// });

/**
 * @desc    Delete a review
 * @route   DELETE /api/admin/reviews/:id
 * @access  Private (Admin)
 */
export const deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new ErrorHandler(404, "Review not found"));
  }

  await review.deleteOne();

  res.status(200).json({
    success: true,
    message: "Review deleted successfully",
  });
});

/**
 * @desc    Get review statistics
 * @route   GET /api/admin/reviews/stats
 * @access  Private (Admin)
 */
export const getReviewStats = asyncHandler(async (req, res, next) => {
  const stats = await Review.aggregate([
    {
      $facet: {
        totalReviews: [{ $count: "count" }],
        averageRating: [{ $group: { _id: null, avg: { $avg: "$rating" } } }],
        ratingDistribution: [
          { $group: { _id: "$rating", count: { $sum: 1 } } },
          { $sort: { _id: -1 } },
        ],
        recentReviews: [
          { $sort: { createdAt: -1 } },
          { $limit: 5 },
          {
            $lookup: {
              from: "customers",
              localField: "customer_id",
              foreignField: "_id",
              as: "customer",
            },
          },
          { $unwind: "$customer" },
        ],
      },
    },
  ]);

  res.status(200).json({
    success: true,
    data: {
      total: stats[0].totalReviews[0]?.count || 0,
      averageRating: stats[0].averageRating[0]?.avg || 0,
      ratingDistribution: stats[0].ratingDistribution,
      recentReviews: stats[0].recentReviews,
    },
  });
});
