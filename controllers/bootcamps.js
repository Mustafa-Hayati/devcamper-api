const path = require("path");
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
exports.getBootcamps = asyncHandler(
  async (req, res, next) => {
    res.status(200).json(res.advancedResults);
  }
);

/*  ANCHOR
@desc   Get single bootcamps
@route  GET /api/v1/bootcamps/:id
@access Public
*/
exports.getBootcamp = asyncHandler(
  async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) {
      return next(
        new ErrorResponse(
          `Bootcamp not found with id of ${req.params.id}`,
          404
        )
      );
    }

    res.status(200).json({
      success: true,
      data: bootcamp,
    });
  }
);

/*  ANCHOR
@desc   Create new bootcamp
@route  POST /api/v1/bootcamps/
@access Private
*/
exports.createBootcamp = asyncHandler(
  async (req, res, next) => {
    // Add user to req.body
    req.body.user = req.user.id;

    // check for published bootcamp
    const publishedBootcamp = await Bootcamp.findOne({
      user: req.user.id,
    });

    // if user is not an admin, they can only add one bootcamp
    if (publishedBootcamp && req.user.role !== "admin") {
      return next(
        new ErrorResponse(
          `The user with ID ${req.user.id} has already published a bootcmap.`,
          400
        )
      );
    }

    // It's safe to add req.body directly to the model
    // Because the schema will validate the input
    const bootcamp = await Bootcamp.create(req.body);

    res.status(201).json({
      success: true,
      data: bootcamp,
    });
  }
);

/*  ANCHOR
@desc   Update a bootcamp
@route  PUT /api/v1/bootcamps/:id
@access Private
*/
exports.updateBootcamp = asyncHandler(
  async (req, res, next) => {
    const bootcamp = await Bootcamp.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!bootcamp) {
      return next(
        new ErrorResponse(
          `Bootcamp not found with id of ${req.params.id}`,
          404
        )
      );
    }

    res.status(200).json({
      success: true,
      data: bootcamp,
    });
  }
);

/*  ANCHOR
@desc   Delete a bootcamp
@route  DELETE /api/v1/bootcamps/:id
@access Private
*/
exports.deleteBootcamp = asyncHandler(
  async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) {
      return next(
        new ErrorResponse(
          `Bootcamp not found with id of ${req.params.id}`,
          404
        )
      );
    }

    await bootcamp.remove();

    res.status(200).json({
      success: true,
      data: {},
    });
  }
);

/*  ANCHOR
@desc   Get bootcamps with a radius
@route  Get /api/v1/bootcamps/radius/:zipcode/:distance
@access Private
*/
exports.getBootcampsInRadius = asyncHandler(
  async (req, res, next) => {
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
  }
);

/*  ANCHOR
@desc   Upload Photo for bootcamp
@route  PUT /api/v1/bootcamps/:id/photo
@access Private
*/
exports.bootcampPhotoUpload = asyncHandler(
  async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) {
      return next(
        new ErrorResponse(
          `Bootcamp not found with id of ${req.params.id}`,
          404
        )
      );
    }

    if (!req.files) {
      return next(
        new ErrorResponse(`Please upload a file`, 400)
      );
    }

    const { file } = req.files;

    if (!file.mimetype.startsWith("image")) {
      return next(
        new ErrorResponse(
          `Please upload an image file`,
          400
        )
      );
    }

    // CHECK FILE SIZE
    if (file.size > process.env.MAX_FILE_UPLOAD) {
      return next(
        new ErrorResponse(
          `Please upload an image less than ${process.env.MAX_FILE_UPLOAD} bytes.`,
          400
        )
      );
    }

    // Create custom filename
    file.name = `photo_${bootcamp._id}${
      path.parse(file.name).ext
    }`;

    file.mv(
      `${process.env.FILE_UPLOAD_PATH}/${file.name}`,
      async err => {
        if (err) {
          console.error(`❌`, err);
          return next(
            new ErrorResponse(
              `Problem with file upload`,
              500
            )
          );
        }

        await Bootcamp.findByIdAndUpdate(req.params.id, {
          photo: file.name,
        });

        res.status(200).json({
          success: true,
          data: file.name,
        });
      }
    );
  }
);
