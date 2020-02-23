pragma solidity ^0.5.0;

import './ERC721Full.sol';

contract Collectible is ERC721Full {
  constructor() ERC721Full("Collectible", "COL") public {}
  
  address _owner = msg.sender;

  struct Card {
  uint8 strength;
  uint8 defence;
  uint8 health;
  }

  Card[] cards;

  function createCard (uint8 strength, uint8 defence, uint8 health) public {
      require(msg.sender == _owner);
    Card memory _card = Card(strength, defence, health);
    uint _id = cards.push(_card) - 1;
    _mint(msg.sender, _id);
  }

  function getCardStatsFromId(uint id) public view returns(uint8, uint8, uint8) {
    return (cards[id].strength, cards[id].defence, cards[id].health);
  }
  
  function getOwnerOfContract() public view returns (address){
      return _owner;
  }
}