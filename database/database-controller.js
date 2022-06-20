const config = require('./database-configs');
const Sequelize = require('sequelize');
const { Op } = require('sequelize');
// const mysql = require('mysql2/promise');

const sequelize = new Sequelize( config.database, config.username, config.password, { dialect: config.dialect, $like: Op.like, $not: Op.not } );

module.exports = sequelize, Op;