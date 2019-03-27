const express = require("express");
const router = express.Router();
const passport = require("passport");

//Load Input Validation
const validatePostInput = require("../../validation/post");

//Load User model
const Post = require("../../models/Post");
//Load User model
const Profile = require("../../models/Profile");

// @route GET api/posts/test
// @desc Tests post route
// @access Public
router.get("/test", (req, res) =>
  res.json({
    msg: "Posts Works"
  })
);

// @route Get api/post
// @desc  Get all post
// @access Public
router.get("/", (req, res) => {
  Post.find()
    .sort({ date: -1 })
    .then(posts => res.json(posts))
    .catch(err => res.status(404));
});

// @route Get api/post/:id
// @desc  Get post by id
// @access Public
router.get("/:id", (req, res) => {
  Post.findById(req.params.id)
    .then(posts => res.json(posts))
    .catch(err => res.status(404).json({ errors: "Post Not Found" }));
});

// @route Delete api/post/:id
// @desc  Delete post by id
// @access Private
router.delete(
  "/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        Post.findById(req.params.id)
          .then(post => {
            //check for post owner
            if (post.user.toString() !== req.user.id) {
              return res
                .status(401)
                .json({ notAuthorized: "User not authorized" });
            } else {
              //Delete
              post
                .remove()
                .then(() => res.json({ success: true }))
                .catch(err => res.status(404).json(err));
            }
          })
          .catch(err => res.status(404).json({ postError: "Post Not Found" }));
      })
      .catch(err =>
        res.status(404).json({ profileError: "Profile Not Found" })
      );
  }
);

// @route POST api/post/likes/:id
// @desc  Like post
// @access Private
router.post(
  "/likes/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        Post.findById(req.params.id)
          .then(post => {
            if (
              post.likes.filter(like => like.user.toString() === req.user.id)
                .length > 0
            ) {
              return res
                .status(400)
                .json({ alreadyLiked: "User already liked this post" });
            }

            //Add user id to likes array
            post.likes.unshift({ user: req.user.id });
            post.save().then(post => res.json(post));
          })
          .catch(err => res.status(404).json({ postError: "Post Not Found" }));
      })
      .catch(err =>
        res.status(404).json({ profileError: "Profile Not Found" })
      );
  }
);

// @route POST api/post/unlikes/:id
// @desc  Unlike post
// @access Private
router.post(
  "/unlikes/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        Post.findById(req.params.id)
          .then(post => {
            if (
              post.likes.filter(like => like.user.toString() === req.user.id)
                .length === 0
            ) {
              return res
                .status(400)
                .json({ alreadyLiked: "User is yet to like this post" });
            }

            //Add user id to likes array
            const removeIndex = post.likes
              .map(item => item.user.toString())
              .indexOf(req.user.id);

            //splice out of array
            post.likes.splice(removeIndex, 1);
            //save
            post.save().then(post => res.json(post));
          })
          .catch(err => res.status(404).json({ postError: "Post Not Found" }));
      })
      .catch(err =>
        res.status(404).json({ profileError: "Profile Not Found" })
      );
  }
);

// @route Post api/post
// @desc  create  new post
// @access Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    if (!isValid) {
      return res.status(400).json(errors);
    }

    //Get fields
    const newPost = new Post({
      text: req.body.text,
      name: req.body.name,
      avatar: req.body.avatar,
      user: req.user.id
    });
    newPost.save().then(post => res.json(post));
  }
);

// @route POST api/posts/comments/:id
// @desc  Add comment to post
// @access Private
router.post(
  "/comments/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    if (!isValid) {
      return res.status(400).json(errors);
    }

    Post.findById(req.params.id)
      .then(post => {
        //Add comment to this post
        post.comments.unshift({
          user: req.user.id,
          text: req.body.text,
          name: req.body.name,
          avatar: req.body.avatar
        });
        post.save().then(post => res.json(post));
      })
      .catch(err => res.status(404).json({ postError: "Post Not Found" }));
  }
);

// @route Delete api/posts/comments/:id
// @desc  Delete comment from post
// @access Private
router.delete(
  "/comments/:post_id/:com_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Post.findById(req.params.post_id)
      .then(post => {
        if (
          post.comments.filter(
            comment => comment._id.toString() === req.params.com_id
          ).length === 0
        ) {
          return res.status(404).json({ notFound: "Comment not found" });
        }

        //Remove comment form comments array
        const removeIndex = post.comments
          .map(item => item._id.toString())
          .indexOf(req.params.com_id);

        //splice out of array
        post.comments.splice(removeIndex, 1);
        //save
        post.save().then(post => res.json(post));
      })
      .catch(err => res.status(404).json({ postError: "Post Not Found" }));
  }
);
module.exports = router;
