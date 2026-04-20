const mongoose = require("mongoose")

const connectDB = async ()=>{
    try {
        const connectionInstance = await mongoose.connect(process.env.MONGO_URI)
        console.log("Connected to database", connectionInstance.connection.host)
    } catch (error) {
        console.log(error)
    }
}

module.exports = connectDB