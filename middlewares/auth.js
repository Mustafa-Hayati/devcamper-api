const jwt = require("jsonwebtoken");
const asyncHandler = require("./asyncHandler");
const ErrorResponse = require("../utils/errorResponse");
const User = require("../models/User");

// Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }

  // Make sure token exists
  if (!token) {
    return next(new ErrorResponse(`Not authorized`, 401));
  }

  try {
    // verify the token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decodedToken.id);
    next();
  } catch {
    return next(new ErrorResponse(`Not authorized`, 401));
  }
});

// Grant access to specific routes
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new ErrorResponse(
          `The role: ${req.user.role} is not authorized`,
          403
        )
      );
    }

    next();
  };
};
