const mongoose = require("mongoose");
const Joi = require("joi");

const CommentSchema = new mongoose.Schema(
  {
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Comment = mongoose.model("Comment", CommentSchema);

// validation Create Comment
function validateCreateComment(obj) {
  const schema = Joi.object({
    postId: Joi.string().required().label("Post ID"),
    text: Joi.string().trim().required(),
  });
  return schema.validate(obj);
}

// validation Update Comment
function validateUpdateComment(obj) {
  const schema = Joi.object({
    text: Joi.string().trim().required(),
  });
  return schema.validate(obj);
}

module.exports = {
  Comment,
  validateCreateComment,
  validateUpdateComment,
};
