pragma solidity ^0.5.0;
import "./Dice.sol";

contract DiceBattle {

   //mapping(uint256 => address) ownership;

    Dice diceContract;

    constructor(Dice diceAddress) public {
        diceContract = diceAddress;
    }

    event battleWin(uint256 myDice,uint256 enemyDice);
    event battleDraw(uint256 myDice,uint256 enemyDice);
    event battleLose(uint256 myDice,uint256 enemyDice);

    // function list(uint256 diceId) public {
    //   require(diceContract.getOwner(diceId) == msg.sender);
    //   ownership[diceId] = diceContract.getPrevOwner(diceId);
    // }

    // function unlist(uint256 id) public {
    //     diceContract.transfer(id, ownership[id]);
    //     delete ownership[id];
    // }

    function battle(uint256 myDice, uint256 enemyDice) public {
        //require(ownership[myDice] != address(0));
        //require(ownership[enemyDice] != address(0));
        require(diceContract.getPrevOwner(myDice) == msg.sender);

        diceContract.roll(myDice);
        diceContract.stopRoll(myDice);
        diceContract.roll(enemyDice);
        diceContract.stopRoll(enemyDice);

      if ( diceContract.getDiceNumber(myDice) > diceContract.getDiceNumber(enemyDice) ) {
          //ownership[myDice] = ownership[enemyDice];
          //unlist(myDice);
          diceContract.transfer(myDice,diceContract.getPrevOwner(enemyDice)); //last owner before sending to DiceBattle
          diceContract.transfer(enemyDice,diceContract.getPrevOwner(enemyDice));
          emit battleWin(myDice,enemyDice);
      }
     if ( diceContract.getDiceNumber(myDice) < diceContract.getDiceNumber(enemyDice) ) {
          //ownership[enemyDice] = ownership[myDice];
          //unlist(enemyDice);
          diceContract.transfer(enemyDice,diceContract.getPrevOwner(myDice)); //last owner before sending to DiceBattle
          diceContract.transfer(myDice,diceContract.getPrevOwner(myDice));
          emit battleLose(enemyDice,myDice);
      }
      if ( diceContract.getDiceNumber(myDice) == diceContract.getDiceNumber(enemyDice) ) {
          emit battleDraw(myDice,enemyDice);
      }
    }

    // function getOwner(uint256 id) public view  returns (address){
    //     return ownership[id];
    // }

    function getDiceOwner(uint256 id) public view  returns (address){
        return diceContract.getPrevOwner(id);
    }

    function getDiceNumber (uint256 diceId) public view returns (uint256) {
        return diceContract.getDiceNumber(diceId);
    }

}
