const router = require("express").Router();
const {
  createPostCtrl,
  getAllPostsCtrl,
  getSinglePostCtrl,
  getCountPostCtrl,
  getPostDeleteCtrl,
  updatePostCtrl,
  updatePostImageCtrl,
  toggleLikeCtrl,
} = require("../Controllers/postController");
const photoUload = require("../middlewares/photoUpload");
const { verifyToken } = require("../middlewares/verifyToken");
const validateObjectId = require("../middlewares/validateObjectId");

//        /api/posts/
router
  .route("/")
  .post(verifyToken, photoUload.single("image"), createPostCtrl)
  .get(getAllPostsCtrl);

//        /api/posts/count
router.route("/count").get(getCountPostCtrl);

//        /api/posts/:id
router
  .route("/:id")
  .get(validateObjectId, getSinglePostCtrl)
  .delete(validateObjectId, verifyToken, getPostDeleteCtrl)
  .put(validateObjectId, verifyToken, updatePostCtrl);

//      /api/posts/upload-image/:id
router
  .route("/upload-image/:id")
  .put(
    validateObjectId,
    verifyToken,
    photoUload.single("image"),
    updatePostImageCtrl
  );

//    /api/posts/like/:id
router.route("/like/:id").put(validateObjectId, verifyToken, toggleLikeCtrl);

module.exports = router;
