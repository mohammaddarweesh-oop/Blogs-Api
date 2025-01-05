const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  const authToken = req.headers.authorization;
  if (authToken) {
    const token = req.headers.authorization.split(" ")[1];
    try {
      //                             token , private key
      const decodedPayload = jwt.verify(token, process.env.JWT_SECRET);
      // new object to request
      req.user = decodedPayload;
      next();
    } catch (error) {
      return res.status(401).json({ message: "Invalid token, access denied" });
    }
  } else {
    return res
      .status(401)
      .json({ message: "No token provided, access denied" });
  }
}

//verify Token And Admin
function verifyTokenAndAdmin(req, res, next) {
  verifyToken(req, res, () => {
    if (req.user.isAdmin) {
      next();
    } else {
      res.status(403).json({ message: "not allowed, Only Admin" });
    }
  });
}

// verify Token And Only User Himself
function verifyTokenAndOnlyUser(req, res, next) {
  verifyToken(req, res, () => {
    if (req.user.id === req.params.id) {
      next();
    } else {
      res.status(403).json({ message: "not allowed, Only User" });
    }
  });
}

// verify Token And Authorization
function verifyTokenAndAuthorization(req, res, next) {
  verifyToken(req, res, () => {
    if (req.user.id === req.params.id || req.user.isAdmin) {
      next();
    } else {
      res.status(403).json({ message: "not allowed, Only User or Admin" });
    }
  });
}

module.exports = {
  verifyToken,
  verifyTokenAndAdmin,
  verifyTokenAndOnlyUser,
  verifyTokenAndAuthorization,
};
