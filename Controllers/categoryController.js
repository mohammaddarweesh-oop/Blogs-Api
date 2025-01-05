const asyncHandler = require("express-async-handler");
const { Category, validateCreateCategory } = require("../models/Category");

/**
 * @desc Create New Category
 * @router /api/category/
 * @method POST
 * @access Private (Only Admin)
 */
const createCategoryCtrl = asyncHandler(async (req, res) => {
  const { error } = validateCreateCategory(req.body);

  if (error) {
    return res.status(403).json({ message: error.details[0].message });
  }

  const category = await Category.create({
    title: req.body.title,
    user: req.user.id,
  });
  res.status(201).json(category);
});

/**
 * @desc Get All Categories
 * @router /api/category/
 * @method Get
 * @access Public
 */
const GetAllCategoriesCtrl = asyncHandler(async (req, res) => {
  const categories = await Category.find();

  if (!categories) {
    return res.status(404).json({ message: "Categories Not Found" });
  }
  res.status(200).json(categories);
});

/**
 * @desc Delete Category
 * @router /api/category/:id
 * @method Delete
 * @access Private (Only Admin)
 */
const DeleteCategoryCtrl = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id);

  if (!category) {
    return res.status(404).json({ message: "Category Not Found" });
  }
  res
    .status(200)
    .json({ message: "Category Is Deleted", categoryId: category._id });
});

module.exports = {
  createCategoryCtrl,
  GetAllCategoriesCtrl,
  DeleteCategoryCtrl,
};
