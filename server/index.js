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

App.get('/hepay/v1/getusers', userController.getAll);

App.get('/hepay/v1/getuser/:userid', userController.getOnePatient);
App.post('/hepay/v1/quotion',userController.payWithQuotion);
App.post('/hepay/v1/momopay',userController.payWithMomo);
App.post('/hepay/v1/quotion/momopay',userController.updateQuotion);

App.get('/hepay/v1/getoneuser/:id', userController.getOne);
App.post('/hepay/v1/updateservices', userController.updatePaidServices);
App.post('/user/',userController.retreiveData);
App.get('/',(req,res)=>{
    res.status(200).send({status:200, message:"welcome to openmrs/openclinic Simulation #HePay"})
});

App.use(globalErrorHandler);
export default App;