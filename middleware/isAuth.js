const jwt = require('jsonwebtoken');

module.exports = (req, res, next) =>
{
    const authHeader = req.get('Authorization');
    if (!authHeader)
    {
        const err = new Error('not Authenticateddd');
        err.statusCode = 401;
        throw err;
    }
    const token = authHeader.split(' ')[1];
    let decodedToken;
    try
    {
        decodedToken = jwt.verify(token, 'blood');

    } catch (err)
    {
        err.statusCode = 401;
        throw err;
    };

    if (!decodedToken)
    {
        const err = new Error('not Authenticateeeed');
        err.statusCode = 401;
        throw err;
    };
    req.userId = decodedToken.Id;
    req.userType = decodedToken.Type;

    next();
};