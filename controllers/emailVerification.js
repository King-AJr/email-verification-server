const emailVerification = require('../model/emailVerification');
const {v4: uuidv4} = require('uuid')
const nodemailer = require('nodemailer')
require('dotenv').config();
const user = require('../model/user');
const bcrypt = require('bcrypt')


    let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: 'talk2ajur@gmail.com',
            pass: 'ddtdttkxmiuhkraw'
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
    const currentURL = "http://localhost:3000/";
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
                return res.json({
                    status: "PENDING",
                    message: 'verification email sent'
                 })
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

const verifyCredentials = (userId, uniqueString, res) => {
    emailVerification.findOne({userId})
    .then((result) => {
        if(result.length > 0) {
            const {expiresAt} = result[0];
            if(expiresAt < Date.now()){
                emailVerification.deleteOne({userId})
                .then(() => {
                   user.deleteOne({_id: userId})
                   .then(() => {
                    let message = "thanks for verifying your email please signup";
                    res.redirect(`/user/verified/error=false&message=${message}`)
                   })
                })
            }else{
                let message = "Link has expired, please signup again";
                res.redirect(`/user/verified/error=false&message=${message}`)
            }    
        }
        else{
              let message = "Account record doesn't exist or has been verified, try signing in or signup"
              res.redirect(`/user/verified/error=true&message=${message}`)
        }
    })
    .catch((error) => {
        console.log(error);
        let message = "an error occurred while checking for existing user verification record";
        res.redirect(`/user/verified/error=true&message=${message}`)
    })
}


module.exports = {sendVerification, verifyCredentials};