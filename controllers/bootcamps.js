// MODELS
const Bootcamp = require("../models/Bootcamp");

/*  ANCHOR
@desc   Get all bootcamps
@route  GET /api/v1/bootcamps
@access Public
*/
exports.getBootcamps = async (req, res, next) => {
  try {
    const bootcamps = await Bootcamp.find();

    res.status(200).json({
      success: true,
      data: bootcamps,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
    });
  }
};

/*  ANCHOR
@desc   Get single bootcamps
@route  GET /api/v1/bootcamps/:id
@access Public
*/
exports.getBootcamp = async (req, res, next) => {
  try {
    const bootcamp = await Bootcamp.findById(req.params.id);

    if (!bootcamp) {
      return res.status(400).json({
        success: false,
      });
    }

    res.status(200).json({
      success: true,
      data: bootcamp,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
    });
  }
};

/*  ANCHOR
@desc   Create new bootcamp
@route  POST /api/v1/bootcamps/
@access Private
*/
exports.createBootcamp = async (req, res, next) => {
  try {
    // It's safe to add req.body directly to the model
    // Because the schema will validate the input
    const bootcamp = await Bootcamp.create(req.body);

    res.status(201).json({
      success: true,
      data: bootcamp,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
    });
  }
};

/*  ANCHOR
@desc   Update a bootcamp
@route  PUT /api/v1/bootcamps/:id
@access Private
*/
exports.updateBootcamp = (req, res, next) => {
  res.status(200).json({
    success: true,
    msg: "Update a bootcamp",
  });
};

/*  ANCHOR
@desc   Delete a bootcamp
@route  DELETE /api/v1/bootcamps/:id
@access Private
*/
exports.deleteBootcamp = (req, res, next) => {
  res.status(204).json({
    success: true,
    msg: "Delete a bootcamp",
  });
};
