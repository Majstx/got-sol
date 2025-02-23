import { Connection, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";

// Add proper type definitions
interface ConnectionConfig {
    commitment: 'confirmed';
    confirmTransactionInitialTimeout: number;
}

async function testMainnet() {
    console.log("🚀 Starting Solana Mainnet Test...\n");
    
    try {
        // Create mainnet connection
        console.log("1️⃣ Connecting to Mainnet...");
        const connection = new Connection(
            'https://mainnet.helius-rpc.com/?api-key=af619c05-98c6-4751-b389-a5d28947041d',
            {
                commitment: 'confirmed',
                confirmTransactionInitialTimeout: 60000
            }
        );

        // Test basic connection
        console.log("2️⃣ Testing connection...");
        const { blockhash } = await connection.getLatestBlockhash();
        console.log("✅ Latest blockhash:", blockhash);

        // Get network status
        const slot = await connection.getSlot();
        console.log("✅ Current slot:", slot);

        // Get network version
        const version = await connection.getVersion();
        console.log("✅ Solana version:", version["solana-core"]);

        // Test transaction count
        const blockHeight = await connection.getBlockHeight();
        console.log("✅ Current block height:", blockHeight);

        console.log("\n🎉 Mainnet connection test successful!");
        
    } catch (error) {
        console.error("\n❌ Mainnet test failed:", error.message);
        console.log("\n🔧 Troubleshooting steps:");
        console.log("1. Check internet connection");
        console.log("2. Verify RPC endpoint status");
        console.log("3. Check for rate limiting");
        console.log("4. Try alternative RPC endpoint");
        process.exit(1);
    }
}

// Run the mainnet test
console.log("=====================================");
console.log("🌟 Solana Mainnet Test Suite 🌟");
console.log("=====================================\n");

testMainnet().catch(console.error);