const express = require('express');
const app = express();
const bp = require('body-parser');
const cors = require('cors');
const PORT = process.env.PORT || 3000;
const userRouter = require('./routes/userRouter')
require('./model/config/db');

app.use(cors());
app.use(bp.json());
app.use(bp.urlencoded({extended: true}));

app.use('/user', userRouter);


app.listen(PORT, () => console.log(`server is running on ${PORT}`));