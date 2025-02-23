import { Connection } from "@solana/web3.js";

async function testConnection() {
    const connection = new Connection(
        'https://mainnet.helius-rpc.com/?api-key=af619c05-98c6-4751-b389-a5d28947041d',
        'confirmed'
    );
    return connection;
}

export { testConnection };

async function runSystemTests() {
    console.log("🚀 Starting Full System Test...");
    let connection: Connection;

    try {
        // Test 1: Connection Establishment
        console.log("\n1️⃣ Testing Connection...");
        connection = await testConnection();
        console.log(`✅ Connected to: ${connection.rpcEndpoint.split('?')[0]}`);

        // Test 2: Basic RPC Operations
        console.log("\n2️⃣ Testing Basic Operations...");
        const { blockhash } = await connection.getLatestBlockhash();
        console.log("✅ Latest blockhash:", blockhash);

        const slot = await connection.getSlot();
        console.log("✅ Current slot:", slot);

        // Test 3: Network Status
        console.log("\n3️⃣ Testing Network Status...");
        const blockHeight = await connection.getBlockHeight();
        console.log("✅ Current block height:", blockHeight);

        // Test 4: Performance Check
        console.log("\n4️⃣ Testing Performance...");
        const startTime = Date.now();
        await Promise.all([
            connection.getLatestBlockhash(),
            connection.getSlot(),
            connection.getBlockHeight()
        ]);
        const endTime = Date.now();
        console.log(`✅ Concurrent operations completed in ${endTime - startTime}ms`);

        // Test 5: Connection Stability
        console.log("\n5️⃣ Testing Connection Stability...");
        for (let i = 0; i < 3; i++) {
            await connection.getLatestBlockhash();
            console.log(`✅ Stability test ${i + 1}/3 passed`);
        }

        console.log("\n🎉 All system tests passed successfully!");

    } catch (error) {
        console.error("\n❌ Test failed:", error.message);
        console.log("\n🔧 Troubleshooting Guide:");
        console.log("1. Check internet connection");
        console.log("2. Verify RPC endpoint status");
        console.log("3. Check for rate limiting");
        console.log("4. Try alternate RPC endpoint");
        console.log(`5. Current endpoint: ${connection?.rpcEndpoint.split('?')[0]}`);
        process.exit(1);
    }
}

// Execute tests
console.log("================================");
console.log("🌟 Solana System Test Suite 🌟");
console.log("================================\n");

runSystemTests().catch(error => {
    console.error("Fatal error:", error);
    process.exit(1);
}); 