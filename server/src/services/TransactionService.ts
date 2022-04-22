import { Connection, Keypair, Transaction } from "@solana/web3.js";
import { createTransferCheckedInstruction } from "@solana/spl-token";

const PAYMENT_FEE = 0.01;
const SPLITTER_SHARE = 0.4;
const DEV_SHARE = 0.05;
const OPERATOR_SHARE = 0.1;

const operator = Keypair.generate();

export class TransactionService {
  constructor(private readonly connection: Connection) {}

  async splitPay(): Promise<Transaction> {
    const { blockhash } = await this.connection.getLatestBlockhash("finalized");

    const tx = new Transaction({
      feePayer: operator.publicKey,
      recentBlockhash: blockhash,
    });

    // const ix = createTransferCheckedInstruction()
    // tx.add(ix)

    return tx;
  }
}
