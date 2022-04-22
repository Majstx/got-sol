import { Connection, Keypair, Transaction } from "@solana/web3.js";
import { createTransferCheckedInstruction } from "@solana/spl-token";

const PAYMENT_FEE = 0.01;
const SPLITTER_SHARE = 0.4;
const DEV_SHARE = 0.05;
const OPERATOR_SHARE = 0.1;

const operator = Keypair.generate();

export class TransactionService {
  constructor(private readonly connection: Connection) {}

  async splitPay(amount: number): Promise<Transaction> {
    const { blockhash } = await this.connection.getLatestBlockhash("finalized");

    const tx = new Transaction({
      feePayer: operator.publicKey,
      recentBlockhash: blockhash,
    });

    const splitterAmount = amount * PAYMENT_FEE * SPLITTER_SHARE
    const devAmount = amount * PAYMENT_FEE * DEV_SHARE
    const opAmount = amount * PAYMENT_FEE * OPERATOR_SHARE
    const finalAmount = amount - (2 * splitterAmount) - (2 * devAmount) - opAmount

    this.transferTo(tx, splitterAmount)

    tx.partialSign(operator)
    return tx;
  }

  private transferTo(tx: Transaction, amount: number) {
    // const ix = createTransferCheckedInstruction()
    // tx.add(ix)
  }
}
