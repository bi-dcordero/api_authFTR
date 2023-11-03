const express = require("express");
const userScheme = require("../models/transaction");
const axios = require("axios")
const twilio = require("twilio");

const router = express.Router();

const accountSid = 'AC7e4d4ab8fefbe6dc7f5367021b7cbb9d';
const authToken = '1a3e0e1be3302bedb2a603809edfa505';
const client = twilio(accountSid, authToken);

//create Lambda
const limit = 1000; // Establecer un lÃ­mite superior para las transacciones legÃ­timas
const blackList = ["4900"]; // Lista negra de MCC
const mediaMontoTransaccionesPrevias = 500; // Media de transacciones anteriores

let url = 'https://apiftr.up.railway.app/agregar-transaccion';

function detection(amount, merchant, location){
    let text = "allow transaction";
    let result = true;
    
    if (amount > limit) {
        result = false;
        text = "fraud: high amount";
    }
    if (blackList.includes(merchant)) {
        result = false;
        text = "fraud: merchant in black list";
     }
    if (amount > 2 * mediaMontoTransaccionesPrevias) {
        result = false;
        text = "suspected fraud: unusually high amount";
    }            
    if (location !== "GTQ") {
        result = false;
        text = "fraud: purchase is made abroad";
    }

    let responseBody = {
        result: result,
        description: text
    };

    return responseBody;    
}

//create user
router.post('/transaction', (req,res) => {
    const user = userScheme(req.body);
    let responseD = detection(user.AmountTransaction, user.MerchantType, user.AcquiringInstitutionCountryCode);

    const response = {
        statusCode: 200,
        result: responseD.result,
        description: responseD.description
    };

    if(responseD.result == false){
        let request = {
            fecha: user.TransactionDate,
            tarjeta: user.PrimaryAccountNumber,
            moneda: user.AcquiringInstitutionCountryCode,
            mcc: user.MerchantType,
            monto: user.AmountTransaction
        }

        //Registro Sitio
        axios.post(url, request)
        
        //Envio SMS
        client.messages
        .create({
            body: 'Detectamos un consumo no reconocido en tu tarjeta de crédito',
            from: '+15165968827',
            to: user.celphone
        })
        .then(message => {
            console.log('SMS enviado con éxito:', message.sid);
            //res.send('SMS enviado con éxito');
        })
        .catch((error) => {
            console.error('Error al enviar SMS:', error);
            //res.status(500).send('Error al enviar SMS');
        });

        client.setheader
        
    }

    res.json(response);
    
    user.save()
    /*
    .then((data) => res.json(data))
    .catch((error) => res.json({ message: error}))
    */

});

//get all user
router.get('/transaction', (req,res) => {
    userScheme
    .find()
    .then((data) => res.json(data))
    .catch((error) => res.json({ message: error}))
});

//get user
router.get('/transaction/:PrimaryAccountNumber', (req,res) => {
    const { PrimaryAccountNumber } = req.params;
    userScheme
    .find({PrimaryAccountNumber})
    .then((data) => res.json(data))
    .catch((error) => res.json({ message: error}))
});

module.exports = router;

