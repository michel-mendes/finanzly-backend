const sequelize = require('../../database-controller');
// const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');
const tabUserWallet = require('../association.user-wallet');

module.exports = { getAllUsers, insertNewUser, getUserById, editUser, deleteUser, getUsersByName , getUserByEmail, getUserByUsername, authenticateUser};

async function authenticateUser( requestedUser, requestedPassword ) {
    let user = await getUserByUsername( requestedUser, true );

    if (!user) {
        user = await getUserByEmail( requestedUser, true );

        if (!user) return {
            error: true,
            message: 'Nome de usuário ou email inválidos'
        }
    }

    if ( requestedPassword == user.password ) {
        return user
    }
    else {
        return {
            error: true,
            message: 'Senha inválida'
        }
    }
}

async function getAllUsers( associate ) {

    if ( associate ) {
        return await tabUserWallet.tabUsers.findAll({include: ['userWallets']});
    }
    else {
        return await tabUserWallet.tabUsers.findAll();
    }

}

async function getUserById( id, fullScope = false ) {
    const user = await tabUserWallet.tabUsers.findByPk(id, {include: ['userWallets']});

    return user;
}

async function getUserByEmail( emailAddress, fullScope = false ) {
    let user;
    (fullScope) ? user = await tabUserWallet.tabUsers.scope('fullScope').findOne({ where: { email: emailAddress } }) : user = await tabUserWallet.tabUsers.findOne({ where: { email: emailAddress } });

    return user;
}

async function getUserByUsername( myUserName, fullScope = false ) {
    let user;
    (fullScope) ? user = await tabUserWallet.tabUsers.scope('fullScope').findOne({ where: { userName: myUserName } }) : user = await tabUserWallet.tabUsers.findOne({ where: { userName: myUserName } });

    return user;
}

async function getUsersByName( userFirstName ) {
    
    const usersList = await tabUserWallet.tabUsers.findAll( {
        //sequelize.where( ${leftOperator}, ${opernad}, ${rightOperator} );
        where: sequelize.where( sequelize.fn('upper', sequelize.col('firstName')), Op.like, sequelize.fn('upper', `%${userFirstName}%`) ),
        attributes: { exclude: ['password'] }
    });
    // The code above is equal to:
    // SELECT `id`, `firstName`, `lastName`, `email`, `createdAt`, `updatedAt` FROM `users` AS `users` WHERE upper(`firstName`) LIKE upper ('%${searchTerm}%');
    // select all the fields except for password

    return usersList;
}

async function insertNewUser( parameters ) {
    
    // Check if this username already exists
    let user = await tabUserWallet.tabUsers.findOne({ where: { userName: parameters.userName } });
    if ( user ) {
        return {
            error: true,
            message: `O nome de usuário \"${parameters.userName}\" já está em uso.`
        }
    }
    
    // Check if this email is already registered
    user = await tabUserWallet.tabUsers.findOne({ where: { email: parameters.email } });
    if ( user ) {
        return {
            error: true,
            message: `O email \"${ parameters.email }\" já está registrado.`
        }
    }

    // Creates a new user and return the new user Model
    try {
        return await tabUserWallet.tabUsers.create( parameters );
    }
    catch (e) {
        return {
            error: true,
            message: e
        };
    }
}

async function editUser( parameters ) {
    const user = await getUserById( parameters.id );
    const existingUser = await tabUserWallet.tabUsers.findOne({ where: { email: parameters.email } });
    
    if ( !user ) {
        return {
            error: true,
            message: `User with ID ${parameters.id} not found!`
        }
    }
    
    if ( (existingUser) && ( Number( existingUser.id ) !== Number( parameters.id ) ) ) {
        return {
            error: true,
            message: `The email address ${ parameters.email } is already registered`
        }
    }
    
    /*
    const editedUser = {
        firstName: parameters.firstName,
        userName: parameters.userName,
        email: parameters.email,
        password: parameters.password
    }
    Object.assign(user, editedUser);
    */
   
    Object.assign(user, parameters);
    
    let response = await user.save();

    return response
}

async function deleteUser( id ) {
    const user = await getUserById( id );

    if ( !user ) {
        return {
            error: true,
            message: `User with ID ${ id } not found!`
        }
    }

    await user.destroy();
    return {message: `User deleted successfully!`}
}