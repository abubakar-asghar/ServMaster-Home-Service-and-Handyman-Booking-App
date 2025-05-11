import bcrypt from "bcryptjs";
import asyncHandler from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../utils/errorHandler.js";
import ServiceProvider from "../models/serviceProvider.model.js";
import Customer from "../models/customer.model.js";
import { generateToken } from "../services/generateJWTToken.js";

export const loginUser = asyncHandler(async (req, res, next) => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    return next(new ErrorHandler(400, "Please provide both phone and password"));
  }

  // 1. Try to find in ServiceProvider
  let user = await ServiceProvider.findOne({ phone });
  let role = "service-provider";

  // 2. If not found, check Customer
  if (!user) {
    user = await Customer.findOne({ phone });
    role = "customer";
  }

  if (!user) {
    return next(new ErrorHandler(401, "User not found with this phone number"));
  }

  // 3. Compare password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return next(new ErrorHandler(401, "Invalid password"));
  }

  const token = generateToken(user._id, role);

  // 4. Respond with token and user info
  res.status(200).json({
    success: true,
    message: "User logged in successfully",
    data: user,
    token,
    role,
  });
});
