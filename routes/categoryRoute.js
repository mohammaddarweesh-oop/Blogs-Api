const {
  verifyTokenAndAdmin,
  verifyToken,
} = require("../middlewares/verifyToken");
const {
  createCategoryCtrl,
  GetAllCategoriesCtrl,
  DeleteCategoryCtrl,
} = require("../Controllers/categoryController");
const router = require("express").Router();

//  /api/category/
router
  .route("/")
  .post(verifyTokenAndAdmin, createCategoryCtrl)
  .get(GetAllCategoriesCtrl);

//  /api/category/:id
router.route("/:id").delete(verifyTokenAndAdmin, DeleteCategoryCtrl);

module.exports = router;
