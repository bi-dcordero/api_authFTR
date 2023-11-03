const mongoose = require("mongoose");

const userScheme = mongoose.Schema({
    MTI: {
        type: String,
        required: true
    },
    PrimaryAccountNumber: {
        type: Number,
        required: true
    },
    AmountTransaction: {
        type: Number,
        required: true
    },
    TransactionDate: {
        type: Date,
        required: true
    },
    AcquiringInstitutionCountryCode: {
        type: String,
        required: true
    },
    CurrencyCodeTransaction: {
        type: String,
        required: true
    },
    MerchantType: {
        type: Number,
        required: true
    }    
});

module.exports = mongoose.model('Transaction', userScheme);

