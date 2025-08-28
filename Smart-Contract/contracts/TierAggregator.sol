// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IPointsView { function tierPointsOf(address user) external view returns (uint256); }

contract TierAggregator {
  IPointsView public immutable vortStaking;
  IPointsView public immutable somiStaking;

  uint256 public somiWeightBps = 8000; // 0.8x contribution
  uint256 public t1 = 1_000 ether;
  uint256 public t2 = 5_000 ether;
  uint256 public t3 = 20_000 ether;
  address public owner;

  constructor(IPointsView _orbt, IPointsView _somi){
    vortStaking = _orbt; somiStaking = _somi; owner = msg.sender;
  }
  modifier onlyOwner(){ require(msg.sender==owner,"owner"); _; }
  function setWeights(uint256 w) external onlyOwner { require(w<=2e4,"max 2.0x"); somiWeightBps = w; }
  function setThresholds(uint256 _t1,uint256 _t2,uint256 _t3) external onlyOwner { (t1,t2,t3)=(_t1,_t2,_t3); }

  function pointsOf(address u) public view returns (uint256) {
    uint256 a = vortStaking.tierPointsOf(u);
    uint256 b = somiStaking.tierPointsOf(u);
    return a + (b * somiWeightBps / 1e4);
  }
  function tierOf(address u) external view returns (uint8) {
    uint256 p = pointsOf(u);
    if (p>=t3) return 3; if (p>=t2) return 2; if (p>=t1) return 1; return 0;
  }

  function transferOwnership(address newOwner) external onlyOwner {
    require(newOwner != address(0), "zero");
    owner = newOwner;
}
}
