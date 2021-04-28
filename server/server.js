import mysql from "mysql";
import App from "./index";
import dotenv from "dotenv";
import ngrok from 'ngrok';

dotenv.config({path:"./server/config.env"});

process.on("uncaughtException", (err) => {
    console.log("UNCAUGHT EXCEPTION 💥💥, shutting down...");
    console.log(err.name, err.stack);
    process.exit(1);
});



export const connection = mysql.createConnection({
    host:'localhost',
    user:'root',
    password:'Yamu2845@',
    database:'hepay'
}).connect((err)=> {
if(!err){
    console.log('DB connection succeded');
}
else
console.log('DB connection failed \n error' + JSON.stringify(err,undefined,2));

});


const port= process.env.PORT;
// const Server = App.listen(port,()=> process.stdout.write(`Server is running on port  ${port} .....\n***********\n`));
App.listen(port, (err)=> {
    if (err) return console.log(`Something bad happened: ${err}`);
    console.log(`Node.js server listening on ${port}`);

    ngrok.connect(port, function (err, url) {
        console.log(`Node.js local server is publicly-accessible at ${url}`);
        if(err){
            console.log('ngrok error>>>>>'+err);
        }
    });

});


process.on("unhandledRejection", (err) => {
    console.log("UNHANDLED REJECTION 💥💥 Shutting down...");
    console.log(err.stack);
    server.close(() => {
        process.exit(1);
    });
});