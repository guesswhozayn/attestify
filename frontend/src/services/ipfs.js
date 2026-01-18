class IPFSService {
  constructor() {
    this.gateway = 'https://gateway.pinata.cloud/ipfs/';
  }

  getUrl(cid) {
    return `${this.gateway}${cid}`;
  }

  async fetchFile(cid) {
    try {
      const response = await fetch(this.getUrl(cid));
      return await response.blob();
    } catch (error) {
      throw new Error(`Failed to fetch file from IPFS: ${error.message}`);
    }
  }

  async fetchJSON(cid) {
    try {
      const response = await fetch(this.getUrl(cid));
      return await response.json();
    } catch (error) {
      throw new Error(`Failed to fetch JSON from IPFS: ${error.message}`);
    }
  }
}

export default new IPFSService();
