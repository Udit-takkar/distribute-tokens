"use client";

import { Wrapper } from "./components/Wrapper";
// import { getClient } from "@/lib/apolloSSRClient";
import { useSuspenseQuery } from "@apollo/experimental-nextjs-app-support/ssr";

import { gql } from "@apollo/client";

const query = gql`
  query GetHatWearers {
    hat(
      id: "0x0000000d00020001000100000000000000000000000000000000000000000000"
    ) {
      id
      wearers {
        id
      }
    }
  }
`;
// const { data } = await getClient().query({ query });
{
  /* {data.hat.wearers.map((wearer: { id: string }) => {
          return <p key={wearer.id}> {wearer.id}</p>;
        })} */
}

export default function Page() {
  const { data } = useSuspenseQuery(query);
  console.log("data", data);

  return (
    <main>
      <Wrapper>
        <p>East Side</p>
      </Wrapper>
    </main>
  );
}
