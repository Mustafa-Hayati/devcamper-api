const express = require("express");

const router = express.Router();

router
  .route("/")
  .get((req, res) => {
    res.status(200).json({
      success: true,
      msg: "Get all bootcamps",
    });
  })
  .post((req, res) => {
    res.status(200).json({
      success: true,
      msg: "Create new bootcamp",
    });
  });

router
  .route("/:id")
  .get((req, res) => {
    res.status(200).json({
      success: true,
      msg: "Get a bootcamp",
    });
  })
  .put((req, res) => {
    res.status(200).json({
      success: true,
      msg: "Update a bootcamp",
    });
  })
  .delete((req, res) => {
    res.status(200).json({
      success: true,
      msg: "Delete a bootcamp",
    });
  });

module.exports = router;
