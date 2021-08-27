const Web3 = require('web3');
const bn = require('bignumber.js');
const OneSplitAbi = require('./oneSplitAbi.json');
const weiDecimal = 10;
const web3Provider = new Web3.providers.HttpProvider('https://speedy-nodes-nyc.moralis.io/1c9de03c861f345f3331ea16/eth/mainnet')


let web3 = new Web3(web3Provider);

let fromTokenAddress = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
let toTokenAddress = '0x6b175474e89094c44da98b954eedeac495271d0f';
let amount = 1;


let OneSplitContract = new web3.eth.Contract(OneSplitAbi, '0xC586BeF4a0992C495Cf22e1aeEE4E446CECDee0E');

let splitExchanges = [
    "Uniswap",      
    "Kyber",
    "Bancor",
    "Oasis",
    "Curve Compound",
    "Curve USDT",
    "Curve Y",
    "Curve Binance",
    "Curve Synthetix",
    "Uniswap Compound",
    "Uniswap CHAI",
    "Uniswap Aave",
    "Mooniswap",
    "Uniswap V2",
    "Uniswap V2 ETH",
    "Uniswap V2 DAI",
    "Uniswap V2 USDC",
    "Curve Pax",
    "Curve renBTC",
    "Curve tBTC",
    "Dforce XSwap",
    "Shell",
    "mStable mUSD",
    "Curve sBTC",
    "Balancer 1",
    "Balancer 2",
    "Balancer 3",
    "Kyber 1",
    "Kyber 2",
    "Kyber 3",
    "Kyber 4"
]

OneSplitContract.methods
.getExpectedReturn(
    fromTokenAddress,
    toTokenAddress,
    new bn(amount).shiftedBy(weiDecimal),
    100,
    0
)
.call({}, (err, res) =>{
    if(err) console.log(err);
    console.log(`
    from: ${fromTokenAddress}
    to: ${toTokenAddress}
    amount: ${amount}
    returnAmount: ${new bn(res.returnAmount).shiftedBy(-weiDecimal)}`);

    for(let i = 0; i < res.distribution.length; i++){
        console.log(splitExchanges[i] + ': ' + res.distribution[i]);
    }
})