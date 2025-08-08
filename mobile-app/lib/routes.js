export const customerRoutes = {
  CUSTOMER_REGISTER: "/auth/customer-register",
  CUSTOMER_HOME: "/customer/home",

  // Customer Bookings Routes
  CUSTOMER_BOOKINGS: "/customer/bookings",
  CUSTOMER_BOOKING_DETAILS: (bookingId) =>
    `/customer/bookings/detail/${bookingId}`,
  CUSTOMER_BOOK_SERVICE_STEP1: (slug) =>
    `/customer/bookings/book/${slug}/step1`,
  CUSTOMER_BOOK_SERVICE_STEP2: (slug) =>
    `/customer/bookings/book/${slug}/step2`,
  CUSTOMER_BOOK_SERVICE_STEP3: (slug) =>
    `/customer/bookings/book/${slug}/step3`,

  // Customer Categories Routes
  CUSTOMER_CATEGORIES: "/customer/categories",
  CUSTOMER_SERVICES: (categoryId) => `/customer/categories/${categoryId}`,
  CUSTOMER_PROVIDERS_OF_SERVICE: (categoryId, serviceId) =>
    `/customer/categories/${categoryId}/${serviceId}/providers`,

  // Customer Chat Routes
  CUSTOMER_CHATS: "/customer/chat",
  CUSTOMER_CHAT_MESSAGES: (chatId) => `/customer/chat/${chatId}`,

  // Customer Profile Routes
  CUSTOMER_PROFILE: "/customer/profile",
  CUSTOMER_FAVORITE_PROVIDERS: "/customer/profile/favorites/service-providers",
  CUSTOMER_FAVORITE_SERVICES: "/customer/profile/favorites/services",
  CUSTOMER_REVIEWS: "/customer/profile/reviews",
  CUSTOMER_PROVIDER_PROFILE: (providerId) =>
    `/customer/profile/provider-profile/${providerId}`,
};

export const commonRoutes = {
  LOGIN: "/auth/login",
  LOCATION_PICKER: "/common/location-picker",
  FORGOT_PASSWORD: "/auth/forgot-password",
  SELECT_ROLE: "/auth/select-role",
};

export const providerRoutes = {
  PROVIDER_REGISTER: "/auth/provider-register",
  PROVIDER_HOME: "/provider/home",

  // Provider Bookings Routes
  PROVIDER_BOOKINGS: "/provider/bookings",
  PROVIDER_BOOKING_DETAILS: (bookingId) => `/provider/bookings/${bookingId}`,

  // Customer Chat Routes
  PROVIDER_CHATS: "/provider/chat",
  PROVIDER_CHAT_MESSAGES: (chatId) => `/provider/chat/${chatId}`,

  // Provider Profile Routes
  PROVIDER_PROFILE: "/provider/profile",
  PROVIDER_NOTIFICATIONS: "/provider/profile/notifications",
  PROVIDER_BUSINESS_INFO: "/provider/profile/general/business-information",
  PROVIDER_PERSONAL_INFO: "/provider/profile/general/personal-information",
  PROVIDER_CHANGE_PASSWORD: "/provider/profile/general/change-password",
  PROVIDER_VERIFICATION_PHONE:
    "/provider/profile/verification/phone-verification",
  PROVIDER_VERIFICATION_IDENTITY:
    "/provider/profile/verification/identity-verification",
  PROVIDER_VERIFICATION_PROFESSIONAL:
    "/provider/profile/verification/professional-verification",
  PROVIDER_SERVICES: "/provider/profile/services",
  PROVIDER_CATEGORIES: "/provider/profile/services/add-service",
  PROVIDER_ADD_SERVICES: (categoryId) =>
    `/provider/profile/services/add-service/${categoryId}`,
  PROVIDER_REVIEWS: "/provider/profile/reviews",
};
