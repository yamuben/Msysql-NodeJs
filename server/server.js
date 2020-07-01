import mysql from "mysql";
import App from "./index";
import dotenv from "dotenv";

dotenv.config({path:"./server/config.env"});

process.on("uncaughtException", (err) => {
    console.log("UNCAUGHT EXCEPTION 💥💥, shutting down...");
    console.log(err.name, err.stack);
    process.exit(1);
});



export const connection = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'',
    database:'hepayfinal'
}).connect((err)=> {
if(!err){
    console.log('DB connection succeded');
}
else
console.log('DB connection failed \n error' + JSON.stringify(err,undefined,2));

});
const port= process.env.PORT;
const Server = App.listen(port,()=> process.stdout.write(`Server is running on port  ${port} .....\n***********\n`));

process.on("unhandledRejection", (err) => {
    console.log("UNHANDLED REJECTION 💥💥 Shutting down...");
    console.log(err.stack);
    server.close(() => {
        process.exit(1);
    });
});