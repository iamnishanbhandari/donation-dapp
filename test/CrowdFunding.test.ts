import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("CrowdFunding", function () {
  async function deployContract() {
    const [owner, donor] = await ethers.getSigners();
    const CrowdFunding = await ethers.getContractFactory("CrowdFunding");
    const crowdFunding = await CrowdFunding.deploy();
    return { crowdFunding, owner, donor };
  }

  it("Should create a new campaign", async function () {
    const { crowdFunding, owner } = await deployContract();
    const title = "Test Campaign";
    const description = "Test Description";
    const target = ethers.parseEther("1");
    const deadline = await time.latest() + 86400; // 1 day from now
    const image = "https://example.com/image.jpg";

    await expect(crowdFunding.createCampaign(
      title,
      description,
      target,
      deadline,
      image
    )).to.emit(crowdFunding, "CampaignCreated");
  });

  it("Should allow donations to a campaign", async function () {
    const { crowdFunding, owner, donor } = await deployContract();
    const title = "Test Campaign";
    const description = "Test Description";
    const target = ethers.parseEther("1");
    const deadline = await time.latest() + 86400;
    const image = "https://example.com/image.jpg";

    await crowdFunding.createCampaign(title, description, target, deadline, image);
    
    await expect(crowdFunding.connect(donor).donateToCampaign(0, {
      value: ethers.parseEther("0.5")
    })).to.emit(crowdFunding, "DonationMade");
  });

  it("Should allow claiming funds after deadline", async function () {
    const { crowdFunding, owner, donor } = await deployContract();
    const title = "Test Campaign";
    const description = "Test Description";
    const target = ethers.parseEther("1");
    const deadline = await time.latest() + 86400;
    const image = "https://example.com/image.jpg";

    await crowdFunding.createCampaign(title, description, target, deadline, image);
    await crowdFunding.connect(donor).donateToCampaign(0, {
      value: ethers.parseEther("0.5")
    });

    await time.increase(86401); // Advance time past deadline

    await expect(crowdFunding.claimFunds(0))
      .to.emit(crowdFunding, "FundsClaimed");
  });
});
