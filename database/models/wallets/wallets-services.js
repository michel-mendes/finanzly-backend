const sequelize = require('../../database-controller');
const { Op } = require('sequelize');
const tabUserWallet = require('../association.user-wallet');
const { tabWallets } = require('../association.user-wallet');
const { tabTransactions } = require('../association.user-wallet')

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
        const existingWallet = await tabUserWallet.tabWallets.findOne({ where: { name: parameters.name,
                                                       userId: parameters.userId }
                                                     });

        if ( existingWallet ) {
            return {
                error: true,
                message: `A wallet with that name already exists for this user`
            }
        }
        else {
            // Creates a new wallet
            let newWallet
            parameters.actualBalance = parameters.initialBalance;
                    
            newWallet =  await tabUserWallet.tabWallets.create( parameters );
            await updateUserDashboardWallet( parameters.userId )

            return newWallet

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

    const existingWallet = await tabUserWallet.tabWallets.findOne({ where: { name: parameters.name,
                                                               userId: parameters.userId } });
    
    if ( !wallet ) {
        return {
            error: true,
            message: `Carteira não encontrada!`
        }
    }
    
    if (( existingWallet ) && ( Number(existingWallet.id) !== Number(parameters.id) )) {
        return {
            error: true,
            message: `Já existe uma carteira com esse nome!`
        }
    }

    // Recalculate actual balance in case of "initialBalance" field value change
    if ( parameters.initialBalance ) {
        
        if ( ( parameters.initialBalance > wallet.initialBalance ) || ( parameters.initialBalance < wallet.initialBalance ) ) {

            let walletTransactions = await tabTransactions.findAll({
                where: {
                    walletId: wallet.id
                }
            })

            let newBalance = Number(parameters.initialBalance)

            for ( let i = 0; i < walletTransactions.length; i++ ) {
                newBalance += Number(walletTransactions[ i ].creditValue)
                newBalance -= Number(walletTransactions[ i ].debitValue)
            }

            parameters.actualBalance = newBalance

        }

    }

    Object.assign(wallet, parameters);
    
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

async function updateUserDashboardWallet( userId ) {
    try {
        let user = await tabUserWallet.tabUsers.findByPk( userId )
        let allUserWallets

        allUserWallets = await getWalletsFromUser( userId )
        if ( allUserWallets.length == 1 ) {
            Object.assign(user, {dashboardWalletId: allUserWallets[0].id})

            await user.save()
        }
    }
    catch (e) {
        throw `Erro [updateUserDashboardWallet()]: ${e}`
    }
}