import mysql from 'mysql';
import { resolve } from 'path';
const connection = mysql.createConnection({
    host: 'localhost',
    user:'root',
    password:'n3u3da!',
    database:'exchange_rates_db'
})

connection.connect((err) =>{
    if(err){
        console.error("connect error:", err);
        return
    }
    console.log("connect success");
})




function queryDatabase(sql, params){
    return new Promise((resolve, reject) => {
        connection.query(sql, params, (err, result) => {
            if(err){
                console.error("database query error");
                return reject(err);
            }
            resolve(result);
        })
    });
}

async function getExchangeRate(ccy) {
    const sql = `select exchange_rate from currency where code = ?`;
    const result = await queryDatabase(sql, [ccy]);
    if(result.length === 0){
        console.error("no exchange rate was found for ccy");
    }
    return result[0].exchange_rate;
}

async function convertCcy(sourceCcy, targetCcy, amount) {
    const [sourceRate, targetRate] = await Promise.all([
        getExchangeRate(sourceCcy),
        getExchangeRate(targetCcy)
    ]);
    return amount*(targetRate/sourceRate);
}



const source = 'JPY';
const target = 'EUR';
const amount = 100;

const result = await convertCcy(source, target, amount);
console.log(`${amount} ${source} convert to ${target}, the result is ${result.toFixed(2)} ${target}`);


connection.end();
    
