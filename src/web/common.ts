import AElf from "aelf-sdk";

export const aelf = new AElf(
  new AElf.providers.HttpProvider("https://tdvw-test-node.aelf.io")
);

export {AElf};

// @ts-expect-error
const { deserializeLog } = AElf.pbUtils;
export async function getLogs(transactionId: string) {
  const result = await aelf.chain.getTxResult(transactionId);
  const services = await Promise.all(
    result!.Logs.map(async ({ Address }: { Address: string }) =>
      // @ts-expect-error
      AElf.pbjs.Root.fromDescriptor(
        await aelf.chain.getContractFileDescriptorSet(Address)
      )
    )
  );

  const deserializedLogs: Array<{ proposalId: string }> = await deserializeLog(
    result!.Logs,
    services
  );

  return deserializedLogs.reduce(
    (acc, cur) => ({ ...acc, ...cur }),
    {} as Record<string, string>
  );
}

export const PLAYGROUND_URL = "https://playground-next.test.aelf.dev";
export const AELFSCAN_URL = "https://testnet.aelfscan.io/tDVW";

export const AUDIT_CONTRACT_ADDRESS = "ASh2Wt7nSEmYqnGxPPzp4pnVDU4uhj1XW9Se5VeZcX2UDdyjx";