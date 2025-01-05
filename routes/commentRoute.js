const router = require("express").Router();
const validateObjectId = require("../middlewares/validateObjectId");
const {
  createCommentCtrl,
  getAllCommentCtrl,
  deleteCommentCtrl,
  updateCommentCtrl,
} = require("../Controllers/commentsController");
const {
  verifyToken,
  verifyTokenAndAdmin,
} = require("../middlewares/verifyToken");

router
  .route("/")
  .post(verifyToken, createCommentCtrl)
  .get(verifyTokenAndAdmin, getAllCommentCtrl);

router
  .route("/:id")
  .delete(validateObjectId, verifyToken, deleteCommentCtrl)
  .put(verifyToken, validateObjectId, updateCommentCtrl);

module.exports = router;
