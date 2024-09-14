import User from "../models/user.model.js"; // Import the User model to interact with the users collection in the database
import bcryptjs from "bcryptjs"; // Import bcryptjs to handle password hashing and verification
import { errorHandler } from "../utils/error.js"; // Import a custom error handler function
import jwt from "jsonwebtoken"; // Import jsonwebtoken to generate and verify JWT tokens

// Sign-up function to register a new user
export const signup = async (req, res, next) => {
  const { username, email, password } = req.body; // Destructure and extract username, email, and password from the request body
  const hashedPass = bcryptjs.hashSync(password, 10); // Hash the password with a salt factor of 10 for security
  const newUser = new User({ username, email, password: hashedPass }); // Create a new User instance with the provided username, email, and hashed password

  try {
    await newUser.save(); // Save the new user to the database
    res.status(201).json("Account created successfully"); // Send a success response with status 201 (Created)
  } catch (error) {
    next(error); // Pass any errors to the next middleware for error handling
  }
};

// Sign-in function to authenticate an existing user
export const signin = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const isUserValid = await User.findOne({ email }); // Look for a user in the database with the provided email
    if (!isUserValid)
      return next(errorHandler(400, "Could not find user with that email")); // If no user is found, return a 400 error (Bad Request)
    const isPasswordValid = bcryptjs.compareSync(
      password,
      isUserValid.password
    ); // Compare the provided password with the hashed password in the database

    if (!isPasswordValid)
      return next(errorHandler(401, "Wrong password. Try again")); // If the password is incorrect, return a 401 error (Unauthorized)

    const token = jwt.sign({ id: isUserValid.id }, process.env.JWT_SECRET); // Generate a JWT token using the user's ID and a secret key
    // The token is not sent in this code, but it's usually returned in the response or saved in a cookie
    const { password: userPass, ...restOfUserInfo } = isUserValid._doc;
    res
      .cookie("access_token", token, { httpOnly: true })
      .status(200)
      .json(restOfUserInfo);
  } catch (error) {
    next(error); // Pass any errors to the next middleware for error handling
  }
};

export const google = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });

    if (user) {
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      const { password: userPass, ...restOfUserInfo } = user._doc;
      res
        .cookie("access_token", token, { httpOnly: true })
        .status(200)
        .json(restOfUserInfo);
    } else {
      const generatedPassword = Math.random().toString(36).slice(-8);
      const hashedGeneratedPass = bcryptjs.hashSync(generatedPassword, 10);
      const newUser = new User({
        username:
          req.body.name.split(" ").join("").toLowerCase() +
          Math.random().toString(36).slice(-4),
        email: req.body.email,
        password: hashedGeneratedPass,
        avatar: req.body.avatar,
      });

      await newUser.save();
      const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET);
      const { password: userPass, ...restOfUserInfo } = user._doc;
      res
        .cookie("access_token", token, { httpOnly: true })
        .status(200)
        .json(restOfUserInfo);
    }
  } catch (error) {
    next(error);
  }
};
