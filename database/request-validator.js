module.exports = validateRequest;

function validateRequest(req, res, next, schema) {
    const options = {
        abortEarly: false, // include all errors
        allowUnknown: true, // ignore unknown props
        stripUnknown: true // remove unknown props
    };
    
    // This will validade the body request against the Joi Scheme of each endpoint
    
    const { error, value } = schema.validate(req.body, options);
    
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