#!/usr/bin/env node

/**
 * Security Hash Generator for TeamCodeLocked
 * 
 * This script generates secure bcrypt hashes for admin passwords
 * with enhanced security features.
 */

const bcrypt = require('bcryptjs');
const crypto = require('crypto');

async function generateSecureHash(password, costFactor = 12) {
  console.log('🔐 Generating secure hash...');
  console.log(`📊 Using cost factor: ${costFactor} (higher = more secure but slower)`);
  
  const startTime = Date.now();
  const hash = await bcrypt.hash(password, costFactor);
  const endTime = Date.now();
  
  console.log(`⏱️  Generation time: ${endTime - startTime}ms`);
  console.log(`🔑 Generated hash: ${hash}`);
  
  return hash;
}

async function testHash(password, hash) {
  console.log('\n🧪 Testing hash verification...');
  const startTime = Date.now();
  const isValid = await bcrypt.compare(password, hash);
  const endTime = Date.now();
  
  console.log(`⏱️  Verification time: ${endTime - startTime}ms`);
  console.log(`✅ Hash verification: ${isValid ? 'PASSED' : 'FAILED'}`);
  
  return isValid;
}

function generateJWTSecret() {
  const secret = crypto.randomBytes(64).toString('hex');
  console.log('\n🔐 Generated JWT Secret:');
  console.log(`JWT_SECRET="${secret}"`);
  return secret;
}

async function main() {
  console.log('🚀 TeamCodeLocked Security Hash Generator\n');
  
  // Get password from command line or use default
  const password = process.argv[2] || 'alia';
  const costFactor = parseInt(process.argv[3]) || 12;
  
  console.log(`🔤 Password: "${password}"`);
  
  try {
    // Generate hash
    const hash = await generateSecureHash(password, costFactor);
    
    // Test the hash
    await testHash(password, hash);
    
    // Generate JWT secret
    generateJWTSecret();
    
    // Output environment variables
    console.log('\n📝 Environment Variables:');
    console.log('=' .repeat(50));
    console.log(`ADMIN_PASSWORD_HASH="${hash}"`);
    console.log(`# Cost factor: ${costFactor}`);
    console.log(`# Password: "${password}"`);
    console.log('=' .repeat(50));
    
    console.log('\n💡 Usage Instructions:');
    console.log('1. Copy the ADMIN_PASSWORD_HASH to your .env file');
    console.log('2. Make sure to quote the hash to prevent shell interpretation');
    console.log('3. Restart your development server');
    console.log('4. Use the same password for login');
    
  } catch (error) {
    console.error('❌ Error generating hash:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { generateSecureHash, testHash, generateJWTSecret };
