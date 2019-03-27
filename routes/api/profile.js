const express = require("express");
const router = express.Router();
const passport = require("passport");

//Load Input Validation
const validateProfileInput = require("../../validation/profile");
const validateExperienceInput = require("../../validation/experience");
const validateEducationInput = require("../../validation/education");

//Load User model
const User = require("../../models/User");
//Load Profile model
const Profile = require("../../models/Profile");

// @route GET api/profile/test
// @desc Tests profile route
// @access Public
router.get("/test", (req, res) =>
  res.json({
    msg: "Profile Works"
  })
);

// @route GET api/profile
// @desc get current user profile
// @access Private
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const errors = {};
    Profile.findOne({ user: req.user.id })
      .populate("user", ["name", "avatar"])
      .then(profile => {
        if (!profile) {
          errors.noprofile = "There is no profile for " + req.user.name;
          return res.status(404).json(errors);
        }
        res.json(profile);
      })
      .catch(err => res.status(404).json(err));
  }
);

// @route GET api/profile/all
// @desc  Get all profile
// @access Public
router.get("/all", (req, res) => {
  const errors = {};
  Profile.find()
    .populate("user", ["name", "avatar"])
    .then(profile => {
      if (!profile) {
        errors.noprofile = "There is no profile for " + req.user.name;
        return res.status(404).json(errors);
      }
      res.json(profile);
    })
    .catch(err => res.status(404).json({ profile: "there are no profile" }));
});

// @route GET api/profile/handle/:handle
// @desc  get profile by handle
// @access Public
router.get("/handle/:handle", (req, res) => {
  const errors = {};
  Profile.findOne({ handle: req.params.handle })
    .populate("user", ["name", "avatar"])
    .then(profile => {
      if (!profile) {
        errors.noprofile = "There is no profile for " + req.user.name;
        return res.status(404).json(errors);
      }
      res.json(profile);
    })
    .catch(err => res.status(404).json(err));
});

// @route GET api/profile/user/:user_id
// @desc  get profile by user ID
// @access Public
router.get("/user/:user_id", (req, res) => {
  const errors = {};
  Profile.findOne({ user: req.params.user_id })
    .populate("user", ["name", "avatar"])
    .then(profile => {
      if (!profile) {
        errors.noprofile = "There is no profile for " + req.user.name;
        return res.status(404).json(errors);
      }
      res.json(profile);
    })
    .catch(err =>
      res.status(404).json({ profile: "there is no profile for this user" })
    );
});

// @route Post api/profile
// @desc  create  or update user profile
// @access Private
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    // return res.json(req.body);
    const { errors, isValid } = validateProfileInput(req.body);

    if (!isValid) {
      return res.status(400).json(errors);
    }

    //Get fields
    const profileFileds = {};
    profileFileds.user = req.user.id;
    if (req.body.handle) profileFileds.handle = req.body.handle;
    if (req.body.company) profileFileds.company = req.body.company;
    if (req.body.website) profileFileds.website = req.body.website;
    if (req.body.location) profileFileds.location = req.body.location;
    if (req.body.bio) profileFileds.bio = req.body.bio;
    if (req.body.status) profileFileds.status = req.body.status;
    if (req.body.githubusername)
      profileFileds.githubusername = req.body.githubusername;
    //Skill split into array
    if (typeof req.body.skills !== "undefined") {
      profileFileds.skills = req.body.skills.split(",");
    }
    //social
    profileFileds.social = {};
    if (req.body.youtube) profileFileds.social.youtube = req.body.youtube;
    if (req.body.twitter) profileFileds.social.twitter = req.body.twitter;
    if (req.body.facebook) profileFileds.social.facebook = req.body.facebook;
    if (req.body.linkedin) profileFileds.social.linkedin = req.body.linkedin;
    if (req.body.instagram) profileFileds.social.instagram = req.body.instagram;

    Profile.findOne({ user: req.user.id })
      .then(profile => {
        if (profile) {
          //Pofile exist
          res.status(400).json({
            userProfileExist: "Bad Request, Profile Already Exist..."
          });
        } else {
          //create

          //Check if handle exists
          Profile.findOne({ handle: profileFileds.handle }).then(profile => {
            if (profile) {
              errors.handle = "The handle already exist";
              res.status(400).json(errors);
            }

            //save profile
            new Profile(profileFileds)
              .save()
              .then(profile => res.json(profile));
          });
        }
      })
      .catch(err => res.json(err));
  }
);

