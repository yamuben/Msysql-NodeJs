import mysql from "mysql";
import express from "express";
import bodyparser from "body-parser";
import MySQLEvents from "mysql-events";
import catchAsyncErr from "./../utils/catchAsyncError";
import globalErrorHandler from "./errorController";
import axios from "axios";
import util from "util";

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'hepayfinal'
});

const App = express();
App.use(bodyparser.json());

export const getAll = catchAsyncErr(async (req, res, next) => {

    const msql = "SELECT * FROM userinfos";

    connection.query(msql, (err, rows) => {
        if (err) {
            console.log(err)
        }
        res.status(200).json({
            status: "success",
            result: rows

        });
console.log(rows)
    });

});

export const getOne = async (id) => {
    // let Id = req.params.id;
    let Id = id;
    console.log('>>>>>>>>>>'+Id);
    const msql = "SELECT * FROM userinfos WHERE userId=?";
    const query = util.promisify(connection.query).bind(connection);

    const rows = await query(msql, [Id]);


    let {
        userId,
        firstName,
        middleName,
        lastName,
        userNationalId,
        userInsurance,
        province,
        district,
        sector,
        userPhone,
        userEmail } = rows[0];
    // const udata = {        };
    const headers = {
        'Content-Type': 'application/json',
    }
    const data = {
        clientName: 'Masaka Hospital',
        userId: userId,
        userName:
        {
            firstName: firstName,
            middleNamE: middleName,
            lastName: lastName
        },

        userNationalId: userNationalId,
        userInsurance: userInsurance,
        userLocation:
        {
            province: province,
            district: district,
            sector: sector
        },
        userPhone: userPhone,
        userEmail: userEmail
    }
    // 'x_auth_token': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwYXlsb2FkIjp7Il9pZCI6IjVlZGJmOTU0YmQxMTViMDc2ODU5NTU1YSIsImVtYWlsIjoieWFtdWJiZW5qYW1pbkBnbWFpbC5jb20iLCJwaWN0dXJlIjoiaHR0cHM6Ly9yZXMuY2xvdWRpbmFyeS5jb20vaGF6YXRlY2gtbHRkL2ltYWdlL3VwbG9hZC92MTU5MTQ0MTI2MS9kb3dubG9hZF95aGpoNmUucG5nIiwicm9sZSI6IkFkbWluIiwidXNlck5hbWVzIjoibXByb21lc3NlIn0sImlhdCI6MTU5MjQzMTI1MywiZXhwIjoxNTkyNTE3NjUzfQ.1fvdX8tCaUlbaxrhn-pp37dcrQ2b9RC0Du4cZoJP5hs'
    //  console.log(data);
    try {
        const response = await axios({
            method: 'POST',
            url: 'https://hospitalepay.herokuapp.com/api/v1/users',
            data
        })

        return response;
    } catch (error) {
        return error;
    }
    // console.log(response.message)



};
