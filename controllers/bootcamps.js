const cloneDeep = require("clone-deep");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middlewares/asyncHandler");
const geocoder = require("../utils/geocoder");
// MODELS
const Bootcamp = require("../models/Bootcamp");

/*  ANCHOR
@desc   Get all bootcamps
@route  GET /api/v1/bootcamps
@access Public
*/
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  let query;

  // copy rq.query
  const reqQuery = cloneDeep(req.query);

  // fields to exclude
  const removeFields = ["select", "sort", "page", "limit"];
  removeFields.forEach(param => delete reqQuery[param]);

  // create query string
  let queryString = JSON.stringify(reqQuery);

  // create operators like {$gt, $lte, etc}
  queryString = queryString.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    match => `$${match}`
  );

  // finding resources
  query = Bootcamp.find(JSON.parse(queryString)).populate("courses");

  // select fields
  if (req.query.select) {
    const fields = req.query.select.split(",").join(" ");
    query = query.select(fields);
  }

  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    query.sort("-createdAt");
  }

  // Paginate
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Bootcamp.countDocuments();

  query = query.skip(startIndex).limit(limit);

  // executing query
  const bootcamps = await query;

  // pagination result
  const pagination = {};
  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit,
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit,
    };
  }

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    pagination,
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
  const bootcamp = await Bootcamp.findById(req.params.id);

  if (!bootcamp) {
    return next(
      new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404)
    );
  }

  await bootcamp.remove();

  res.status(204).json({});
});

/*  ANCHOR
@desc   Get bootcamps with a radius
@route  DELETE /api/v1/bootcamps/radius/:zipcode/:distance
@access Private
*/
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;
  // Get lan/lng from geocoder
  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lng = loc[0].longitude;
  // Calculate radius using radians
  // Divide distance by radius of Earth
  // Eearth radius = 3,963 mi or 6,379.1 km
  const radius = distance / 3963;

  const bootcamps = await Bootcamp.find({
    location: {
      $geoWithin: {
        $centerSphere: [[lng, lat], radius],
      },
    },
  });

  res.status(200).json({
    success: true,
    count: bootcamps.length,
    data: bootcamps,
  });
});
