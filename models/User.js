const Joi = require("joi");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      minlength: 5,
      maxlength: 100,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      minlength: 8,
    },
    profilephoto: {
      type: Object,
      default: {
        url: "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png",
        publicId: null,
      },
    },
    bio: String,
    isAdmin: {
      type: Boolean,
      default: false,
    },
    isAccountVeryfied: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// for relation
UserSchema.virtual("posts", {
  ref: "Post",
  foreignField: "user",
  localField: "_id",
});

UserSchema.methods.generateAuthToken = function () {
  //              pyload , secret key
  return jwt.sign(
    { id: this._id, isAdmin: this.isAdmin },
    process.env.JWT_SECRET,
    {
      expiresIn: "90d",
    }
  );
};

const User = mongoose.model("User", UserSchema);

// Register
function validateRegisterUser(obj) {
  const schema = Joi.object({
    username: Joi.string().trim().required().min(2).max(100),
    email: Joi.string().trim().min(5).max(100).email().required(),
    password: Joi.string().trim().min(8).required(),
  });
  return schema.validate(obj);
}

// login
function validateLoginUser(obj) {
  const schema = Joi.object({
    email: Joi.string().trim().min(5).max(100).email().required(),
    password: Joi.string().trim().min(8).required(),
  });
  return schema.validate(obj);
}

// validate
function validateUpdateUser(obj) {
  const schema = Joi.object({
    username: Joi.string().trim().min(2).max(100),
    password: Joi.string().trim().min(8),
    bio: Joi.string(),
  });
  return schema.validate(obj);
}

module.exports = {
  User,
  validateRegisterUser,
  validateLoginUser,
  validateUpdateUser,
};
