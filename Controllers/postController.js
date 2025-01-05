const path = require("path");
const fs = require("fs");
const {
  Post,
  valicateCreatePost,
  valicateUpdatePost,
} = require("../models/Post");
const { Comment } = require("../models/Comment");
const {
  cloudinaryUploadImage,
  cloudinaryRemoveImage,
} = require("../utils/cloudinary");

const asyncHandler = require("express-async-handler");

/**
 * @desc Create New Post
 * @router /api/posts/
 * @method POST
 * @access Private (Only logged in User)
 */
const createPostCtrl = asyncHandler(async (req, res) => {
  //vlaidation for Image
  if (!req.file) {
    return res.status(400).json({ message: "No Image Provided" });
  }

  //validation for Data
  const { error } = valicateCreatePost(req.body);

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  // Upload Photo
  const imagePath = path.join(__dirname, `../images/${req.file.filename}`);
  const result = await cloudinaryUploadImage(imagePath);

  // create New post and save it to DB
  //   const post = new Post({
  //     title: req.body.title,
  //     description: req.body.description,
  //     category: req.body.category,
  //   });
  //   await post1.save();

  // auto Save
  const post = await Post.create({
    title: req.body.title,
    description: req.body.description,
    category: req.body.category,
    user: req.user.id,
    image: {
      url: result.secure_url,
      publicId: result.public_id,
    },
  });

  // send response to client
  res.status(201).json(post);
  fs.unlinkSync(imagePath);
});

/**
 * @desc Get All Posts
 * @router /api/posts/
 * @method GET
 * @access public
 */
const getAllPostsCtrl = asyncHandler(async (req, res) => {
  const POST_PER_PAGE = 3;
  const { pageNumber, category } = req.query;

  let posts;
  if (pageNumber) {
    posts = await Post.find()
      .skip((pageNumber - 1) * POST_PER_PAGE)
      .limit(POST_PER_PAGE)
      .sort({ createdAt: -1 })
      .populate("user", ["-password"]);
  } else if (category) {
    posts = await Post.find({ category })
      .sort({ createdAt: -1 })
      .populate("user", ["-password"]);
  } else {
    posts = await Post.find()
      .sort({ createdAt: -1 })
      .populate("user", ["-password"]);
  }

  if (!posts) {
    return res.status(404).json({ message: "Not Found Posts" });
  }

  res.status(200).json(posts);
});

/**
 * @desc Get Single Post
 * @router /api/posts/:id
 * @method GET
 * @access public
 */
const getSinglePostCtrl = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id)
    .populate("user", ["-password"])
    .populate("comments");

  if (!post) {
    return res.status(404).json({ message: "Not Found Posts" });
  }

  res.status(200).json(post);
});

/**
 * @desc Get Post Coun
 * @router /api/posts/count
 * @method GET
 * @access public
 */
const getCountPostCtrl = asyncHandler(async (req, res) => {
  const postCount = await Post.countDocuments();

  res.status(200).json(postCount);
});

/**
 * @desc Delete Post
 * @router /api/posts/:id
 * @method Delete
 * @access Private (Only Admin Or Owner of the post)
 */
const getPostDeleteCtrl = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return res.status(404).json({ message: "Not Found Posts" });
  }

  if (req.user.isAdmin || req.user.id === post.user.toString()) {
    await Post.findByIdAndDelete(req.params.id);
    await cloudinaryRemoveImage(post.image.publicId);
    await Comment.deleteMany({ postId: post._id });
    res
      .status(201)
      .json({ message: "Deleted Post Is Successfuly", postId: post._id });
  } else {
    res.status(403).json({ message: "access denied for beddin" });
  }

  res.status(200).json(post);
});

/**
 * @desc Update Post
 * @router /api/posts/:id
 * @method PUT
 * @access Private (Only logged in User)
 */
const updatePostCtrl = asyncHandler(async (req, res) => {
  const { error } = valicateUpdatePost(req.body);

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  const post = await Post.findById(req.params.id);
  if (!post) {
    return res.status(400).json({ message: "Post Not Found" });
  }

  if (req.user.id !== post.user.toString()) {
    return res
      .status(403)
      .json({ message: "Access denied, you are not allowed" });
  }

  const updatePost = await Post.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        title: req.body.title,
        description: req.body.description,
        category: req.body.category,
      },
    },
    { new: true }
  ).populate("user", ["-password"]);

  res.status(201).json(updatePost);
});

/**
 * @desc Update Post Image
 * @router /api/posts/upload-image/:id
 * @method PUT
 * @access Private (Only logged in User)
 */
const updatePostImageCtrl = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No Image Provided" }); //
  }

  const post = await Post.findById(req.params.id);
  if (!post) {
    return res.status(400).json({ message: "Post Not Found" });
  }

  if (req.user.id !== post.user.toString()) {
    return res
      .status(403)
      .json({ message: "Access denied, you are not allowed" });
  }

  // delete old image
  await cloudinaryRemoveImage(post.image.publicId);

  //upload new photo
  const imagePath = path.join(__dirname, `../images/${req.file.filename}`);
  const result = await cloudinaryUploadImage(imagePath);

  const updateImage = await Post.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        image: {
          url: result.secure_url,
          publicId: result.public_id,
        },
      },
    },
    { new: true }
  );

  // update image field in db

  res.status(200).json(updateImage);
  fs.unlinkSync(imagePath);
});

/**
 * @desc Toggle Like
 * @router /api/posts/like/:id
 * @method PUT
 * @access Private (Only logged in User)
 */
const toggleLikeCtrl = asyncHandler(async (req, res) => {
  const loggedInUser = req.user.id;
  const { id: postId } = req.params;
  let post = await Post.findById(postId);
  if (!post) {
    return res.status(404).json({ message: "Post Not Found" });
  }

  if (req.user.id !== post.user.toString()) {
    return res.status(403).json({ message: "Access Denied" });
  }

  const isPostAlreadyLiked = post.likes.find(
    (user) => user.toString() === loggedInUser
  );
  if (isPostAlreadyLiked) {
    post = await Post.findByIdAndUpdate(
      postId,
      {
        $pull: {
          likes: loggedInUser,
        },
      },
      { new: true }
    );
  } else {
    post = await Post.findByIdAndUpdate(
      postId,
      {
        $push: {
          likes: loggedInUser,
        },
      },
      { new: true }
    );
  }

  res.status(200).json(post);
});

module.exports = {
  createPostCtrl,
  getAllPostsCtrl,
  getSinglePostCtrl,
  getCountPostCtrl,
  getPostDeleteCtrl,
  updatePostCtrl,
  updatePostImageCtrl,
  toggleLikeCtrl,
};
