const asyncHandler = require("express-async-handler");
const {
  Comment,
  validateCreateComment,
  validateUpdateComment,
} = require("../models/Comment");
const { User } = require("../models/User");

/**
 * @desc Create New Comment
 * @router /api/comment/
 * @method POST
 * @access Private (Only logged in User)
 */
const createCommentCtrl = asyncHandler(async (req, res) => {
  const { error } = validateCreateComment(req.body);

  if (error) {
    return res.status(400).json({ message: error.details[0].message }); //error.details[0].message
  }

  const profile = await User.findById(req.user.id);
  console.log(req.user.id);

  const comment = await Comment.create({
    postId: req.body.postId,
    text: req.body.text,
    user: req.user.id,
    username: profile.username,
  });

  res.status(201).json(comment);
});

/**
 * @desc Get All Comments
 * @router /api/comment/
 * @method GET
 * @access Private (Only Admin)
 */
const getAllCommentCtrl = asyncHandler(async (req, res) => {
  const comments = await Comment.find().populate("user", [
    "-password",
    "-isAdmin",
  ]);

  if (!comments) {
    return res.status(404).json({ message: "Not Found Comments" });
  }

  res.status(200).json(comments);
});

/**
 * @desc Delete Comment
 * @router /api/comment/:id
 * @method DELETE
 * @access Private (Only Admin or owner of comment)
 */
const deleteCommentCtrl = asyncHandler(async (req, res) => {
  // const comments = await Comment.findByIdAndDelete(req.params.id);
  const comment = await Comment.findById(req.params.id);

  if (!comment) {
    return res.status(404).json({ message: "Not Found Comment" });
  }

  if (req.user.isAdmin || req.user.id === comment.user.toString()) {
    await Comment.findByIdAndDelete(req.params.id);
    return res.status(200).json({ message: "Comment Is Deleted" });
  } else {
    return res.status(403).json({ message: "Access denied, not allowed" });
  }
});

/**
 * @desc Update Comment
 * @router /api/comment/:id
 * @method PUT
 * @access Private ( owner of comment)
 */
const updateCommentCtrl = asyncHandler(async (req, res) => {
  const { error } = validateUpdateComment(req.body);

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  const comment = await Comment.findById(req.params.id);

  if (!comment) {
    return res.status(404).json({ message: "Not Found Comment" });
  }

  if (req.user.id === comment.user.toString()) {
    const updatedComment = await Comment.findByIdAndUpdate(
      req.params.id,
      {
        $set: {
          text: req.body.text,
        },
      },
      { new: true }
    );
    return res.status(200).json({ updatedComment });
  } else {
    return res.status(403).json({
      message: "Access denied, only user himself can edit his comment",
    });
  }
});

module.exports = {
  createCommentCtrl,
  getAllCommentCtrl,
  deleteCommentCtrl,
  updateCommentCtrl,
};
