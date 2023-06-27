import { Router } from "express";

const router = Router();

// import all controllers
import * as controller from "../controllers/appController.js";


// Post Methods
router.route('/register').post(controller.register); //register user 
// router.route('/registerMail').post(); //send the email
router.route('/authenticate').post((req,res)=> res.end()); // authenticate mail
router.route('/login').post(controller.login); //login in app

// GET Methods
router.route('/user/:username').get(controller.getUser); // user with username
router.route('/generateOTP').get(controller.generateOTP); // generate random otp
router.route('/verifyOTP').get(controller.verifyOTP); // verify generated OTP
router.route('/createResetSession').get(controller.createResetSession); // reset all the variables

// PUT Methods
router.route("/updateuser").put(controller.updateuser); // is use to update the user profile 
router.route("/resetPassword").put(controller.resetPassword); // use to reset password 


export default router;
