module.exports = validateRequest;

function validateRequest(req, res, next, schema) {
    const options = {
        abortEarly: false, // include all errors
        allowUnknown: true, // ignore unknown props
        stripUnknown: true // remove unknown props
    };
    
    // This will validade the body request against the Joi Scheme of each endpoint
    const { error, value } = schema.validate(req.body, options);
    
    // If the request body is not valid then return an error, else go ahead
    // if (error) throw {
    //     error: true,
    //     status: 400,
    //     message: 'Error',
    //     stack: `Validation error: ${error.details.map(x => x.message).join(', ')}`
    // }
    if (error) {
        
        res.json({
            error: true,
            message: `Erro de validação: ${error.details.map(x => x.message).join(', ')}`
        })

    }
    else {
        req.body = value;
        next();
    }
}