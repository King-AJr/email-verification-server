const bcrypt = require('bcrypt');
const user = require('../model/user');
const router = require('../routes/userRouter');
const nodemailer = require('nodemailer');
const {v4: uuidv4 } = require('uuid')
const emailVerification = require('../model/emailVerification');
const path = require('path')
const dotenv = require('dotenv')
dotenv.config({path: path.resolve(__dirname,'../model/config/.env')})

const validateUsername = async name => {
    let employee = await user.findOne({ name });
    return employee ? false : true;
  };

  const validateUserEmail = async email => {
    let employee = await user.findOne({ email });
    return employee ? false : true;
  };

const signup = async (req, res) => {
    const {name, email, password} =  req.body;
   if(!name || !password || !email){
      return res.status(403).json({
         message: 'invalid credentials'
      })
   }
 let nameTaken = await validateUsername(name);
 let emailTaken = await validateUserEmail(email);

 if(!nameTaken){
    return res.status(409).json({
        message: 'user name is already taken'
    })
 }

 if(!emailTaken){
   return res.status(409).json({
        message: 'email is already taken'
    })
 }

 //encrypt password
 const hashedPassword = await bcrypt.hash(password, 12);

 const newUser = new user({
    name,
    email,
    password: hashedPassword,
    verified: false
 })


 await newUser.save()
 .then((result) => {
    sendVerification(result, res);
 })
 return res.status(201).json({
    message: 'successfully registered now login'
 });

}

const login = async(req, res) => {
    const { name, email, password } = req.body;
      console.log(password);
   let existingUser = await user.findOne({name});
   console.log(existingUser);
   if(!existingUser){
      return res.status(403).json({
         message: 'user details not found'
      })
   }
   if(!existingUser.verified){
      return res.status(403).json({
         message: "please verify your account",
         
      })
   }
   let verify = await bcrypt.compare(password, existingUser.password)
   if(verify){
     return res.json({
         message: `wecome ${name}`,
         login: "successful"
      })
   }else{
      return res.status(403).json({
         message: 'invalid credentials'
      })
   }
   
}

let transporter = nodemailer.createTransport({
   service: "gmail",
   auth: {
       user: process.env.AUTH_EMAIL,
       pass: process.env.AUTH_PASSWORD
   }
})

transporter.verify((error, success) => {
   if(error) {
       console.log(error);
   }else {
       console.log("its working")
   }
})


const sendVerification = (result, res) => {
const {_id, email} = result;
const currentURL = "https://enigmatic-meadow-80878.herokuapp.com/";
const uniqueString = uuidv4() + _id;

const mailOptions = {
   from: "talk2ajur@gmail.com",
   to: email,
   subject: "Verify your email",
   html: `<p>Verify your email address to complete
           your signup</p>
           <p>This link <b> expires in 6 hours</b>.</p>
           <p> Click <a href =${currentURL+"user/verify/"+_id+"/"+uniqueString}> here</a>
           to proceed.</p>`
}

bcrypt.hash(uniqueString, 12)
.then((hashedUniqueString) => {
   const verify = new emailVerification({
       userid: _id,
       uniqueString: hashedUniqueString,
       createdAt: Date.now(),
       expiresAt: Date.now() + 21600,
   })

   verify.save()
   .then(() => {
       transporter
       .sendMail(mailOptions)
       .then(() => {
         console.log("email sent")
         //   return res.json({
         //       status: "PENDING",
         //       message: 'verification email sent'
         //    })
       })
       .catch((error) => {
           console.log(error);
           return res.status(403).json({
               message: 'An error occured while sending mail'
            })
       })
   })
   .catch((error) => {
       console.log(error);
       return res.status(403).json({
           message: 'An error occured while saving verification email data'
        })
   })
}) 
.catch((error) => {
   console.log(error);
   return res.status(403).json({
       message: 'An error occured'
    })
})

}

const verifyCredentials = (userid, uniqueString, res) => {
   console.log(userid)
emailVerification.findOne({userid})
.then((result) => {
   let unique = await bcrypt.compare(password, existingUser.password)
   if(unique){
      if(result.userid) {
         const {expiresAt} = result;
         console.log(expiresAt);
         if(expiresAt < Date.now()){
             emailVerification.deleteOne({userid})
             .then(async () => {
               let verify = await user.updateOne({_id: userid}, {$set: {verified: true}});
               console.log(`verify : ${verify}`);
                 let message = "thanks for verifying your email please sign in";
                 res.redirect(`http:localhost:3000/verify/:error=false/:message=${message}`)
             })
         }else{
           user.deleteOne({_id: userid})
             let message = "Link has expired, please signup again";
             res.redirect(`http:localhost:3000/verify/error=true&message=${message}`)
         }    
     }
     else{
           let message = "Account record doesn't exist or has been verified, try signing in or signup"
           res.redirect(`http:localhost:3000/verify/error=true&message=${message}`)
     }
   }else{
      let message = "Account record doesn't exist please signup"
           res.redirect(`http:localhost:3000/verify/error=true&message=${message}`)
   }
   
})
.catch((error) => {
   console.log(error);
   let message = "an error occurred while checking for existing user verification record";
   res.redirect(`http:localhost:3000/verify/error=true&message=${message}`)
})
}


module.exports = {signup, login, verifyCredentials}