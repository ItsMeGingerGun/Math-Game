const axios = require('axios');

const validateUser = async (signerUuid) => {
  try {
    const response = await axios.get(
      `https://api.neynar.com/v2/farcaster/signer?signer_uuid=${signerUuid}`,
      {
        headers: {
          'api_key': process.env.NEYNAR_API_KEY
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Neynar error:', error.response?.data || error.message);
    return null;
  }
};

module.exports = { validateUser };
