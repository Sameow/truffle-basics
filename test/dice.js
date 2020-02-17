var Dice = artifacts.require('./Dice.sol');
var DiceBattle = artifacts.require('./DiceBattle.sol');
var DiceMarket = artifacts.require('./DiceMarket.sol');
const assert = require("chai").assert;
const truffleAssert = require('truffle-assertions');
const BigNumber = require('bignumber.js');

contract('Dice', function(accounts) { //not much diff from mocha, except that contract = describe
    let diceInstance;
    let diceBattleInstance;
    let diceMarketInstance;
    before(async () => {
        diceInstance = await Dice.deployed();
        diceBattleInstance = await DiceBattle.new(diceInstance.address);
        diceMarketInstance = await DiceMarket.new(diceInstance.address, 1000000000);
        //console.log("dice instance", diceInstance);
    });

    it('Should add a Dice', async () => {
        //.call does not save the data
        //dice(id=0) created
        let diceId1 = await diceInstance.numDices.call();
        let result = await diceInstance.add.call(6, 2, {
            from: accounts[0],
            value: 20000000000000000
        });

        //console.log('result', result);
        assert.strictEqual(
            result.toNumber(),
            0,
            'Dice add() did not return correct id'
        );
        diceInstance.add(6, 2, { //adding dice for other test cases
            from: accounts[0],
            value: 20000000000000000
        });
    });

    it('Should roll a Dice', async () => {
        let tx = await diceInstance.roll(0);
        truffleAssert.eventEmitted(tx, 'rolling', (ev) => {
           return ev.diceId == 0;
        });
    });

    it('Should stop rolling a Dice', async () => {
        let tx = await diceInstance.stopRoll(0);
        truffleAssert.eventEmitted(tx, 'rolled', (ev) => {
            return (ev.diceId == 0) &&
                ((ev.newNumber - Math.floor(ev.newNumber)) == 0 ) && //rolled number cannot be decimal
                (ev.newNumber >= 1) && (ev.newNumber <= diceInstance.getDiceSides(0));
        });
    });

    it('Number of Dices created should be correct.', async () => {
        let result = await diceInstance.add.call(6, 2, {
            from: accounts[0],
            value: 20000000000000000
        });

        //console.log('result:', result);
        assert.strictEqual(
            result.toNumber(),
            1,
            'Dice add() did not return correct id'
        );
        diceInstance.add(6, 2, { //adding dice for other test cases
            from: accounts[0],
            value: 20000000000000000
        });
    });

    it('Should transfer correctly.', async () => {
        let tx = await diceInstance.transfer(0, diceBattleInstance.address);
        assert.equal(
            await diceInstance.getOwner(0),
            diceBattleInstance.address,
            'New owner wrong'
        );
        assert.equal(
            await diceInstance.getPrevOwner(0),
            accounts[0],
            'Previous owner wrong'
        );
        await diceInstance.transfer(1, diceBattleInstance.address);
    });

    it('Should emit a battle state event.', async () => {
        let result = await diceBattleInstance.battle(0, 1, {
            from: accounts[0]
        }).then((results)=>{ return results.logs[0].event});
        assert.include(['battleWin', 'battleDraw', 'battleLose'], result, 'not a battle state event');
    });

    it('Should list a dice.', async () => {
        let diceValue = await diceInstance.getDiceValue(0);
        let comFee = await diceMarketInstance.comissionFee.call();
        let price = BigNumber.sum(parseInt(diceValue), parseInt(comFee));
        await diceMarketInstance.list(0, price, {
            from: accounts[0]
        });
        let actualPrice = new BigNumber(parseInt(await diceMarketInstance.checkPrice(0)));
        //console.log("debug: ", actualPrice.isEqualTo(price) );
        assert(actualPrice.isEqualTo(price), 'Dice listed wrongly');
    });

    it('Should unlist a dice.', async () => {
        await diceMarketInstance.unlist(0);
        assert.equal(await diceMarketInstance.checkPrice(0), 0, 'Dice UNlisted wrongly');

        let diceValue = await diceInstance.getDiceValue(0); //for next test case
        let comFee = await diceMarketInstance.comissionFee.call();
        let price = BigNumber.sum(parseInt(diceValue), parseInt(comFee));
        await diceMarketInstance.list(0, price, {
            from: accounts[0]
        });
    });

    it('Should buy a dice.', async () => {
        let prebuyBalance = new BigNumber(await web3.eth.getBalance(accounts[0]));
        await diceMarketInstance.buy(0, {
            from: accounts[1],
            value: 20000002000000000
        });
        let postbuyBalance = new BigNumber(await web3.eth.getBalance(accounts[0]));
        assert(postbuyBalance.minus(prebuyBalance).isEqualTo(new BigNumber(20000001000000000)), 'Seller did not earn as expected.');
    });

    it('Buyer is now the new owner.', async () => {
        assert.equal(
            await diceInstance.getOwner(0),
            accounts[1],
            'New owner wrong'
        );
    });


});