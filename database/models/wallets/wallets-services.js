const sequelize = require('../../database-controller');
const { Op } = require('sequelize');
const tabUserWallet = require('../association.user-wallet');
const { tabWallets } = require('../association.user-wallet');

module.exports = {
    getAllWallets,
    getWalletById,
    getWalletsFromUser,
    getWalletsByName,
    insertNewWallet,
    editWallet,
    deleteWallet
}

async function getAllWallets( showAccociations ) {
    //Lists all wallets
    if ( showAccociations ) {
        return await tabUserWallet.tabWallets.findAll({ include: ['fromUser'] });
    }
    else {
        return await tabUserWallet.tabWallets.findAll();
    }
}

async function getWalletById( id ) {
    const wallet = await tabUserWallet.tabWallets.findByPk(id);

    return wallet;
}

async function getWalletsFromUser( requestedUserId ) {
    const userWallets = await tabWallets.findAll( {
        where: {
            userId: requestedUserId
        }
    });

    return userWallets;
}

async function getWalletsByName( walletName ) {
    
    const walletList = await tabUserWallet.tabWallets.findAll( {
        //sequelize.where( ${leftOperator}, ${opernad}, ${rightOperator} );
        where: sequelize.where( sequelize.fn('upper', sequelize.col('name')), Op.like, sequelize.fn('upper', `%${walletName}%`) )
    });

    return walletList;
}

async function insertNewWallet( parameters ) {
    try {    
        const wallet = await tabUserWallet.tabWallets.findOne({ where: { name: parameters.name,
                                                       userId: parameters.userId }
                                                     });

        if ( wallet ) {
            return {
                error: true,
                message: `A wallet with that name already exists for this user`
            }
        }
        else {
            // Creates a new wallet
            try {
                parameters.actualBalance = parameters.initialBalance;
                
                return await tabUserWallet.tabWallets.create( parameters );
            }
            catch (e) {
                return {
                    error: true,
                    message: `${e}`
                };
            }
        }
    }
    catch (e) {
        return {
            error: true,
            message: `${e}`
        }
    }
}

async function editWallet( parameters ) {
    const wallet = await getWalletById( parameters.id );

    const existingWallet = await tabUserWallet.tabWallets.findOne({ where: { name: parameters.email,
                                                               userId: parameters.userId } });
    
    if ( !wallet ) {
        return {
            error: true,
            message: `Wallet not found!`
        }
    }
    
    if ( existingWallet ) {
        return {
            error: true,
            message: `A wallet with that name already exists for this user`
        }
    }
    
    const editedWallet = {
        name: parameters.name,
        currencySymbol: parameters.currencySymbol
    }

    Object.assign(wallet, editedWallet);
    
    return await wallet.save();
}

async function deleteWallet( id ) {
    const wallet = await getWalletById( id );

    if ( !wallet ) {
        return {
            error: true,
            message: `Wallet not found`
        }
    }

    await wallet.destroy();
    return {message: `Wallet deleted successfully!`}
}