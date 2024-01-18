"use client";

import { Wrapper } from "./components/Wrapper";
// import { getClient } from "@/lib/apolloSSRClient";
import { useLazyQuery } from "@apollo/client";
import { useState } from "react";

import { gql } from "@apollo/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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

export default function Page() {
  const [getHatWearers, { data, loading, error }] = useLazyQuery(query);
  const [hatId, setHatId] = useState("");
  const [wearers, setWearers] = useState<string[]>([]);
  const [amount, setAmount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateSplit = async () => {
    try {
      setIsLoading(true);
      const res = await getHatWearers({
        variables: {
          hatId: hatId,
        },
      });

      const wearersAddresses = res.data.hat.wearers.map(
        (wearer: { id: string }) => wearer.id
      );

      // const response = await splitsClient.createSplit(args)

      setWearers(wearersAddresses);
      setIsLoading(false);
    } catch (err) {
      console.log("something went wrong", err);
    }
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
        <Input
          className="mt-2"
          type="number"
          value={amount}
          onChange={(e) => setAmount(parseInt(e.target.value))}
        />
        <Button className="mt-2" onClick={handleCreateSplit}>
          Create Split and Distribute funds
        </Button>
        {isLoading && <p>Loading...</p>}
        {error && <p>Error: {error.message}</p>}
        {!isLoading &&
          !error &&
          wearers.length > 0 &&
          wearers.map((address) => {
            return <p key={address}>{address}</p>;
          })}
      </Wrapper>
    </main>
  );
}
