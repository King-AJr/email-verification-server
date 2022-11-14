const express = require('express');
const app = express();
const bp = require('body-parser');
const cors = require('cors');
const PORT = process.env.PORT || 3000;
const userRouter = require('./routes/userRouter')
require('./model/config/db');


const whitelist = ["http://localhost:3000"]
const corsOptions = {
    origin: function (origin, callback) {
        if(!origin || whitelist.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            callback(new Error("not allowed by cors"))
        }
    },
    credentials: true
}
app.use(cors(corsOptions));
app.use(bp.json());
app.use(bp.urlencoded({extended: true}));

app.use('/user', userRouter);


app.listen(PORT, () => console.log(`server is running on ${PORT}`));