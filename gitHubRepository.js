var express = require("express");
var router = express.Router();

//Import the controller
var gitCommits = require("../controllers/repo");

//Define the route for API
router.get("/commit-diff", gitCommits.gitCommitDiff);

module.exports = router;
