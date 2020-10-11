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
} = require("../controllers/bootcamps");

// Include other resource routers
const courseRouter = require("./courses");

router.route("/").get(getBootcamps).post(createBootcamp);

// Re-router into other resource routers
router.use("/:bootcampId/courses", courseRouter);

router
  .route("/:id")
  .get(getBootcamp)
  .put(updateBootcamp)
  .delete(deleteBootcamp);

router.route("/radius/:zipcode/:distance").get(getBootcampsInRadius);

module.exports = router;
