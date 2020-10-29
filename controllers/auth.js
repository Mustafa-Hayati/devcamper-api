const path = require("path");
const crypto = require("crypto");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middlewares/asyncHandler");
const sendEmail = require("../utils/sendEmail");
const geocoder = require("../utils/geocoder");
// MODELS
const User = require("../models/User");

/*  ANCHOR
@desc   Register User
@route  POST /api/v1/auth/register
@access Public
*/
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  // create user
  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  sendTokenResponse(user, 200, res);
});

/*  ANCHOR
@desc   Login User
@route  POST /api/v1/auth/login
@access Public
*/
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Validate email and password
  if (!email || !password) {
    return next(
      new ErrorResponse(
        `Please provide an email and a password`,
        403
      )
    );
  }

  // Check for user
  const user = await User.findOne({ email }).select(
    "+password"
  );

  if (!user) {
    return next(
      new ErrorResponse(`Invalid Credentials`, 401)
    );
  }

  // check if password matches
  const isMatch = await user.matchPassword(password);

  if (!isMatch) {
    return next(
      new ErrorResponse(`Invalid Credentials`, 401)
    );
  }

  sendTokenResponse(user, 200, res);
});

/*  ANCHOR
@desc   Get current logged in user
@route  GET /api/v1/auth/me
@access Private
*/
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    data: user, // I think sending req.user is enough, because this route is protected.
  });
});

/*  ANCHOR
@desc   Forgot Password
@route  GET /api/v1/auth/forgotpassword
@access Public
*/
exports.forgotPassword = asyncHandler(
  async (req, res, next) => {
    const user = await User.findOne({
      email: req.body.email,
    });

    if (!user) {
      return next(
        new ErrorResponse(
          `There's no user with that email`,
          404
        )
      );
    }

    // Get reset token
    const resettoken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    // Create resetURL
    const resetURL = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/auth/resetpassword/${resettoken}`;

    const message = `You're receiving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to :\n\n ${resetURL}`;

    try {
      await sendEmail({
        email: user.email,
        subject: "Password Reset Token",
        message,
      });

      res.status(200).json({
        success: true,
        data: "Email sent.",
      });
    } catch (error) {
      console.error(`❌`, error);

      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      return next(
        new ErrorResponse(`Email could not be sent`, 500)
      );
    }
  }
);

/*  ANCHOR
@desc   Reset Password
@route  PUT /api/v1/resetpassword/:resettoken
@access Public
*/
exports.resetPassword = asyncHandler(
  async (req, res, next) => {
    // Get hashed token
    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.resettoken)
      .digest("hex");

    const user = await User.findOne({
      resetPasswordToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return next(new ErrorResponse(`Invalid Token`, 400));
    }

    // Set new password
    user.password = req.body.password;

    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    sendTokenResponse(user, 200, res);
  }
);

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() +
        process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({
      success: true,
      token,
    });
};

/*  ANCHOR
@desc   Update user details
@route  PUT /api/v1/auth/updatedetails
@access Private
*/
exports.updateDetails = asyncHandler(
  async (req, res, next) => {
    const fieldsToUpdate = {
      name: req.body.name,
      email: req.body.email,
    };
    const user = await User.findByIdAndUpdate(
      req.user.id,
      fieldsToUpdate,
      {
        runValidators: true,
        new: true,
      }
    );

    res.status(200).json({
      success: true,
      data: user,
    });
  }
);

/*  ANCHOR
@desc   Update password
@route  PUT /api/v1/auth/udpatepassword
@access Private
*/
exports.updatePassword = asyncHandler(
  async (req, res, next) => {
    const user = await User.findById(req.user.id).select(
      "+password"
    );

    // check current password
    if (
      !(await user.matchPassword(req.body.currentPassword))
    ) {
      return next(
        new ErrorResponse("Invalid Credentials", 401)
      );
    }

    user.password = req.body.newPassword;
    await user.save();

    sendTokenResponse(user, 200, res);
  }
);
