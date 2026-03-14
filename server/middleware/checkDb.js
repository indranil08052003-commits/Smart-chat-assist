const mongoose = require('mongoose');

const checkDbConnection = (req, res, next) => {
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({
            error: 'Database not connected. Please ensure MongoDB is running and the URI in server/.env is correct.'
        });
    }
    next();
};

module.exports = checkDbConnection;
