const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  try {
    let token = req.header("Authorization");
    token=token.replace(/^Bearer\s+/,"");
    console.log(token);
    console.log("hello");
    if (!token) return res.status(401).json({ msg: "Please login before proceeding any further !" });
    
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.status(401).json({ msg: "Invalid Authentication"});

      req.user = user;

      console.log("auth check !")
      next();
    })
  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

module.exports = auth;