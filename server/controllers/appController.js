import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import otpGenerator from "otp-generator";
import ENV from "../config.js";
import UserModel from "../model/User.model.js";
 
// middleware for verify user 
export async function verifyUser(req, res, next){
    try {
        const {username } = req.method == "GET" ? req.query : req.body;

        // check the user existance 
        let exist = await UserModel.findOne({username});
        if(!exist) return res.status(404).send({error : "Can't Find user!"});
        next();
    } catch (error) {
        return res.status(404).send({error : "Authentication Error"});
    }
}

/** POST: http://localhost:8080/api/register 
 * @param : {
  "username" : "example123",
  "password" : "admin123",
  "email": "example@gmail.com",
  "firstName" : "bill",
  "lastName": "william",
  "mobile": 8009860560,
  "address" : "Apt. 556, Kulas Light, Gwenborough",
  "profile": ""
}
*/
export async function register(req, res){
    const { username, password, profile, email } = req.body;


    if(!username || !password || !profile || !email) {
        return res.status(422).json({error : "Please Fill all required filed."});
    }

   try {
        const existUsername = await UserModel.findOne({username : username});
        if(existUsername){
            return res.status(422).json({error : "User name already Exit"});
        }

        const existEmail = await UserModel.findOne({email : email});
        if(existEmail){
            return res.status(422).json({error : "Please use unique Email"});
        }
        // password hashed 
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = new UserModel({
            username,
            password : hashedPassword,
            profile : profile || " ",
            email
        });

        await user.save();
        res.status(200).json({message : "Registration Successful! "});
   } catch (error) {
        res.status(500).send(error)
   }

}

/** POST: http://localhost:8080/api/login 
 * @param: {
  "username" : "example123",
  "password" : "admin123"
}
*/
export async function login(req, res){
    
    
    try {
        const {username , password} = req.body;
        
        if(!username || !password){
            res.status.json({error : "Please Filled the data"});
    
        }
        
        const user = await UserModel.findOne({username : username});
        

        if(user){
            
            const passMatch = await bcrypt.compare(password, user.password);

            if(!passMatch) return res.status(400).send({error : "Invalid Password"});
            let token = jwt.sign({
                userId : user._id,
                username : user.username,
            },ENV.SECRET_KEY, {expiresIn : "24h"});
    
            
    
            return res.status(200).send({
                msg : "Login Successful!",
                username : user.username,
                token
            })
        }else{
            return res.status(500).json({error : "Invalid Command"})
        }
    } catch (error) {
        return res.status(500).json({error})
    }


}
  
/** GET: http://localhost:8080/api/user/example123 */
export async function getUser(req, res){
    const {username} = req.params;

    try {
        if(!username) return res.status(501).send({error : "Invalid Username"});

        // select use for remove specific filed remove by using -password 
        let user = await UserModel.findOne({username}).select(' -password');

        if(!user) return res.status(501).send({error: "Couldn't find the user"});

        res.status(200).send(user)
    } catch (error) {
        res.status(404).send({error : "Cannot Find User Data"})
    }

}

/** PUT: http://localhost:8080/api/updateuser 
 * @param: {
  "id" : "<userid>"
}
body: {
    firstName: '',
    address : '',
    profile : ''
}
*/
export async function updateuser(req, res){
    try {
          
        // const id = req.query.id;
        const { userId } = req.user;
        

        if(userId){
            const body = req.body;

            // update the data
            UserModel.updateOne({ _id : userId }, body)
                .then(() => {
                    res.status(200).send({message : " Updated Data!" })
                })
                .catch((error) => {
                   res.status(500).send({error : " An error occurred while updating user details"})
                });

        }else{
            return res.status(401).send({ error : "User Not Found...!"});
        }
    } catch (error) {
        res.status(500).send({error})
    }
}
/** GET: http://localhost:8080/api/generateOTP */
export async function generateOTP(req, res){
    
    req.app.locals.OTP = await otpGenerator.generate(6, {lowerCaseAlphabets : false, upperCaseAlphabets : false, specialChars : false});
    res.status(201).send({code : req.app.locals.OTP});
    
}
/** GET: http://localhost:8080/api/verifyOTP */

export async function verifyOTP(req, res){
    const {code } = req.query;

    if(parseInt(req.app.locals.OTP) == parseInt(code)){
        req.app.locals.OTP = null;  // reset the otp value 
        req.app.locals.resetSession = true // start session for reset password
        return res.status(200).send({msg : "Verify Successfully!"})
    }
    return res.status(400).send({error : "Invalid OTP"})
}
// successfully redirect user when OTP is valid
/** GET: http://localhost:8080/api/createResetSession */

export async function createResetSession(req, res){
    if(req.app.locals.resetSession){
       
        return res.status(201).send({flag : req.app.locals.resetSession});
    }
    return res.status(440).send({error : "Session Expired!"})
}


// update the password when we have valid session
/** PUT: http://localhost:8080/api/resetPassword */

export async function resetPassword(req, res){
    try {
        if(!req.app.locals.resetSession) return res.status(440).send({error : "Session Expired!"});

        const {username, password} = req.body;

        try {
            UserModel.findOne({username})
                .then(user =>{
                    bcrypt.hash(password, 10)
                        .then(hashedPassword =>{
                            UserModel.updateOne({username : user.username}, {password : hashedPassword})
                                .then(update =>{
                                    req.app.locals.resetSession = false;
                                    return res.status(200).send({msg : "User Data Updated.."});

                                })
                                .catch(error =>{
                                    return res.status(500).send({error});
                                })
                            
                        })
                        .catch(error =>{
                            return res.status(500).send({error : "Enable to hashed Password"});
                        })
                })
        } catch (error) {
            return res.status(500).send({error : "Username not found"});
        }
    } catch (error) {
        return res.status(401).send({error: "Some Error"})
    }
}