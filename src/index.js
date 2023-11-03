const express = require('express');
const mongoose = require('mongoose');
require("dotenv").config();
const userRoutes = require("./routes/user");
const transactionRoutes = require("./routes/transaction");

const app = express();
const port = process.env.PORT || 3000;

// middlewareUser
app.use(express.json());
app.use('/api',userRoutes);

// middlewareTransaction
app.use(express.json());
app.use('/api',transactionRoutes);

//routes
app.get('/', (req,res)=>{
    res.send("Welcome to ApiDetection");
});

//mongodb connection
mongoose
    .connect(process.env.MONGODB_URI)
    .then(()=>console.log('conected to mongoDB Atlas'))
.   catch((error) => console.log(error));

app.listen(port, ()=> console.log('servidor escuchando en puerto', port));

