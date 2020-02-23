const Collectible = artifacts.require("Collectible");
const ERC20 = artifacts.require("ERC20");
const CollectibleMarketPlace = artifacts.require("CollectibleMarketPlace");


contract("Collectible", accounts => {
  let collectible;
  let token;
  let marketplace;
  let listPrice = 2000;
  let fee = 100;  //set by platform
  let startingBal = 3000;
  const platform = accounts[0];
  const user1 = accounts[1];
  const user2 = accounts[2];

  it("Create first collectible for user1", () =>
      Collectible.deployed()
      .then(_inst => {
        collectible = _inst;
        return collectible.createCard(10,5,8);
      }).then(() => {
        return collectible.transferFrom(platform, user1, 0);
      }).then(() => {
        return collectible.ownerOf.call(0);
      }).then(rsl => {
        assert.equal(rsl.valueOf(), user1);
      })
  );

  it("Create 2nd collectible for user2", () =>
      collectible.createCard(5,6,10)
      .then(() => {
        return collectible.transferFrom(platform, user2, 1);
      }).then(() => {
        return collectible.ownerOf.call(1);
      }).then((rsl) => {
        assert.equal(rsl.valueOf(), user2);
      })
  );

  it("user1 able to list card0 on sale", () =>
      CollectibleMarketPlace.deployed()
      .then((_inst) => {
        marketplace = _inst;
        return marketplace.list(0, listPrice, {from: user1});
      }).then(() => {
        return marketplace.checkPrice.call(0);
      }).then((rsl) => {
        assert.equal(rsl.valueOf(), listPrice + fee);
      })
  );

  it("mint tokens to user2", () =>
      ERC20.deployed()
      .then((_inst) => {
        token = _inst;
        return token.mintToken(user2, startingBal);
      }).then(() => {
        return token.balanceOf.call(user2);
      }).then((rsl) => {
        assert.equal(rsl.valueOf(), startingBal);
      })
  );

  it("user2 buys card0 from user1 via the marketplace", () =>
      token.approve(marketplace.address, listPrice + fee, {from: user2})
      .then(() => {
        return marketplace.buy(0, listPrice + fee, {from: user2});
      }).then(() => {
        return collectible.ownerOf.call(0);
      }).then((rsl) => {
        assert.equal(rsl.valueOf(), user2);
        return token.balanceOf.call(user2);
      }).then((rsl) => {
        assert.equal(rsl.valueOf(), startingBal - listPrice - fee);
      })
  )
});
