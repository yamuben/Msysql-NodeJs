import mysql from "mysql";
import express from "express";
import bodyparser from "body-parser";
import catchAsyncErr from "./../utils/catchAsyncError";
import axios from "axios";
import util from "util";
import isOnline from "is-online";

const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Yamu2845@',
    database: 'hepay'
});

const App = express();
App.use(bodyparser.json());

export const getAll = catchAsyncErr(async (req, res, next) => {

    const msql = "SELECT patientidv,fnamev,lnamev,insurancev,phonev FROM userinfos";

    const userQuery = util.promisify(connection.query).bind(connection);
    const patientUsers = await userQuery(msql);

    console.log(patie);
    res.status(200).json({
        status: "success",
        result: patientUsers

    });

});

export const getOnePatient = catchAsyncErr(async (req, res, next) => {

    const patientId = req.params.userid;

    const msql = "SELECT patientidv,fnamev,lnamev,insurancev,phonev,atopay,quotion FROM userinfos where patientidv=?";

    const userQuery = util.promisify(connection.query).bind(connection);
    const patientUser = await userQuery(msql, [patientId]);

    const msql2 = "SELECT * FROM hospitalinfos where hospitalid='msk'";

    const userQuery2 = util.promisify(connection.query).bind(connection);
    const hospitalinfos = await userQuery2(msql2);



    // console.log(patientUser);
    res.status(200).json({
        status: "success",
        patient: patientUser,
        hospital: hospitalinfos

    });

});

export const payWithMomo = catchAsyncErr(async (req, res) => {
    let { patientId, ammountPaid, momoTransaction, phonePaid, type } = req.body;

    console.log("<><><><><><>",req.body)

    const msqlsum = "SELECT SUM(restammount) AS total  from servicegroup where patientid=?";

    const userQuerySum = util.promisify(connection.query).bind(connection);
    const groupServicesSum = await userQuerySum(msqlsum, [patientId]);



    const msqlQuotion1 = "SELECT quotion  from userinfos where patientidv=?";

    const userQueryQuotion1 = util.promisify(connection.query).bind(connection);
    const patientQuotion1 = await userQueryQuotion1(msqlQuotion1, [patientId]);

    if (parseInt(groupServicesSum[0].total) === parseInt(ammountPaid) && type === "loan") {

        try {



            const msql = "SELECT * from servicegroup where patientid=?";

            const userQuery = util.promisify(connection.query).bind(connection);
            const groupServices = await userQuery(msql, [patientId]);


            // console.log(groupServices);

            await groupServices.forEach(async (el) => {


                const msql1 = "UPDATE servicegroup SET paidammount='" + el.restammount + "', comment='transactionId: " + momoTransaction + " , Phone:" + phonePaid + "',restammount=0 where grpid=? and restammount>0";

                const userQuery1 = util.promisify(connection.query).bind(connection);
                await userQuery1(msql1, [el.grpid]);

                const msql2 = "UPDATE services SET paid='true' where groupid=?";

                const userQuery2 = util.promisify(connection.query).bind(connection);
                await userQuery2(msql2, [el.grpid]);


            });


            const msql3 = "UPDATE userinfos SET atopay=atopay-" + ammountPaid + " where patientidv=?";

            const userQuery3 = util.promisify(connection.query).bind(connection);
            await userQuery3(msql3, [patientId]);




            const msqlQuotion = "SELECT quotion  from userinfos where patientidv=?";

            const userQueryQuotion = util.promisify(connection.query).bind(connection);
            const patientQuotion = await userQueryQuotion(msqlQuotion, [patientId]);


            res.status(200).json({
                status: "success",
                quotionRest: parseInt(patientQuotion[0].quotion)

            });
        } catch (error) {
            // console.log("Catched Error:",error);
        }

    } else if (type === "quotion") {

        try {



            const msqlQuotionForCurrentFees = "SELECT quotion  from userinfos where patientidv=?";

            const userQueryQuotionForCurrentFees = util.promisify(connection.query).bind(connection);
            const patientQuotionForCurrentFees = await userQueryQuotionForCurrentFees(msqlQuotionForCurrentFees, [patientId]);

            const commentQuotionForCurrentFees = patientQuotionForCurrentFees[0].comment;


            const msql3 = "UPDATE userinfos SET quotion=quotion+" + ammountPaid + ",comment='" + commentQuotionForCurrentFees + "transactionId: " + momoTransaction + " , Phone:" + phonePaid + "' where patientidv=?";

            const userQuery3 = util.promisify(connection.query).bind(connection);
            await userQuery3(msql3, [patientId]);




            const msqlQuotion = "SELECT quotion  from userinfos where patientidv=?";

            const userQueryQuotion = util.promisify(connection.query).bind(connection);
            const patientQuotion = await userQueryQuotion(msqlQuotion, [patientId]);


            res.status(200).json({
                status: "success",
                quotionRest: parseInt(patientQuotion[0].quotion)

            });
        } catch (error) {
            console.log("throwed error: " + error)
        }

    }
    else {

        res.status(403).json({
            status: "failed",
            ammountPaid: parseInt(ammountPaid),
            ammountTobePaid: parseInt(groupServicesSum[0].total),
            quotion: parseInt(patientQuotion1[0].quotion)


        });
    }



});

