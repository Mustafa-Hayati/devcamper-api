const express = require("express");

const router = express.Router({ mergeParams: true });

/* CONTROLLERS */
const {
  getCourses,
  getCourse,
  createCourse,
  updateCourse,
  deleteCourse,
} = require("../controllers/courses");

const Course = require("../models/Course");

const {
  protect,
  authorize,
} = require("../middlewares/auth");

const advancedResults = require("../middlewares/advancedResults");

router
  .route("/")
  .get(
    advancedResults(Course, {
      path: "bootcamp",
      select: "name description",
    }),
    getCourses
  )
  .post(
    protect,
    authorize("publisher", "admin"),
    createCourse
  );

router
  .route("/:id")
  .get(getCourse)
  .put(
    protect,
    authorize("publisher", "admin"),
    updateCourse
  )
  .delete(
    protect,
    authorize("publisher", "admin"),
    deleteCourse
  );

module.exports = router;
