const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const {
  User,
  validateRegisterUser,
  validateLoginUser,
} = require("../models/User");

/**
 * @desc Register New User
 * @router /api/auth/register
 * @method POST
 * @access Public
 */
module.exports.registerUserCtrl = asyncHandler(async (req, res, next) => {
  const { email, password, username } = req.body;
  // validation
  const { error } = validateRegisterUser(req.body);
  if (error) {
    res.status(400).json({ message: error.details[0].message });
  }

  //is user already exists

  let user = await User.findOne({ email: req.body.email });
  if (user) {
    res.status(400).json({ message: "user already exists" });
  }
  //hash the password

  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(req.body.password, salt);
  //new user and save it to Db
  user = new User({
    username,
    email,
    password: hashPassword,
  });
  await user.save();
  // @TODO - SENDING Email (Verify account if not verified ) //

  //send response to client
  res.status(201).json({ message: "you registered new user successfully" });
});

/**
 * @desc Login User
 * @router /api/auth/login
 * @method POST
 * @access Public
 */
module.exports.loginUserCtrl = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const { error } = validateLoginUser(req.body);

  if (error) {
    res.status(400).json({ message: error.details[0].message });
  }

  const user = await User.findOne({ email: email });
  if (!user) {
    res.status(400).json({ message: "user is not defiend" });
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    res.status(400).json({ message: "Email or Password not exists " });
  }

  // @TODO - SENDING Email (Verify account if not verified )

  const token = user.generateAuthToken();

  res.status(200).json({
    _id: user._id,
    isAdmin: user.isAdmin,
    prifilephoto: user.prifilephoto,
    bio: user.bio,
    token: token,
  });
});
