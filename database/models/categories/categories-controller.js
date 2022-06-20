const { routesDir } = require('../../../app');

const Joi = require('joi');
const validateRequest = require('../../request-validator.js');

// Here are the functions to handle each endpoint
const categoriesServices = require('./categories-services');

var express = require('express');
var router = express.Router();

router.get('/', listAllCategories); // List all categories
router.get('/:id', listById); // Search category by ID
router.post('/', validateCategoryRequest, saveCategory); // Create new category
router.put('/:id', validateCategoryRequest, editCategory); // Update category
router.delete('/:id', deleteCategory); // Delete category

function validateCategoryRequest(req, res, next) {
    
    const newSchema = Joi.object({
        id:              (req.method = 'PUT') ? Joi.number().required() : Joi.number(),
        userId:          Joi.number().required(),
        name:            Joi.string().required(),
        transactionType: Joi.string().required()
    });

    validateRequest(req, next, newSchema);
}

function listAllCategories(req, res, next) {
    // Query strings:
    // accociate: Boolean; -> If assigned will show the user owner of the category

    categoriesServices.getAllCategories( req.query.associate )
        .then( function ( result ) {
            res.json( result );
        })
        .catch ( next );
}

function listById(req, res, next) {
    
    categoriesServices.getCategoryById( req.params.id )
        .then( function( promiseResult ) {
            if ( !promiseResult ) {
                res.status(400).json( {
                    error: true,
                    message: `Category not found!`
                } )
            }
            
            res.status(200).json( promiseResult );
        } )
        .catch ( next );
}

function saveCategory( req, res, next ) {

    categoriesServices.insertNewCategory( req.body )
        .then( function ( promiseResult ) {
            
            if (promiseResult.error) {
                res.status(400).json( promiseResult );
            }
            else {
                res.status(200).json( promiseResult );
            }

        })
        .catch( next );
}

function editCategory( req, res, next ) {
    
    req.body.id = req.params.id;

    categoriesServices.editCategory( req.body )
        .then( function ( promiseResult ) {
            
            if (promiseResult.error) {
                res.status(400).json( promiseResult );
            }
            else {
                res.status(200).json( promiseResult );
            }

        })
        .catch( next );
}

function deleteCategory(req, res, next) {

    categoriesServices.deleteCategory( req.params.id )
        .then( function ( deleteResult ) { 
            if ( deleteResult.error ) {
                res.status(400).json( deleteResult );
            }
            else {
                res.json( deleteResult );
            }
        } )
        .catch( next );

}

module.exports = router;