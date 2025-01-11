import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Wallet,
  PlusCircle,
  Timer,
  Target,
  Rocket,
  Shield,
  Globe,
  TrendingUp,
  ChevronRight,
  Github,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useWeb3 } from "@/context/Web3Context";

interface Campaign {
  id: number;
  owner: string;
  title: string;
  description: string;
  target: string;
  deadline: number;
  amountCollected: string;
  image: string;
  claimed: boolean;
}

function App() {
  const [showApp, setShowApp] = useState(false);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    target: "",
    deadline: "",
    image: "",
  });
  const [donationAmount, setDonationAmount] = useState("");
  const { toast } = useToast();
  const {
    contract,
    account,
    connectWallet,
    createCampaign,
    getCampaigns,
    donateToCampaign,
  } = useWeb3();

  useEffect(() => {
    if (showApp) {
      loadCampaigns();
    }
  }, [showApp, contract]);

  const loadCampaigns = async () => {
    try {
      const loadedCampaigns = await getCampaigns();
      setCampaigns(loadedCampaigns || []);
    } catch (error) {
      console.error("Failed to load campaigns:", error);
    }
  };

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) {
      toast({
        title: "Error",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    const deadline = new Date(formData.deadline).getTime() / 1000;

    try {
      await createCampaign(
        formData.title,
        formData.description,
        formData.target,
        deadline,
        formData.image
      );

      // Reset form
      setFormData({
        title: "",
        description: "",
        target: "",
        deadline: "",
        image: "",
      });

      // Reload campaigns
      loadCampaigns();
    } catch (error) {
      console.error("Failed to create campaign:", error);
    }
  };

  const handleDonate = async (campaignId: number) => {
    if (!account) {
      toast({
        title: "Error",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    try {
      await donateToCampaign(campaignId, donationAmount);
      setDonationAmount("");
      loadCampaigns();
    } catch (error) {
      console.error("Failed to donate:", error);
    }
  };

  if (!showApp) {
    return (
      <div className="min-h-screen bg-[#0D0F1D] text-white overflow-hidden">
        {/* Gradient orbs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute top-0 -left-40 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-40 left-20 w-96 h-96 bg-teal-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        </div>

        {/* Navigation */}
        <nav className="relative z-10 border-b border-white/10 backdrop-blur-md">
          <div className="container mx-auto px-4 py-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Wallet className="h-6 w-6 text-blue-400" />
              <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                CrowdChain
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github className="h-5 w-5 hover:text-blue-400 transition-colors" />
              </a>
              <Button
                onClick={() => setShowApp(true)}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                Launch App
              </Button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="relative pt-20 pb-32">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-400 to-teal-400">
                Decentralized Crowdfunding for the Future
              </h1>
              <p className="text-xl text-gray-400 mb-8">
                Launch your dreams on the blockchain. Secure, transparent, and
                community-driven fundraising platform.
              </p>
              <Button
                onClick={() => setShowApp(true)}
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                Start Fundraising
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="relative py-20 border-t border-white/10">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="backdrop-blur-lg bg-white/5 rounded-2xl p-6 border border-white/10">
                <Shield className="h-12 w-12 text-blue-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">
                  Secure & Transparent
                </h3>
                <p className="text-gray-400">
                  Built on blockchain technology ensuring complete transparency
                  and security for all transactions.
                </p>
              </div>
              <div className="backdrop-blur-lg bg-white/5 rounded-2xl p-6 border border-white/10">
                <Globe className="h-12 w-12 text-purple-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Global Reach</h3>
                <p className="text-gray-400">
                  Connect with supporters worldwide and fund your projects
                  without borders.
                </p>
              </div>
              <div className="backdrop-blur-lg bg-white/5 rounded-2xl p-6 border border-white/10">
                <TrendingUp className="h-12 w-12 text-teal-400 mb-4" />
                <h3 className="text-xl font-semibold mb-2">Smart Contracts</h3>
                <p className="text-gray-400">
                  Automated and trustless fundraising with smart contract
                  technology.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="relative py-20 border-t border-white/10">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="backdrop-blur-lg bg-white/5 rounded-2xl p-6 border border-white/10">
                <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                  $10M+
                </div>
                <div className="text-gray-400 mt-2">Total Raised</div>
              </div>
              <div className="backdrop-blur-lg bg-white/5 rounded-2xl p-6 border border-white/10">
                <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-teal-400">
                  1000+
                </div>
                <div className="text-gray-400 mt-2">Successful Projects</div>
              </div>
              <div className="backdrop-blur-lg bg-white/5 rounded-2xl p-6 border border-white/10">
                <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-blue-400">
                  50K+
                </div>
                <div className="text-gray-400 mt-2">Global Backers</div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Main App UI (your existing app code)
  return (
    <div className="min-h-screen bg-[#0D0F1D] text-white">
      <header className="border-b border-white/10 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Wallet className="h-6 w-6 text-blue-400" />
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              CrowdChain
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {!account ? (
              <Button
                onClick={connectWallet}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
              >
                Connect Wallet
              </Button>
            ) : (
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Create Campaign
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-[#1A1C2A] border-white/10">
                  <DialogHeader>
                    <DialogTitle>Create New Campaign</DialogTitle>
                    <DialogDescription>
                      Launch your crowdfunding campaign on the blockchain
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateCampaign} className="space-y-4">
                    <Input
                      placeholder="Campaign Title"
                      className="bg-white/5 border-white/10"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      required
                    />
                    <Textarea
                      placeholder="Campaign Description"
                      className="bg-white/5 border-white/10"
                      value={formData.description}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          description: e.target.value,
                        })
                      }
                      required
                    />
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Target Amount (ETH)"
                      className="bg-white/5 border-white/10"
                      value={formData.target}
                      onChange={(e) =>
                        setFormData({ ...formData, target: e.target.value })
                      }
                      required
                    />
                    <Input
                      type="date"
                      className="bg-white/5 border-white/10"
                      value={formData.deadline}
                      onChange={(e) =>
                        setFormData({ ...formData, deadline: e.target.value })
                      }
                      required
                    />
                    <Input
                      type="url"
                      placeholder="Campaign Image URL"
                      className="bg-white/5 border-white/10"
                      value={formData.image}
                      onChange={(e) =>
                        setFormData({ ...formData, image: e.target.value })
                      }
                    />
                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                    >
                      Launch Campaign
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => (
            <Card
              key={campaign.id}
              className="backdrop-blur-lg bg-white/5 border-white/10"
            >
              <CardHeader>
                <img
                  src={campaign.image}
                  alt={campaign.title}
                  className="w-full h-48 object-cover rounded-lg"
                />
                <CardTitle>{campaign.title}</CardTitle>
                <CardDescription className="text-gray-400">
                  {campaign.description}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-blue-400" />
                      <span>{campaign.target} ETH</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Timer className="h-4 w-4 text-purple-400" />
                      <span>
                        {new Date(
                          campaign.deadline * 1000
                        ).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <Progress
                    value={Number(
                      (
                        (parseFloat(campaign.amountCollected) /
                          parseFloat(campaign.target)) *
                        100
                      ).toFixed(2)
                    )}
                    className="bg-white/10"
                  />
                  <p className="text-sm text-gray-400">
                    {campaign.amountCollected} ETH raised of {campaign.target}{" "}
                    ETH
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                      disabled={
                        campaign.claimed ||
                        Date.now() / 1000 > campaign.deadline
                      }
                    >
                      {campaign.claimed
                        ? "Campaign Ended"
                        : Date.now() / 1000 > campaign.deadline
                        ? "Deadline Passed"
                        : "Donate"}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-[#1A1C2A] border-white/10">
                    <DialogHeader>
                      <DialogTitle>Make a Donation</DialogTitle>
                      <DialogDescription>
                        Support this campaign by donating ETH
                      </DialogDescription>
                    </DialogHeader>
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleDonate(campaign.id);
                      }}
                      className="space-y-4"
                    >
                      <Input
                        type="number"
                        placeholder="Amount (ETH)"
                        step="0.01"
                        className="bg-white/5 border-white/10"
                        value={donationAmount}
                        onChange={(e) => setDonationAmount(e.target.value)}
                        required
                      />
                      <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                      >
                        Confirm Donation
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardFooter>
            </Card>
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;
