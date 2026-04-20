require("dotenv").config()
const connectToDb = require("./src/config/database.js")
const app = require("./src/app")


connectToDb()
app.listen(process.env.PORT, ()=>{
    console.log("Server is running on port 3000")
})