const Web3 = require('web3');
const bn = require('bignumber.js');
const OneSplitAbi = require('./abis/oneSplitAbi.json');
const erc20Abi = require('./abis/erc20Abi.json')
const exchanges = require('./exchangeList');
const { WaitTask } = require('puppeteer');
const weiDecimal = 10;
const web3Provider = new Web3.providers.HttpProvider('https://speedy-nodes-nyc.moralis.io/1c9de03c861f345f3331ea16/eth/mainnet')
const expectedSwap = null;

let web3 = new Web3(web3Provider);

let fromAddress = '0xf60c2Ea62EDBfE808163751DD0d8693DCb30019c'
let toTokenAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'; //eth
let fromTokenAddress = '0x6b175474e89094c44da98b954eedeac495271d0f'; //dai
let amountToSwap = 2000;
let amountToSwapWei = new bn(amountToSwap).shiftedBy(weiDecimal);
let oneSplitAddress = '0xC586BeF4a0992C495Cf22e1aeEE4E446CECDee0E'


let OneSplitContract = new web3.eth.Contract(OneSplitAbi, oneSplitAddress);
let DaiContract = new web3.eth.Contract(erc2Abi, fromTokenAddress);


async function getExpectedReturn(){


await OneSplitContract.methods
.getExpectedReturn(
    fromTokenAddress,
    toTokenAddress,
    new bn(amount).shiftedBy(weiDecimal),
    100,
    0
)
.call({}, (err, res) =>{
    if(err) console.log(err);
    expectedSwap = res;
    console.log(`
    from: ${fromTokenAddress}
    to: ${toTokenAddress}
    amount: ${amount}
    returnAmount: ${new bn(res.returnAmount).shiftedBy(-weiDecimal)}`);

    exchanges.forEach((exc, i) =>{
        console.log(`${exc}: ${res.distribution[i]}%`)
    });
    await approveSpender();
})
}

function wait(ms){
    return new Promise(resolve => setTimeout(resolve, ms))
}
async function awaitTransaction(tx){
    let receipts = null;

    do{
        await web3.eth.getTransactionReceipt(tx).then(res =>{
            if(res) receipt = res;
            wait(2000);
        })
    } while(receipt === null)
    console.log(`Transaction went successfull: ${receipt.transactionHash}`)
    return reciept.status
}
async function approveSpender(){
    await DaiContract.methods.approve(oneSplitAddress, amountToSwapWei)
        .send({from: fromAddres}, async (err,tx) =>{
            if(err) console.log(`ERC20 token approving failed: ${err}`);
            console.log(`ERC20 token apporved to: ${oneSplitAddress}`)
            await awaitTransaction(tx);
            await executeSwap();
        })
}
function fromWeiConvertor(amount){
    return new bn(amount).shiftedBody(-weiDecimal).toFixed(2)
}
async function executeSwap(){
    let ethBefore = await web3.eth.getBalance(fromAddress);
    let daiBefore = await DaiContract.methods.balanceOf(fromAddress).call();

    await OneSplitContract.methods.swap( fromTokenAddress, toTokenAddress, amountToSwapWei, expectedSwap.returnAmount, expectedSwap.distribution, 0)
    .send({form: fromAddress, gas: 100000}, async(err, tx) =>{
        if(err) console.log(`The swap couldn't be executed: ${err}`);
        await awaitTransaction(tx)

        let ethAfter = await web3.eth.getBalance(fromAddress);
        let daiAfter = await DaiContract.methods.balanceOf(fromAddress).call();

        console.log(`
            The swap went successful.

            Balance before: ${fromWeiConvertor(ethBefore)} - ${fromWeiConvertor(ethAfter)}
            Balance After:  ${fromWeiConvertor(daiBefore)} - ${fromWeiConvertor(daiAfter)}
        `)
    })
}