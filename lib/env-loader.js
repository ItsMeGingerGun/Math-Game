import dotenv from 'dotenv';
import crypto from 'crypto';

// Generate consistent app ID for vercel instances
process.env.APP_INSTANCE_ID = process.env.VERCEL 
    ? crypto.createHash('sha256').update(process.env.VERCEL_URL).digest('hex').substring(0, 8)
    : 'local-' + crypto.randomBytes(4).toString('hex');

// Load environment
dotenv.config();

// Validate critical variables
const requiredVars = ['REDIS_URL', 'NEYNAR_API_KEY'];
const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
    console.error('Missing required environment variables:', missingVars.join(', '));
    
    // Provide defaults for Vercel to prevent crash
    if (process.env.VERCEL) {
        console.warn('Using placeholder values - application may not function properly');
        process.env.REDIS_URL = 'redis://localhost:6379';
        process.env.NEYNAR_API_KEY = 'invalid-key';
    } else {
        throw new Error('Missing required environment variables');
    }
}
