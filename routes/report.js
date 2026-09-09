const express = require("express");
const rateLimit = require("express-rate-limit");

const Report = require("../models/Report");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();


/*
   REPORT RATE LIMIT

   Maximum:
   10 reports every hour.

   The authenticated user's ID is used as the
   rate-limit key, so one account cannot
   mass-report users/content.
*/

const reportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,

  max: 10,

  keyGenerator: (req) => req.userId,

  message: {
    message:
      "Too many reports submitted. Please try again later.",
  },

  standardHeaders: true,

  legacyHeaders: false,
});


/*
   CREATE REPORT
*/

router.post(
  "/",
  authMiddleware,
  reportLimiter,
  async (req, res) => {

    try {

      const {
        reportedUser,
        postId,
        reportType,
        reason,
        details,
      } = req.body;


      /*
         Basic validation
      */

      if (!reportType || !reason) {
        return res.status(400).json({
          message:
            "Report type and reason are required",
        });
      }


      /*
         Check report type
      */

      if (
        reportType !== "user" &&
        reportType !== "post"
      ) {
        return res.status(400).json({
          message:
            "Invalid report type",
        });
      }


      /*
         User report requires a user ID
      */

      if (
        reportType === "user" &&
        !reportedUser
      ) {
        return res.status(400).json({
          message:
            "Reported user is required",
        });
      }


      /*
         Post report requires a post ID
      */

      if (
        reportType === "post" &&
        !postId
      ) {
        return res.status(400).json({
          message:
            "Post ID is required",
        });
      }


      /*
         Prevent users from reporting themselves
      */

      if (
        reportType === "user" &&
        reportedUser === req.userId
      ) {
        return res.status(400).json({
          message:
            "You cannot report yourself",
        });
      }


      /*
         Prevent duplicate pending reports
      */

      const existingReport =
        await Report.findOne({
          reporter: req.userId,

          reportedUser:
            reportType === "user"
              ? reportedUser
              : null,

          postId:
            reportType === "post"
              ? postId
              : null,

          reportType,

          status: "pending",
        });


      if (existingReport) {
        return res.status(400).json({
          message:
            "You have already reported this content",
        });
      }


      /*
         Create report
      */

      const report =
        await Report.create({

          reporter: req.userId,

          reportedUser:
            reportType === "user"
              ? reportedUser
              : null,

          postId:
            reportType === "post"
              ? postId
              : null,

          reportType,

          reason,

          details:
            details
              ? details.trim()
              : "",
        });


      /*
         Success response
      */

      return res.status(201).json({

        message:
          "Report submitted successfully",

        report,
      });


    } catch (error) {

      console.error(
        "Report error:",
        error
      );

      return res.status(500).json({
        message:
          "Server error while submitting report",
      });
    }
  }
);


module.exports = router;