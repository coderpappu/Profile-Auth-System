// import axios from "axios";
import jwt_decode from "jwt-decode";
import axios from "./api";
// ** make API reques **

// to get username from token 
export async function getUsername(){
    const token = localStorage.getItem('token');
    if(!token) return Promise.reject("Cannot Find Token");
    let decode = jwt_decode(token);
    return decode;
}

// authenticate function 
export async function authenticate(username){
    try {
        return await axios.post('/api/authenticate', {username})
    } catch (error) {
        return {error : "Username dosen't exist..!"}
    }
}

// get user 
export async function getUser({username}){
    try {
        const {data} = await axios.get(`/api/user/${username}`);
        return data;
    } catch (error) {
        return {error : "Password doesn't Match...!"}
    }
}

// register user 
export async function register(credentials){
    try {
        const {data : {msg}, status} = await axios.post(`/api/register`, credentials);
        let {username , email} = credentials;

        // send email 
        if(status == 200) {
            await axios.post(`api/registerMail`, {username , userEmail : email, text : msg});
        }
        return Promise.resolve(msg);

    } catch (error) {
        return Promise.reject({error})
    }
}

// login function 
export async function verifyPassword({username, password}){
    try {
        if(username){
            const {data} = await axios.post(`api/login`, {username, password});
            return Promise.resolve({data});
        }
    } catch (error) {
        return Promise.reject({error : "Password doesn't Match..!"})
    }
}

// update user function 
export async function updateuser(response){
    try {
        const token = await localStorage.getItem('token');
        const data = await axios.put('/api/updateuser', response, {headers : {"Authorization" : `Bearer ${token}`}});
        return Promise.resolve({data})
    } catch (error) {
        return Promise.reject({error : "Couldn't Update Profile..!"})
    }
}

// generate otp 
export async function generateOTP(username){
    try {
        const {data : {code}, status} = await axios.get('/api/generateOTP', {params : {username}});
      
        if(status == 201){
            let data = await getUser({username});
            let text = `Your Password Recovery OTP is ${code}. Verify and recover your password`;

            await axios.post('/api/registerMail', {username, userEmail : data.email, text , subject : "Password Recovery OTP"});

        }
        return Promise.resolve(code);

    } catch (error) {
        return Promise.reject({error })
    }
}



/** verify OTP */
export async function verifyOTP({ username, code }){
    try {
       const { data, status } = await axios.get('/api/verifyOTP', { params : { username, code }})
    
       return { data, status }
      
    } catch (error) {
        return Promise.reject(error);
    }
}
// reset password

export async function resetPassword({username, password}){
    try {
        const {data , status} = await axios.put('/api/resetPassword', {username, password});
        return Promise.resolve({data, status});

    } catch (error) {
        return Promise.reject({error})
    }
}   