export const updateQuotion = catchAsyncErr(async (req, res, next) => {
    let { patientId, ammountPaid, momoTransaction, phonePaid } = req.body;




    const msqlQuotion1 = "SELECT quotion  from userinfos where patientidv=?";

    const userQueryQuotion1 = util.promisify(connection.query).bind(connection);
    const patientQuotion1 = await userQueryQuotion1(msqlQuotion1, [patientId]);

    if (parseInt(groupServicesSum[0].total) === parseInt(ammountPaid) && parseInt(patientQuotion1[0].quotion) > parseInt(ammountPaid)) {

        try {



            const msql = "SELECT * from servicegroup where patientid=?";

            const userQuery = util.promisify(connection.query).bind(connection);
            const groupServices = await userQuery(msql, [patientId]);


            // console.log(groupServices);

            await groupServices.forEach(async (el) => {


                const msql1 = "UPDATE servicegroup SET paidammount='" + el.restammount + "',restammount=0 where grpid=?";

                const userQuery1 = util.promisify(connection.query).bind(connection);
                await userQuery1(msql1, [el.grpid]);

                const msql2 = "UPDATE services SET paid='true' where groupid=?";

                const userQuery2 = util.promisify(connection.query).bind(connection);
                await userQuery2(msql2, [el.grpid]);


            });


            const msql3 = "UPDATE userinfos SET quotion=quotion-" + ammountPaid + ",atopay=atopay-" + ammountPaid + " where patientidv=?";

            const userQuery3 = util.promisify(connection.query).bind(connection);
            await userQuery3(msql3, [patientId]);




            const msqlQuotion = "SELECT quotion  from userinfos where patientidv=?";

            const userQueryQuotion = util.promisify(connection.query).bind(connection);
            const patientQuotion = await userQueryQuotion(msqlQuotion, [patientId]);


            res.status(200).json({
                status: "success",
                quotionRest: parseInt(patientQuotion[0].quotion)

            });
        } catch (error) {
            // console.log("Catched Error:",error);
        }

    }

    else {

        res.status(403).json({
            status: "failed",
            ammountPaid: parseInt(ammountPaid),
            ammountTobePaid: parseInt(groupServicesSum[0].total),
            quotion: parseInt(patientQuotion1[0].quotion)


        });
    }

});

export const payWithQuotion = catchAsyncErr(async (req, res, next) => {
    let { patientId, ammountPaid } = req.body;

    const msqlsum = "SELECT SUM(restammount) AS total  from servicegroup where patientid=?";

    const userQuerySum = util.promisify(connection.query).bind(connection);
    const groupServicesSum = await userQuerySum(msqlsum, [patientId]);



    const msqlQuotion1 = "SELECT quotion  from userinfos where patientidv=?";

    const userQueryQuotion1 = util.promisify(connection.query).bind(connection);
    const patientQuotion1 = await userQueryQuotion1(msqlQuotion1, [patientId]);

    if (parseInt(groupServicesSum[0].total) === parseInt(ammountPaid) && parseInt(patientQuotion1[0].quotion) > parseInt(ammountPaid)) {

        try {



            const msql = "SELECT * from servicegroup where patientid=?";

            const userQuery = util.promisify(connection.query).bind(connection);
            const groupServices = await userQuery(msql, [patientId]);


            // console.log(groupServices);

            await groupServices.forEach(async (el) => {


                const msql1 = "UPDATE servicegroup SET paidammount='" + el.restammount + "',restammount=0 where grpid=?";

                const userQuery1 = util.promisify(connection.query).bind(connection);
                await userQuery1(msql1, [el.grpid]);

                const msql2 = "UPDATE services SET paid='true' where groupid=?";

                const userQuery2 = util.promisify(connection.query).bind(connection);
                await userQuery2(msql2, [el.grpid]);


            });


            const msql3 = "UPDATE userinfos SET quotion=quotion-" + ammountPaid + ",atopay=atopay-" + ammountPaid + " where patientidv=?";

            const userQuery3 = util.promisify(connection.query).bind(connection);
            await userQuery3(msql3, [patientId]);




            const msqlQuotion = "SELECT quotion  from userinfos where patientidv=?";

            const userQueryQuotion = util.promisify(connection.query).bind(connection);
            const patientQuotion = await userQueryQuotion(msqlQuotion, [patientId]);


            res.status(200).json({
                status: "success",
                quotionRest: parseInt(patientQuotion[0].quotion)

            });
        } catch (error) {
            console.log("Catched Error:", error);
        }

    }

    else {

        res.status(403).json({
            status: "failed",
            ammountPaid: parseInt(ammountPaid),
            ammountTobePaid: parseInt(groupServicesSum[0].total),
            quotion: parseInt(patientQuotion1[0].quotion)


        });
    }

});



export const retreiveData = async (req, res, next) => {

    console.log(req.body);
    res.status(200).json({
        status: "success done well"
    });
}

