const axios = require('axios');
const FormData = require('form-data');

class IPFSService {
  constructor() {
    this.pinataApiKey = process.env.PINATA_API_KEY;
    this.pinataSecretKey = process.env.PINATA_SECRET_KEY;
    this.pinataEndpoint = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
    this.gatewayUrl = 'https://gateway.pinata.cloud/ipfs/';
  }

  _authHeaders() {
    return {
      'pinata_api_key': this.pinataApiKey,
      'pinata_secret_api_key': this.pinataSecretKey
    };
  }

  _extractResult(response) {
    return {
      ipfsHash: response.data.IpfsHash,
      pinSize: response.data.PinSize,
      timestamp: response.data.Timestamp
    };
  }

  async uploadFile(fileBuffer, fileName) {
    try {
      const formData = new FormData();
      formData.append('file', fileBuffer, { filename: fileName });
      formData.append('pinataMetadata', JSON.stringify({
        name: fileName,
        keyvalues: { uploadedBy: 'attestify', timestamp: Date.now().toString() }
      }));
      formData.append('pinataOptions', JSON.stringify({ cidVersion: 1 }));

      const response = await axios.post(this.pinataEndpoint, formData, {
        maxBodyLength: 'Infinity',
        headers: {
          'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
          ...this._authHeaders()
        }
      });

      return this._extractResult(response);
    } catch (error) {
      console.error('IPFS upload error:', error.response?.data || error.message);
      throw new Error(`IPFS upload failed: ${error.message}`);
    }
  }

  async uploadJSON(data, name) {
    try {
      const response = await axios.post('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
        pinataContent: data,
        pinataMetadata: {
          name: name || 'metadata.json',
          keyvalues: { uploadedBy: 'attestify', timestamp: Date.now().toString() }
        },
        pinataOptions: { cidVersion: 1 }
      }, {
        headers: { 'Content-Type': 'application/json', ...this._authHeaders() }
      });

      return this._extractResult(response);
    } catch (error) {
      console.error('IPFS JSON upload error:', error.response?.data || error.message);
      throw new Error(`IPFS JSON upload failed: ${error.message}`);
    }
  }

  async unpinFile(ipfsHash) {
    try {
      await axios.delete(`https://api.pinata.cloud/pinning/unpin/${ipfsHash}`, {
        headers: this._authHeaders()
      });
      return true;
    } catch (error) {
      console.error('IPFS unpin error:', error);
      throw new Error(`Failed to unpin file: ${error.message}`);
    }
  }

  getIPFSUrl(ipfsHash) {
    return `${this.gatewayUrl}${ipfsHash}`;
  }

  async testConnection() {
    try {
      const response = await axios.get('https://api.pinata.cloud/data/testAuthentication', {
        headers: this._authHeaders()
      });
      return response.data.message === 'Congratulations! You are communicating with the Pinata API!';
    } catch (error) {
      return false;
    }
  }
}

module.exports = new IPFSService();