// @route Put api/profile
// @desc  update user profile
// @access Private
router.put(
  "/update",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateProfileInput(req.body);

    if (!isValid) {
      return res.status(400).json(errors);
    }
    //Get fields
    const profileFileds = {};
    profileFileds.user = req.user.id;
    if (req.body.handle) profileFileds.handle = req.body.handle;
    if (req.body.company) profileFileds.company = req.body.company;
    if (req.body.website) profileFileds.website = req.body.website;
    if (req.body.location) profileFileds.location = req.body.location;
    if (req.body.bio) profileFileds.bio = req.body.bio;
    if (req.body.status) profileFileds.status = req.body.status;
    if (req.body.githubusername)
      profileFileds.githubusername = req.body.githubusername;
    //Skill split into array
    if (typeof req.body.skills !== "undefined") {
      let index = 0;
      let newArray = [];
      let skillArray = req.body.skills.split(",");

      for (let i = 0; i < skillArray.length; i++) {
        if (!(skillArray[i] === "")) {
          newArray[index] = skillArray[i].trim();
          index += 1;
        }
      }
      if (newArray.length != 0) profileFileds.skills = newArray;

      // profileFileds.skills = req.body.skills.split(",");
    }
    //social
    profileFileds.social = {};
    if (req.body.youtube) profileFileds.social.youtube = req.body.youtube;
    if (req.body.twitter) profileFileds.social.twitter = req.body.twitter;
    if (req.body.facebook) profileFileds.social.facebook = req.body.facebook;
    if (req.body.linkedin) profileFileds.social.linkedin = req.body.linkedin;
    if (req.body.instagram) profileFileds.social.instagram = req.body.instagram;

    Profile.findOne({ user: req.user.id }).then(profile => {
      if (profile) {
        //Update
        Profile.findOneAndUpdate(
          { user: req.user.id },
          { $set: profileFileds },
          { new: true }
        )
          .then(profile => {
            res.json(profile);
          })
          .catch(err => res.json(err));
      } else {
        errors.handle = "Unable to find user profile";
        res.status(400).json(errors);
      }
    });
  }
);

// @route Post api/profile/experience
// @desc  Add experience to profile
// @access Private
router.post(
  "/experience",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateExperienceInput(req.body);

    if (!isValid) {
      return res.status(400).json(errors);
    }

    Profile.findOne({ user: req.user.id })
      .then(profile => {
        const newExp = {
          title: req.body.title,
          company: req.body.company,
          location: req.body.location,
          from: req.body.from,
          to: req.body.to,
          current: req.body.current,
          description: req.body.description
        };

        //Add to exp array
        profile.experience.unshift(newExp);

        profile
          .save()
          .then(profile => res.json(profile))
          .catch(err => res.json(err));
      })
      .catch(err => res.json(err));
  }
);

// @route Post api/profile/education
// @desc  Add education to profile
// @access Private
router.post(
  "/education",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateEducationInput(req.body);

    if (!isValid) {
      return res.status(400).json(errors);
    }

    Profile.findOne({ user: req.user.id })
      .then(profile => {
        const newEdu = {
          school: req.body.school,
          degree: req.body.degree,
          fieldofstudy: req.body.fieldofstudy,
          from: req.body.from,
          to: req.body.to,
          current: req.body.current,
          description: req.body.description
        };

        //Add to edu array
        profile.education.unshift(newEdu);

        profile
          .save()
          .then(profile => res.json(profile))
          .catch(err => res.json(err));
      })
      .catch(err => res.json(err));
  }
);

// @route DELETE api/profile/experience
// @desc  delete experience from profile
// @access Private
router.delete(
  "/experience/:exp_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        //Get remove index

        const removeIndex = profile.experience
          .map(item => item.id)
          .indexOf(req.params.exp_id);
        if (removeIndex >= 0) {
          //Remove experience from array
          profile.experience.splice(removeIndex, 1);

          profile
            .save()
            .then(profile => res.json(profile))
            .catch(err => res.json(err));
        } else {
          res.json({ errors: "Sorry, experience not found" });
        }
      })
      .catch(err => res.json(err));
  }
);

// @route DELETE api/profile/education
// @desc  delete education from profile
// @access Private
router.delete(
  "/education/:edu_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOne({ user: req.user.id })
      .then(profile => {
        //Get remove index

        const removeIndex = profile.education
          .map(item => item.id)
          .indexOf(req.params.edu_id);
        if (removeIndex >= 0) {
          //Add to edu array
          profile.education.splice(removeIndex, 1);

          profile
            .save()
            .then(profile => res.json(profile))
            .catch(err => res.json(err));
        } else {
          res.json({ errors: "Sorry, education not found" });
        }
      })
      .catch(err => res.json(err));
  }
);

// @route DELETE api/profile
// @desc  delete user and profile
// @access Private
router.delete(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Profile.findOneAndRemove({ user: req.user.id })
      .then(() => {
        User.findOneAndRemove({ _id: req.user.id }).then(() =>
          res.json({ success: true })
        );
      })
      .catch(err => res.json(err));
  }
);
module.exports = router;
