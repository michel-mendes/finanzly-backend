# My Wallet App

- Don't be scared, it's my first project and things are going to be a little messy

My Wallet App is a cost manager for my personal use.
It was initially coded in Delphi and currently i'm recoding it to JavaScript because it's perfect for apply and improve my JavaScript learnings.

Main technologies used in:
- HTML + CSS
- JavaScript
- Node.JS
- MySQL
- Sequelize

# First of all

First the database must be created if it does not already exist.
Just run the following file which is located at the root of the project:

> node dbCheck.js

This will create the database.
Now you must create the necessary tables, for this run the following:

> npx sequelize db:migrate

Ok, now the necessary stuff are done.
For initialize the project, just type:

> npm start