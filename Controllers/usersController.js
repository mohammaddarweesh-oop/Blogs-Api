const { User, validateUpdateUser } = require("../models/User");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs"); // File Sysytem
const {
  cloudinaryUploadImage,
  cloudinaryRemoveImage,
  cloudinaryRemoveMultipleImage,
} = require("../utils/cloudinary");

const { Post } = require("../models/Post");
const { Comment } = require("../models/Comment");

/**
 * @desc Get All Users
 * @router /api/users/profile
 * @method GET
 * @access Private (Only Admin)
 */
module.exports.getAllUsersCtrl = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password").populate("posts");
  res.status(200).json(users);
});
/**
 * @desc Get User profile
 * @router /api/users/profile/:id
 * @method GET
 * @access Public
 */
module.exports.getUserProfileCtrl = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select("-password")
    .populate("posts");
  if (!user) {
    res.status(404).json({ message: "User Not Found" });
  }
  res.status(200).json(user);
});

/**
 * @desc Update User profile
 * @router /api/users/profile/:id
 * @method PUT
 * @access Private (only user himself)
 */

module.exports.updateUserProfileCtrl = asyncHandler(async (req, res) => {
  const { error } = validateUpdateUser(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
  if (req.body.password) {
    const salt = await bcrypt.genSalt(10);
    req.body.password = await bcrypt.hash(req.body.password, salt);
  }
  const updatedUser = await User.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        username: req.body.username,
        password: req.body.password,
        bio: req.body.bio,
      },
    },
    { new: true }
  ).select("-password");

  res.status(200).json(updatedUser);
});

/**
 * @desc Get Users Count
 * @router /api/users/count
 * @method GET
 * @access Private (Only Admin)
 */
module.exports.getUsersCountCtrl = asyncHandler(async (req, res) => {
  const users = await User.countDocuments();
  res.status(200).json(users);
});

/**
 * @desc Profile Photo Upload
 * @router /api/users/profile/profile-photo-upload
 * @method post
 * @access Private (Only logged in user)
 */

module.exports.profilePhotoCtrl = asyncHandler(async (req, res) => {
  // Validation
  if (!req.file) {
    return res.status(400).json({ message: "no file provided" });
  }
  // Get the path to the image
  const imagePath = path.join(__dirname, `../images/${req.file.filename}`);

  // Upload to cloudinary
  const result = await cloudinaryUploadImage(imagePath);

  //get user from db
  const user = await User.findById(req.user.id);

  if (user.profilephoto.publicId !== null) {
    await cloudinaryRemoveImage(user.profilephoto.publicId);
  }

  user.profilephoto = {
    url: result.secure_url,
    publicId: result.public_id,
  };

  await user.save();

  res.status(200).json({
    message: "your profile photo uploaded successfuly",
    profilephoto: { url: result.secure_url, publicId: result.public_id },
  });

  fs.unlinkSync(imagePath);
});

/**
 * @desc Delete User Profile
 * @router /api/users/profile/:id
 * @method DELETE
 * @access Private (Only Admin Or User Himself)
 */
module.exports.deleteUserProfileCtrl = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({ message: "User Not Found" });
  }

  // gat all posts from db
  const posts = await Post.find({ user: user._id });

  // Get All PublicIds From The Posts
  const publicIds = posts?.map((post) => post.image.publicId);

  //delete all posts image from cloudinary that belong to this user
  if (publicIds?.length > 0) {
    await cloudinaryRemoveMultipleImage(publicIds);
  }

  await cloudinaryRemoveImage(user.profilephoto.publicId);

  // delete Posts & Comments
  await Post.deleteMany({ user: user._id });
  await Comment.deleteMany({ user: user._id });

  // delete User
  await User.findByIdAndDelete(req.params.id);
  return res.status(200).json({ message: "Ypur Profile has been deleted" });
});
