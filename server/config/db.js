const mongoose = require('mongoose');
const connectDB = async()=>{
    try{
        mongoose.set('strictQuery',true);
        console.log(process.env.MONGODB_URI);
        const conn = await mongoose.connect('mongodb+srv://sunnykr:testing321@sunnydata.fh2mc.mongodb.net/blog');
        console.log(`Database connected: ${conn.connection.host}`);

    }catch(error){
        console.log(error);
    }
}

module.exports = connectDB;