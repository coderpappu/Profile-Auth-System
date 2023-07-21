import jwt from "jsonwebtoken";
import ENV from "../config.js";


export default async function Auth(req, res, next){
    try {
        // access token from headers auth 
        const token = req.headers.authorization.split(" ")[1];

        // retrive the user details from the logged in user 
        const decodedToken = await jwt.verify(token, ENV.SECRET_KEY);

        // user details save 
        req.user = decodedToken;

       
        next();
    } catch (error) {
        res.status(401).json({error : "Authentication Failed! "})
    }
}

// otp middlware 
export function localVariables(req, res, next){
    req.app.locals = {
        OTP : null,
        resetSession : false
    };
    next();
    
}