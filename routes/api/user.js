const express = require("express");
const router = express.Router();

// @route GET api/user/test
// @desc Tests user route
// @access Public
router.get("/test", (req, res) =>
  res.json({
    msg: "Users Works"
  })
);

module.exports = router;
