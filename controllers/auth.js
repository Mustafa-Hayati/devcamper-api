const path = require("path");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middlewares/asyncHandler");
const geocoder = require("../utils/geocoder");
// MODELS
const User = require("../models/User");

/*  ANCHOR
@desc   Register User
@route  GET /api/v1/auth/register
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

  res.status(200).json({ succes: true });
});
