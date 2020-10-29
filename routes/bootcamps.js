const express = require("express");

const router = express.Router();

/* CONTROLLERS */
const {
  getBootcamps,
  getBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampsInRadius,
  bootcampPhotoUpload,
} = require("../controllers/bootcamps");

const Bootcamp = require("../models/Bootcamp");

const advancedResults = require("../middlewares/advancedResults");
const {
  protect,
  authorize,
} = require("../middlewares/auth");

// Include other resource routers
const courseRouter = require("./courses");
const reviewRouter = require("./reviews");

router
  .route("/")
  .get(advancedResults(Bootcamp, "courses"), getBootcamps)
  .post(
    protect,
    authorize("publisher", "admin"),
    createBootcamp
  );

// Re-router into other resource routers
router.use("/:bootcampId/courses", courseRouter);
router.use("/:bootcampId/reviews", reviewRouter);

router
  .route("/:id")
  .get(getBootcamp)
  .put(
    protect,
    authorize("publisher", "admin"),
    updateBootcamp
  )
  .delete(
    protect,
    authorize("publisher", "admin"),
    deleteBootcamp
  );

router
  .route("/:id/photo")
  .put(
    protect,
    authorize("publisher", "admin"),
    bootcampPhotoUpload
  );

router
  .route("/radius/:zipcode/:distance")
  .get(getBootcampsInRadius);

module.exports = router;
