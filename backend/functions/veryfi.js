// Create Veryfi client using env variables
import Veryfi from '@veryfi/veryfi-sdk';

const veryfiClient = new Veryfi(
  process.env.VERYFI_CLIENT_ID,
  process.env.VERYFI_CLIENT_SECRET,
  process.env.VERYFI_USERNAME,
  process.env.VERYFI_API_KEY
);

export default veryfiClient;