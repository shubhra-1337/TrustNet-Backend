const express = require("express");

const Post = require("../models/Post");
const Comment = require("../models/Comment");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

/*
   CREATE POST
*/
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { content, community } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        message: "Post content is required",
      });
    }

    const post = await Post.create({
      author: req.userId,
      content: content.trim(),
      community: community || "Community",
    });

    const populatedPost = await Post.findById(post._id)
      .populate("author", "name email");

    res.status(201).json({
      message: "Post created successfully",
      post: populatedPost,
    });
  } catch (error) {
    console.error("Create post error:", error);

    res.status(500).json({
      message: "Server error while creating post",
    });
  }
});

/*
   GET ALL POSTS
*/
router.get("/", authMiddleware, async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("author", "name email")
      .sort({ createdAt: -1 });

    const result = posts.map((post) => {
      const postObject = post.toObject();

      const likedBy = post.likedBy || [];

      return {
        ...postObject,
        likes: likedBy.length,
        likedByMe: likedBy.some(
          (userId) => userId.toString() === req.userId.toString()
        ),
      };
    });

    res.status(200).json({
      posts: result,
    });
  } catch (error) {
    console.error("Get posts error:", error);

    res.status(500).json({
      message: "Server error while fetching posts",
    });
  }
});

/*
   LIKE / UNLIKE POST
*/
router.post("/:postId/like", authMiddleware, async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.userId;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    const alreadyLiked = post.likedBy.some(
      (id) => id.toString() === userId.toString()
    );

    if (alreadyLiked) {
      post.likedBy = post.likedBy.filter(
        (id) => id.toString() !== userId.toString()
      );

      post.likes = post.likedBy.length;

      await post.save();

      return res.status(200).json({
        message: "Post unliked",
        liked: false,
        likes: post.likes,
      });
    }

    post.likedBy.push(userId);
    post.likes = post.likedBy.length;

    await post.save();

    res.status(200).json({
      message: "Post liked",
      liked: true,
      likes: post.likes,
    });
  } catch (error) {
    console.error("Like post error:", error);

    res.status(500).json({
      message: "Server error while liking post",
    });
  }
});

/*
   GET COMMENTS FOR A POST
*/
router.get("/:postId/comments", authMiddleware, async (req, res) => {
  try {
    const { postId } = req.params;

    const comments = await Comment.find({ post: postId })
      .populate("author", "name email")
      .sort({ createdAt: 1 });

    res.status(200).json({
      comments,
    });
  } catch (error) {
    console.error("Get comments error:", error);

    res.status(500).json({
      message: "Server error while fetching comments",
    });
  }
});

/*
   ADD COMMENT TO A POST
*/
router.post("/:postId/comments", authMiddleware, async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        message: "Comment content is required",
      });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    const comment = await Comment.create({
      post: postId,
      author: req.userId,
      content: content.trim(),
    });

    post.comments = await Comment.countDocuments({
      post: postId,
    });

    await post.save();

    const populatedComment = await Comment.findById(comment._id)
      .populate("author", "name email");

    res.status(201).json({
      message: "Comment added successfully",
      comment: populatedComment,
      comments: post.comments,
    });
  } catch (error) {
    console.error("Add comment error:", error);

    res.status(500).json({
      message: "Server error while adding comment",
    });
  }
});

module.exports = router;
