const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middlewares/asyncHandler");
// MODELS
const Bootcamp = require("../models/Bootcamp");

/*  ANCHOR
@desc   Get all bootcamps
@route  GET /api/v1/bootcamps
@access Public
*/
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  const bootcamps = await Bootcamp.find();

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps,
  });
});

/*  ANCHOR
@desc   Get single bootcamps
@route  GET /api/v1/bootcamps/:id
@access Public
*/
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: bootcamp,
  });
});

/*  ANCHOR
@desc   Create new bootcamp
@route  POST /api/v1/bootcamps/
@access Private
*/
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  // It's safe to add req.body directly to the model
  // Because the schema will validate the input
  const bootcamp = await Bootcamp.create(req.body);

  res.status(201).json({
    success: true,
    data: bootcamp,
  });
});

/*  ANCHOR
@desc   Update a bootcamp
@route  PUT /api/v1/bootcamps/:id
@access Private
*/
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: bootcamp,
  });
});

/*  ANCHOR
@desc   Delete a bootcamp
@route  DELETE /api/v1/bootcamps/:id
@access Private
*/
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(204).json({});
});
