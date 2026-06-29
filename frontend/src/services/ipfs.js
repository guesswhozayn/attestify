const IPFS_GATEWAY = 'https://gateway.pinata.cloud/ipfs/';

export const getIpfsUrl = (cid) => cid ? `${IPFS_GATEWAY}${cid}` : '';

export const fetchIpfsFile = async (cid) => {
  const response = await fetch(getIpfsUrl(cid));
  if (!response.ok) throw new Error('Failed to fetch file from IPFS');
  return response.blob();
};

export const fetchIpfsJSON = async (cid) => {
  const response = await fetch(getIpfsUrl(cid));
  if (!response.ok) throw new Error('Failed to fetch JSON from IPFS');
  return response.json();
};
