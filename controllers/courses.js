const cloneDeep = require("clone-deep");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middlewares/asyncHandler");
// MODELS
const Course = require("../models/Course");
const Bootcamp = require("../models/Bootcamp");

/*  ANCHOR
@desc   Get all courses
@route  GET /api/v1/courses
@route  GET /api/v1/bootcamps/:bootcampId/courses
@access Public
*/
exports.getCourses = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    const courses = await Course.find({
      bootcamp: req.params.bootcampId,
    });

    return res.status(200).json({
      success: true,
      count: courses.length,
      data: courses,
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

/*  ANCHOR
@desc   Get single course
@route  GET /api/v1/courses/:id
@access Public
*/
exports.getCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id).populate({
    path: "bootcamp",
    select: "name description",
  });

  if (!course) {
    return next(
      new ErrorResponse(`Course not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: course,
  });
});

/*  ANCHOR
@desc   Create new course
@route  POST /api/v1/bootcamps/:bootcampId/courses
@access Private
*/
exports.createCourse = asyncHandler(async (req, res, next) => {
  req.body.bootcamp = req.params.bootcampId;

  const bootcamp = await Bootcamp.findById(req.params.bootcampId);

  if (!bootcamp) {
    new ErrorResponse(
      `No bootcamp with the id of ${req.params.bootcampId}`,
      404
    );
  }

  const course = await Course.create(req.body);

  res.status(200).json({
    success: true,
    data: course,
  });
});

/*  ANCHOR
@desc   Update a course
@route  PUT /api/v1/courses/:id
@access Private
*/
exports.updateCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!course) {
    return next(
      new ErrorResponse(`Course not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: course,
  });
});

/*  ANCHOR
@desc   Delete a course
@route  DELETE /api/v1/courses/:id
@access Private
*/
exports.deleteCourse = asyncHandler(async (req, res, next) => {
  const course = await Course.findById(req.params.id);

  if (!course) {
    return next(
      new ErrorResponse(`Course not found with id of ${req.params.id}`, 404)
    );
  }

  // we do this instead of findByIdAndDelete because of the
  // middlewares (pre remove) that we are going to add
  // to Course model, later.
  await course.remove();

  res.status(204).json({});
});

/*  ANCHOR
@desc   Get bootcamps with a radius
@route  DELETE /api/v1/bootcamps/radius/:zipcode/:distance
@access Private
*/
// exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
//   const { zipcode, distance } = req.params;
//   // Get lan/lng from geocoder
//   const loc = await geocoder.geocode(zipcode);
//   const lat = loc[0].latitude;
//   const lng = loc[0].longitude;
//   // Calculate radius using radians
//   // Divide distance by radius of Earth
//   // Eearth radius = 3,963 mi or 6,379.1 km
//   const radius = distance / 3963;

//   const bootcamps = await Bootcamp.find({
//     location: {
//       $geoWithin: {
//         $centerSphere: [[lng, lat], radius],
//       },
//     },
//   });

//   res.status(200).json({
//     success: true,
//     count: bootcamps.length,
//     data: bootcamps,
//   });
// });
