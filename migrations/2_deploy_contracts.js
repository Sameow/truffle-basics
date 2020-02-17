const Dice = artifacts.require("Dice");
const DiceBattle = artifacts.require("DiceBattle");

module.exports = function(deployer) {
    deployer.then(() => {
        return deployer.deploy(Dice);
    }).then((diceInstance => {
        console.log("Dice contract at address=" + diceInstance.address);
        return deployer.deploy(DiceBattle, diceInstance.address);
    })).then(diceBattleInstance => {
        console.log("DiceBattle contract at address=" + diceBattleInstance.address);
    })
};