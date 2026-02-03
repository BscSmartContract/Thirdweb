import { useState } from "react";
import {
  createThirdwebClient,
  defineChain,
  useActiveAccount,
  useReadContract,
  useSendTransaction,
  ConnectButton,
} from "thirdweb/react";

// Addresses and chain config
const BLOCKSTAKE_ADDRESS = "0x53CEFc6240521A18B4Fff0955dDdFe12FF1e74cF";
const chain = defineChain(56); // BNB Smart Chain

export default function StakeDapp() {
  const client = createThirdwebClient({ clientId: "7255b13dce02a03973bdaaaf517985eb" }); // get at https://thirdweb.com/dashboard/settings
  const account = useActiveAccount();

  // Read minimum stake
  const { data: minStake } = useReadContract({
    contract: {
      address: BLOCKSTAKE_ADDRESS,
      chain,
    },
    method: "function minStake() view returns (uint256)",
  });

  // Read my staked balance
  const { data: myStaked } = useReadContract({
    contract: {
      address: BLOCKSTAKE_ADDRESS,
      chain,
    },
    method: "function staked(address) view returns (uint256)",
    params: [account?.address || "0x0"],
  });

  // Estimate my reward
  const { data: myReward } = useReadContract({
    contract: {
      address: BLOCKSTAKE_ADDRESS,
      chain,
    },
    method: "function calculateReward(address) view returns (uint256)",
    params: [account?.address || "0x0"],
  });

  // Stake tokens hook
  const { sendTransaction: stakeTx, isLoading: staking } = useSendTransaction();
  // Claim reward hook
  const { sendTransaction: claimTx, isLoading: claiming } =
    useSendTransaction();

  // UI state
  const [stakeAmount, setStakeAmount] = useState("");

  return (
    <div style={{ maxWidth: 380, margin: "0 auto", padding: 32 }}>
      <ConnectButton client={client} chain={chain} />
      <h2>BlockStakeMinting Dapp</h2>

      {/* Stake tokens */}
      <div>
        <h3>Stake tokens</h3>
        <input
          type="number"
          placeholder="Amount to stake"
          value={stakeAmount}
          onChange={(e) => setStakeAmount(e.target.value)}
        />
        <button
          onClick={async () => {
            await stakeTx({
              contract: {
                address: BLOCKSTAKE_ADDRESS,
                chain,
              },
              method: "function stake(uint256)",
              params: [stakeAmount],
            });
          }}
          disabled={staking || !stakeAmount}
        >
          Stake
        </button>
        {minStake && <p>Minimum to stake: {minStake.toString()}</p>}
      </div>

      {/* Show staked amount */}
      <div>
        <h3>My Staked Amount</h3>
        <p>{myStaked ? myStaked.toString() : "0"}</p>
      </div>

      {/* Estimate reward */}
      <div>
        <h3>Estimated Reward</h3>
        <p>{myReward ? myReward.toString() : "0"}</p>
      </div>

      {/* Claim reward */}
      <div>
        <h3>Claim Reward</h3>
        <button
          onClick={async () => {
            await claimTx({
              contract: {
                address: BLOCKSTAKE_ADDRESS,
                chain,
              },
              method: "function claimReward()",
              params: [],
            });
          }}
          disabled={claiming}
        >
          Claim
        </button>
      </div>
    </div>
  );
        }
