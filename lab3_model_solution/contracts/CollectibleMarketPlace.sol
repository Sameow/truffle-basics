pragma solidity ^0.5.0;
import "./Collectible.sol";
import "./ERC20.sol";

contract CollectibleMarketPlace {

    Collectible collectibleContract;
    ERC20 erc20Contract;
    uint256 public comissionFee;
    address _owner = msg.sender;
     constructor(Collectible collectibleAddress, ERC20 ercAddress ,uint256 fee) public {
        collectibleContract = collectibleAddress;
        erc20Contract = ercAddress;
        comissionFee = fee;
    }


       struct CardForSale {
        uint256 cardId;
        uint256 price;
        address cardOwner;
     }

       CardForSale[] cardsForSale;


    //list a dice for sale. Price needs to be >= value + fee

    function list(uint256 cardId, uint256 price) public {
         require(msg.sender == collectibleContract.ownerOf(cardId));
         price = price + comissionFee;
  CardForSale memory _cardForSale = CardForSale(cardId,price, collectibleContract.ownerOf(cardId));
    uint _id = cardsForSale.push(_cardForSale) - 1;

    }


//   function unlist(uint256 id) public {
//      require(msg.sender == diceContract.getOwner(id));
//      diceContract.unlistDice(id);
//   }

// get price of dice
    function checkPrice(uint256 id) public view returns (uint256) {

        return cardsForSale[id].price;
 }

 // Buy the dice at the requested price
    function buy(uint256 id, uint256 price) public  payable {
         require(price >= checkPrice(id), "Price need to be more than the stated price");
         erc20Contract.transferTokenFrom(msg.sender, _owner,comissionFee);
        erc20Contract.transferTokenFrom(msg.sender,cardsForSale[id].cardOwner, (checkPrice(id) - comissionFee));
      collectibleContract.transferFrom(cardsForSale[id].cardOwner, msg.sender, cardsForSale[id].cardId );

    }
    
    function getContractOwner() public view returns(address) {
        return _owner;
    }

    function getCardSaleInfo(uint256 id) public view returns(address, uint256, uint256){
        return (cardsForSale[id].cardOwner,cardsForSale[id].cardId, cardsForSale[id].price  );
    }

    function getCardOwner(uint256 cardId) public view returns(address){
        return collectibleContract.ownerOf(cardId);
    }

}
