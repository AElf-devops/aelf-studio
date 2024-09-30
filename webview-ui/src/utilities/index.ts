import AElf from 'aelf-sdk';

export function getAElf(rpcUrl: string) {
  return new AElf(new AElf.providers.HttpProvider(rpcUrl, 60000));
}

export function getSecondHashValue(url: string) {
  const urlObj = new URL(url);
  const hash = urlObj.hash.slice(1);
  const hashParts = hash.split('#');
  return hashParts[1];
}
