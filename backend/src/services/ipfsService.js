const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

class IPFSService {
  constructor() {
    this.pinataApiKey = process.env.PINATA_API_KEY;
    this.pinataSecretKey = process.env.PINATA_SECRET_KEY;
    this.pinataEndpoint = 'https://api.pinata.cloud/pinning/pinFileToIPFS';
    this.gatewayUrl = 'https://gateway.pinata.cloud/ipfs/';
  }

  async uploadFile(filePath, fileName) {
    try {
      const formData = new FormData();
      formData.append('file', fs.createReadStream(filePath));

      const metadata = JSON.stringify({
        name: fileName,
        keyvalues: {
          uploadedBy: 'attestify',
          timestamp: Date.now().toString()
        }
      });
      formData.append('pinataMetadata', metadata);

      const options = JSON.stringify({
        cidVersion: 1
      });
      formData.append('pinataOptions', options);

      const response = await axios.post(this.pinataEndpoint, formData, {
        maxBodyLength: 'Infinity',
        headers: {
          'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
          'pinata_api_key': this.pinataApiKey,
          'pinata_secret_api_key': this.pinataSecretKey
        }
      });

      return {
        ipfsHash: response.data.IpfsHash,
        pinSize: response.data.PinSize,
        timestamp: response.data.Timestamp
      };

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
          keyvalues: {
            uploadedBy: 'attestify',
            timestamp: Date.now().toString()
          }
        },
        pinataOptions: {
          cidVersion: 1
        }
      }, {
        headers: {
          'Content-Type': 'application/json',
          'pinata_api_key': this.pinataApiKey,
          'pinata_secret_api_key': this.pinataSecretKey
        }
      });

      return {
        ipfsHash: response.data.IpfsHash,
        pinSize: response.data.PinSize,
        timestamp: response.data.Timestamp
      };
    } catch (error) {
      console.error('IPFS JSON upload error:', error.response?.data || error.message);
      throw new Error(`IPFS JSON upload failed: ${error.message}`);
    }
  }

  async unpinFile(ipfsHash) {
    try {
      await axios.delete(
        `https://api.pinata.cloud/pinning/unpin/${ipfsHash}`,
        {
          headers: {
            'pinata_api_key': this.pinataApiKey,
            'pinata_secret_api_key': this.pinataSecretKey
          }
        }
      );
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
        headers: {
          'pinata_api_key': this.pinataApiKey,
          'pinata_secret_api_key': this.pinataSecretKey
        }
      });
      return response.data.message === 'Congratulations! You are communicating with the Pinata API!';
    } catch (error) {
      return false;
    }
  }
}

module.exports = new IPFSService();
