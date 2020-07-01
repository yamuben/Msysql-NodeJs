import mysql from "mysql";
import express from "express";
import bodyparser from "body-parser";
import globalErrorHandler from "./controller/errorController";
import * as userController from "./controller/userController";
import axios from "axios";
import MySQLEvents from "@rodrigogs/mysql-events"; 

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
            // console.log(event);
            //event of inserting userdata into MongoDb
            if(event.type ==='INSERT'){
                 let id = event.affectedRows[0].after.userId;
                // console.log('.......................\n' + id);
     
                const res = await userController.getOne(id);
                    console.log(res.data);
                    console.log(res.response.data);
         
            }
        },
    });

    instance.on(MySQLEvents.EVENTS.CONNECTION_ERROR, console.error);
    instance.on(MySQLEvents.EVENTS.ZONGJI_ERROR, console.error);
};

program()
    .then(() => console.log('Waiting for database events...'))
    .catch(console.error);
App.get('/hepay/v1/getusers', userController.getAll);

App.get('/hepay/v1/getoneuser/:id', userController.getOne);

App.use(globalErrorHandler);
export default App;