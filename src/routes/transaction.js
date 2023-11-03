const express = require("express");
const userScheme = require("../models/transaction");

const router = express.Router();

//create Lambda
const limit = 1000; // Establecer un lÃ­mite superior para las transacciones legÃ­timas
const blackList = ["4900"]; // Lista negra de MCC
const mediaMontoTransaccionesPrevias = 500; // Media de transacciones anteriores
let text = "allow transaction";
let result = true;

function detection(amount, merchant, location){
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

    let data = {
        Codigo: "0",
        Descripción: "Transaccion Exitosa"
    }

    const response = {
        statusCode: 200,
        result: responseD.result,
        description: responseD.description
    };

    res.json(response);
    /*
    user
    .save()
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

