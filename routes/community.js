const express = require("express");

const Community = require("../models/Community");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

/*
   CREATE COMMUNITY
*/
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        message: "Community name is required",
      });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({
        message: "Community description is required",
      });
    }

    const existingCommunity = await Community.findOne({
      name: name.trim(),
    });

    if (existingCommunity) {
      return res.status(400).json({
        message: "A community with this name already exists",
      });
    }

    const community = await Community.create({
      name: name.trim(),
      description: description.trim(),
      creator: req.userId,
    });

    const populatedCommunity = await Community.findById(
      community._id
    ).populate("creator", "name email");

    res.status(201).json({
      message: "Community created successfully",
      community: populatedCommunity,
    });
  } catch (error) {
    console.error("Create community error:", error);

    res.status(500).json({
      message: "Server error while creating community",
    });
  }
});

/*
   GET ALL COMMUNITIES
*/
router.get("/", authMiddleware, async (req, res) => {
  try {
    const communities = await Community.find()
      .populate("creator", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      communities,
    });
  } catch (error) {
    console.error("Get communities error:", error);

    res.status(500).json({
      message: "Server error while fetching communities",
    });
  }
});

module.exports = router;