import jwt from "jsonwebtoken";

export const generateLimitedToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role, isTemporary: true },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );
};

export const generateToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};
