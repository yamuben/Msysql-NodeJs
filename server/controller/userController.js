import mysql from "mysql";
import express from "express";
import bodyparser from "body-parser";
import MySQLEvents from "mysql-events";
import catchAsyncErr from "./../utils/catchAsyncError";
import globalErrorHandler from "./errorController";
import axios from "axios";
import util from "util";
import isOnline from "is-online";

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

export const getOne = async (id, eventType) => {
    // let Id = req.params.id;
    let Id = id;
    console.log('>>>>>' + Id);
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
        clientId: ['5ec5db0362a8905f2086cbbf'],
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
    console.log(checknet.isInternetAvailable());

    if (eventType === 'INSERT') {
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
    }
    else if (eventType === 'UPDATE') {
        try {
            const response = await axios({
                method: 'PATCH',
                url: 'https://hospitalepay.herokuapp.com/api/v1/users/change-patient-infos',
                data
            })

            return response;
        } catch (error) {
            return error;
        }
    }
    // console.log(response.message)



};

export const getservice = async (grpId, user, serviceN, eventType) => {
    // let Id = req.params.id;
    // let Id = id;
    // console.log('>>>>>' + Id);
    const msql = "SELECT * FROM allservice WHERE groupId=? AND userId=? ";
    const query = util.promisify(connection.query).bind(connection);

    const rows = await query(msql, [grpId,user,serviceN]);
    await rows.forEach(async(element) => {

        // console.log("<><><><><><><><<<<" + element) ;
    

    let {
        groupId,
        groupName,
        userId,
        serviceName,
        quantity,
        pricePerUnit3,
        servicePatment } = element;
        // console.log(userId)
    const headers = {
        'Content-Type': 'application/json',
    }
    const data = {
        serviceGrpName: groupName,
        groupId: groupId,
        userId: userId,
        service:
        {
            serviceName: serviceName,
            quantity: quantity,
            pricePUnit: pricePerUnit3,
            servicePayment: servicePatment
        }
    }
if (await isOnline()){

    if (eventType === 'INSERT') {
        try {
            const response = await axios({
                method: 'POST',
                url: 'https://hospitalepay.herokuapp.com/api/v1/serviceGroup',
                data
            })

            console.log(response.data);
        } catch (error) {



        }
    }

}else{
    console.log('.,.,.,.,. No Internet Connect')
}





    });

};
