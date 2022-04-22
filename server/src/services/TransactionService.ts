import { Connection, Keypair, PublicKey, Transaction } from "@solana/web3.js";
import { createTransferCheckedInstruction } from "@solana/spl-token";
import { devnet } from "../tokens";

const PAYMENT_FEE = 0.01;
const SPLITTER_SHARE = 0.4;
const DEV_SHARE = 0.05;
const OPERATOR_SHARE = 0.1;

type TokenInfo = {
  mint: PublicKey;
  decimals: number;
};

const operator = Keypair.generate();

export class TransactionService {
  constructor(private readonly connection: Connection) {}

  async createSplitPayTx(amount: number): Promise<Transaction> {
    const { blockhash } = await this.connection.getLatestBlockhash("finalized");

    const tx = new Transaction({
      feePayer: operator.publicKey,
      recentBlockhash: blockhash,
    });

    const token = devnet.USDC;

    const foo = amount * Math.pow(10, token.decimals);
    const splitterAmount = Math.floor(foo * PAYMENT_FEE * SPLITTER_SHARE);
    const devAmount = Math.floor(foo * PAYMENT_FEE * DEV_SHARE);
    const opAmount = Math.floor(foo * PAYMENT_FEE * OPERATOR_SHARE);
    const finalAmount = foo - 2 * splitterAmount - 2 * devAmount - opAmount;

    this.transferTo(tx, token, operator.publicKey, opAmount);

    tx.partialSign(operator);
    return tx;
  }

  private transferTo(
    tx: Transaction,
    token: TokenInfo,
    destination: PublicKey,
    amount: number
  ) {
    const from = Keypair.generate();

    const ix = createTransferCheckedInstruction(
      from.publicKey,
      token.mint,
      destination,
      from.publicKey,
      amount,
      token.decimals
    );

    tx.add(ix);
  }
}
