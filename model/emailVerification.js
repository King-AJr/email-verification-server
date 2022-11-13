const {Schema, model} = require('mongoose');

const verificationSchema = new Schema ({
    userid: {
        type: String,
        required: true
    },

    uniqueString: {
        type: String,
        required: true
    },
    expiresAt: {type: Date},
},
    
    {timestamps: true}
)

module.exports = model("emailVerification", verificationSchema);