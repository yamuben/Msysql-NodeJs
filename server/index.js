import mysql from "mysql";
import express from "express";
import bodyparser from "body-parser";
import globalErrorHandler from "./controller/errorController";
import * as userController from "./controller/userController";
 
const App = express();
App.use(bodyparser.json());

App.get('/hepay/v1/getusers', userController.getAll);

App.get('/hepay/v1/getoneuser/:id', userController.getOne);

App.use(globalErrorHandler);
export default App;