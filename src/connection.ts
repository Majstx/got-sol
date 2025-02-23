import { Connection, PublicKey } from "@solana/web3.js";

export class SolanaConnection {
    private static connection: Connection;

    public static async initialize() {
        try {
            this.connection = new Connection(
                'https://mainnet.helius-rpc.com/?api-key=af619c05-98c6-4751-b389-a5d28947041d',
                'confirmed'
            );
            
            // Test the connection
            await this.testConnection();
            return this.connection;
        } catch (error) {
            console.error("Failed to initialize Solana connection:", error);
            throw error;
        }
    }

    private static async testConnection() {
        try {
            const { blockhash } = await this.connection.getLatestBlockhash();
            const slot = await this.connection.getSlot();
            console.log("✅ Connection live with blockhash:", blockhash);
            console.log("✅ Current slot:", slot);
        } catch (error) {
            throw new Error(`Connection test failed: ${error.message}`);
        }
    }

    public static getConnection(): Connection {
        if (!this.connection) {
            throw new Error("Connection not initialized. Call initialize() first");
        }
        return this.connection;
    }
} 