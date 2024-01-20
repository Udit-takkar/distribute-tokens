"use client";

import { Wrapper } from "./components/Wrapper";
// import { getClient } from "@/lib/apolloSSRClient";
import { SplitsClient } from "@0xsplits/splits-sdk";

import { useLazyQuery } from "@apollo/client";
import { useEffect, useState } from "react";

import { gql } from "@apollo/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useWalletClient, usePublicClient } from "wagmi";

const query = gql`
  query GetHatWearers($hatId: String) {
    hat(id: $hatId) {
      id
      wearers {
        id
      }
    }
  }
`;

// test hat id "0x0000000d00020001000100000000000000000000000000000000000000000000"
//  test split addess "0x41D14A0818e6F221627E2944f198492E703B3546"
// "0xf9cc91c99992eCBC8A52c74e8ef290A3D9445Fee"
// "0x08564d9d2fc8020e9FD66eBfcaE511E732305296"

// Goerli Hat Id:- 0x0000017900010001000100000000000000000000000000000000000000000000
// Split Address:- "0x393F25EE10Ba041340615c427d78DfFA46F120af"
// "0xA44c7B7A3F90E91aeb38Ea5a1Be22dd684a74d53"

const TOKEN_ADDRESS = "0xdD69DB25F6D620A7baD3023c5d32761D353D3De9";

export default function Page() {
  const [getHatWearers, { data, loading, error }] = useLazyQuery(query);
  const [hatId, setHatId] = useState("");
  const [wearers, setWearers] = useState<string[]>([]);

  const [splitAddress, setSplitAddress] = useState<undefined | string>();
  const [isLoading, setIsLoading] = useState(false);
  const walletClientRes = useWalletClient();
  const client = usePublicClient();
  const [recipients, setRecipients] = useState<
    {
      percentAllocation: number;
      recipient: { address: string };
    }[]
  >([]);

  const splitsClient = new SplitsClient({
    chainId: parseInt(process.env.NEXT_PUBLIC_CHAIN_ID ?? "11155111"),
    publicClient: client,
    walletClient: walletClientRes.data ?? undefined,
  });

  useEffect(() => {
    const getMetadata = async () => {
      if (!splitAddress) return;
      try {
        const response = await splitsClient.getSplitMetadata({
          splitAddress,
        });
        setRecipients(response.recipients);
      } catch (err) {
        console.log("something went wrong", err);
      }
    };
    getMetadata();
  }, [splitAddress]);

  const handleCreateSplit = async () => {
    try {
      if (!walletClientRes?.data?.account?.address)
        throw new Error("No wallet connected");

      setIsLoading(true);
      const res = await getHatWearers({
        variables: {
          hatId: hatId,
        },
      });

      const wearersAddresses = res.data.hat.wearers.map(
        (wearer: { id: string }) => wearer.id
      );

      console.log("wearersAddresses", wearersAddresses);

      const totalWearers = wearersAddresses.length;
      const equalPercentageAllocation = 100 / totalWearers;

      const args = {
        recipients: wearersAddresses.map((wearer: string) => {
          return {
            address: wearer,
            percentAllocation: equalPercentageAllocation,
          };
        }),

        distributorFeePercent: 0.1,
        controller: walletClientRes.data.account.address,
      };
      console.log("args", args);

      const response = await splitsClient.createSplit(args);
      setSplitAddress(response.splitAddress);
      console.log("splitsClient.createSplit", response);

      setWearers(wearersAddresses);
    } catch (err) {
      console.log("something went wrong", err);
    }
    setIsLoading(false);
  };

  const handleDistributeFunds = async () => {
    try {
      setIsLoading(true);

      if (!splitAddress) throw new Error("No split address");
      if (!walletClientRes?.data?.account?.address)
        throw new Error("No wallet connected");

      const args = {
        splitAddress,
        token: TOKEN_ADDRESS,
        distributorAddress: walletClientRes.data.account.address,
      };

      const response = await splitsClient.distributeToken(args);
      console.log("res", response);
    } catch (err) {
      console.log("somethign went wrong", err);
    }
    setIsLoading(false);
  };

  return (
    <main>
      <Wrapper>
        <p>Enter Hat ID</p>
        <Input
          className="mt-2"
          value={hatId}
          onChange={(e) => setHatId(e.target.value)}
        />
        <div className="space-x-2">
          <Button className="mt-2" onClick={handleCreateSplit}>
            Create Split
          </Button>
          <Button onClick={handleDistributeFunds}>Distribute Funds</Button>
        </div>
        {isLoading && <p>Loading...</p>}
        {error && <p>Error: {error.message}</p>}
        {recipients.length > 0 && (
          <div>
            <h2 className="font-bold text-4xl tracking-tight mt-8">
              Split Recipients
            </h2>
            <h2 className="font-bold text-xl tracking-tight mt-2 mb-4">
              Split Address: {splitAddress}
            </h2>
            {recipients.map((r) => {
              return (
                <p
                  className="my-1 text-lg text-muted-foreground"
                  key={r.recipient.address}
                >
                  {r.recipient.address}
                </p>
              );
            })}
          </div>
        )}
      </Wrapper>
    </main>
  );
}
