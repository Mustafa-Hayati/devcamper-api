const express = require("express");

const router = express.Router({ mergeParams: true });

/* CONTROLLERS */
const {
  getReviews,
  getReview,
  addReview,
} = require("../controllers/reviews");

const Review = require("../models/Review");

const { protect, authorize } = require("../middlewares/auth");

const advancedResults = require("../middlewares/advancedResults");

router
  .route("/")
  .get(
    advancedResults(Review, {
      path: "bootcamp",
      select: "name description",
    }),
    getReviews
  )
  .post(protect, authorize("user", "admin"), addReview);

router.route("/:id").get(getReview);

module.exports = router;