export const updatePaidServices = async (req, res, next) => {

    let patientId = req.body.userId;
    let groupService = req.body.groupId;

    // console.log(groupService[2]);


    await groupService.forEach(async (element) => {

        // console.log("...."+element.Id)

        try {

            //get patient ammount
            const msqlGetUser = "SELECT * FROM servicegroup WHERE grpid=? ";
            const userQuery = util.promisify(connection.query).bind(connection);
            const patientUser = await userQuery(msqlGetUser, [element.groupId]);
            const restammount = parseInt(patientUser[0].restammount, 10);
            let restammountUpdate = 0;
            if (restammount > 0) {

                restammountUpdate = restammount - element.amountPaid;
            }


            const msql = "UPDATE servicegroup SET paidammount=? , restammount=? WHERE patientid=? AND grpid=?";
            const query = util.promisify(connection.query).bind(connection);

            const rows = await query(msql, [element.amountPaid, restammountUpdate, patientId, element.groupId]);



            const msql2 = "UPDATE services SET paid=? WHERE groupid=?";
            const query2 = util.promisify(connection.query).bind(connection);

            const rows2 = await query2(msql2, ["true", element.groupId]);

            console.log("data updated..");
        } catch (error) {
            console.log(error);
        }


    });



    res.status(200).json({
        status: "success",
        // data: rows[0]
    });

}


export const getOne = async (id, eventType) => {
    // let Id = req.params.id;
    let Id = id;
    // console.log('>>>>>' + Id);
    const msql = "SELECT * FROM userinfos WHERE patientidv=?";
    const query = util.promisify(connection.query).bind(connection);

    const rows = await query(msql, [Id]);


    let {
        idv,
        patientidv,
        fnamev,
        lnamev,
        dobv,
        phonev,
        emailv,
        insurancev,
        insurancepricev,
        provincev,
        districtv,
        sectorv, } = rows[0];
    // const udata = {        };
    // console.log(rows[0]);
    const headers = {
        'Content-Type': 'application/json',
    }
    const data = {
        clientName: 'Kanombe  Hospital',
        userId: patientidv,
        // clientId: ['5ec5db0362a8905f2086cbbf'],
        userName:
        {
            firstName: fnamev,
            middleNamE: "",
            lastName: lnamev
        },

        userNationalId: dobv,
        userInsurance: insurancev,
        userLocation:
        {
            province: provincev,
            district: districtv,
            sector: sectorv
        },
        userPhone: phonev,
        userEmail: emailv
    }

    // console.log(">>>>>>>>>>>"+data);
    if (eventType === 'INSERT') {
        try {
            const response = await axios({
                method: 'POST',
                url: 'https://hepaypro.herokuapp.com/api/v1/users',
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
                url: 'https://hepaypro.herokuapp.com/api/v1/users/change-patient-infos',
                data
            })

            return response;
        } catch (error) {
            return error;
        }
    }
    // console.log(response.message)



};

export const getservice = async (grpId, serviceN, eventType) => {
    // let Id = req.params.id;
    // let Id = id;

    // console.log(grpId);

    const msqlGetUser = "SELECT * FROM servicegroup WHERE grpid=? ";

    const userQuery = util.promisify(connection.query).bind(connection);

    const patientUser = await userQuery(msqlGetUser, [grpId]);


    let groupName = patientUser[0].groupname;
    let userId = patientUser[0].patientid;

    const msqlGetinsurance = "SELECT * FROM userinfos WHERE patientidv=? ";

    const userInfosQuery = util.promisify(connection.query).bind(connection);

    const patientUserInfos = await userInfosQuery(msqlGetinsurance, [userId]);


    console.log(patientUserInfos[0]);

    let insurance = patientUser[0].insurance;

    let insuranceprice;
    if (!(insurance === "none")) {
        insuranceprice = patientUserInfos[0].insurancepricev;
    } else {
        insuranceprice = 0;
    }



    const msql = "SELECT * FROM services WHERE groupid=? ";
    const query = util.promisify(connection.query).bind(connection);

    const rows = await query(msql, [grpId]);




    await rows.forEach(async (element) => {

        // console.log("<><><><><><><><<<<" + element) ;


        let {

            groupid,
            servicename,
            qty,
            pu,
            pt,
            paid, } = element;
        // console.log(userId)







        const headers = {
            'Content-Type': 'application/json',
        }
        const data = {
            serviceGrpName: groupName,
            groupId: groupid,
            userId: userId,
            insurance: insurance,
            insurancePercent: insuranceprice,
            serviceStatus: paid,
            service:
            {
                serviceName: servicename,
                quantity: qty,
                pricePUnit: pu,
                servicePayment: pt
            }
        }
        if (await isOnline()) {

            if (eventType === 'INSERT') {
                try {
                    const response = await axios({
                        method: 'POST',
                        url: 'https://hepaypro.herokuapp.com/api/v1/serviceGroup',
                        data
                    })

                    console.log(response.data);
                } catch (error) {

                    console.log(error);

                }
            }

        } else {
            console.log('!!. No Internet Connect')
        }





    });

};
