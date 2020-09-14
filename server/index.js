import mysql from "mysql";
import express from "express";
import bodyparser from "body-parser";
import globalErrorHandler from "./controller/errorController";
import * as userController from "./controller/userController";
import axios from "axios";
import MySQLEvents from "@rodrigogs/mysql-events";
import isOnline from "is-online";
// import * as checknet from "./controller/checknet";

// console.log(checknet.isInternetAvailable());
const App = express();
App.use(bodyparser.json());

const program = async (req,res,next) => {
    const connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: ''
    });

    const instance = new MySQLEvents(connection, {
        startAtEnd: true,
        excludeSchimas: { mysql: true }
    });

    await instance.start();

    instance.addTrigger({
        name: 'triggering',
        expression: 'hepayfinal.*',
        statement: MySQLEvents.STATEMENTS.ALL,
        onEvent: async (event) => { // You will receive the events here
            // console.log(event.affectedRows[0].after);
            //event of inserting userdata into MongoDb
            if((event.type ==='INSERT' || event.type==='UPDATE') && event.table === 'userinfos'){
                 let id = event.affectedRows[0].after.userId;
                // console.log('.......................\n' + id);
     
                const res = await userController.getOne(id,event.type);
                    console.log(res.data);
                    console.log(res.response.data);
         
            }
            else if ((event.type === 'INSERT' || event.type === 'UPDATE') && event.table==='allservice'){

                let grpId = event.affectedRows[0].after.groupId;
                let userId = event.affectedRows[0].after.userId;
                let serviceName = event.affectedRows[0].after.serviceName;
                console.log('*****************************\n');
                // for (i=0;i<2;i++)
                console.log(event.affectedRows[0].after);
                await userController.getservice(grpId,userId,serviceName ,event.type);
                // console.log(res.data);
                // console.log(res.response.data);

            }
        },
    });

    instance.on(MySQLEvents.EVENTS.CONNECTION_ERROR, console.error);
    instance.on(MySQLEvents.EVENTS.ZONGJI_ERROR, console.error);
};

program()
    .then(async() => {
        if(await isOnline())
        console.log('Internet available..\n');
        else
        console.log('No Internet Available..\n');
        console.log('Waiting for database events...')})
    .catch(console.error);
App.get('/hepay/v1/getusers', userController.getAll);

App.get('/hepay/v1/getoneuser/:id', userController.getOne);
App.post('/user/',userController.retreiveData);

App.use(globalErrorHandler);
export default App;