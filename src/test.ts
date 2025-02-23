import { Connection } from "@solana/web3.js";

// Add proper type definitions
interface ConnectionConfig {
    commitment: 'confirmed';
    confirmTransactionInitialTimeout: number;
}

async function testConnection() {
    console.log("🚀 Testing Helius RPC Connection...\n");
    
    const HELIUS_URL: string = 'https://mainnet.helius-rpc.com/?api-key=af619c05-98c6-4751-b389-a5d28947041d';
    
    try {
        const config: ConnectionConfig = {
            commitment: 'confirmed',
            confirmTransactionInitialTimeout: 60000
        };

        const connection = new Connection(HELIUS_URL, config);
        
        // Test basic operation
        console.log("2️⃣ Testing basic operations...");
        const { blockhash } = await connection.getLatestBlockhash();
        console.log("✅ Latest blockhash:", blockhash);
        
        // Test slot
        const slot = await connection.getSlot();
        console.log("✅ Current slot:", slot);
        
        console.log("\n🎉 All tests passed successfully!");
        
    } catch (error: any) {
        console.error("\n❌ Connection failed:", error.message);
        console.log("\n🔧 Troubleshooting steps:");
        console.log("1. Check your internet connection");
        console.log("2. Verify the RPC endpoint is accessible");
        console.log("3. Check if you're being rate limited");
        process.exit(1);
    }
}

testConnection().catch((error: Error) => {
    console.error(error);
    process.exit(1);
});