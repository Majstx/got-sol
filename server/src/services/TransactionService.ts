import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  Account,
  createAssociatedTokenAccountInstruction,
  createTransferCheckedInstruction,
  getAccount,
  getAssociatedTokenAddress,
  getMint,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";

// const PAYMENT_FEE = 0.01;
// const SPLITTER_SHARE = 0.4;
// const DEV_SHARE = 0.05;
// const OPERATOR_SHARE = 0.1;

export type SplitPayDetailsDto = {
  amount: number;
  sender: PublicKey;
  recipient: PublicKey;
  splToken: PublicKey;
};

export class TransactionService {
  constructor(
    private readonly connection: Connection,
    private readonly operator: Keypair
  ) {}

  async createSplitPayTx({
    amount,
    sender,
    recipient,
    splToken,
  }: SplitPayDetailsDto): Promise<Transaction> {
    // Check that the token provided is an initialized mint
    const mint = await getMint(this.connection, splToken);
    if (!mint.isInitialized) throw new Error("mint not initialized");

    const [senderATA, senderAccount] = await this.getSplAddresses(
      splToken,
      sender
    );

    // Check that the sender has enough tokens
    const tokens = amount * Math.pow(10, mint.decimals);
    if (tokens > senderAccount.amount) throw new Error("insufficient funds");

    // const splitterAmount = Math.floor(foo * PAYMENT_FEE * SPLITTER_SHARE);
    // const devAmount = Math.floor(foo * PAYMENT_FEE * DEV_SHARE);
    // const opAmount = Math.floor(foo * PAYMENT_FEE * OPERATOR_SHARE);
    // const finalAmount = foo - 2 * splitterAmount - 2 * devAmount - opAmount;

    const ix = await this.transferTo(
      splToken,
      sender,
      senderATA,
      recipient,
      tokens,
      mint.decimals
    );

    return this.createTransaction(ix);
  }

  private async transferTo(
    splToken: PublicKey,
    sender: PublicKey,
    senderATA: PublicKey,
    recipient: PublicKey,
    amount: number,
    decimals: number
  ): Promise<TransactionInstruction[]> {
    const instructions: TransactionInstruction[] = [];

    const [recipientATA, recipientAccount] = await this.getSplAddresses(
      splToken,
      recipient
    );
    if (!recipientAccount) {
      instructions.push(
        this.createTokenAccount(splToken, recipient, recipientATA)
      );
    }

    return instructions.concat(
      createTransferCheckedInstruction(
        senderATA,
        splToken,
        recipientATA,
        sender,
        amount,
        decimals
      )
    );
  }

  private async getSplAddresses(
    splToken: PublicKey,
    owner: PublicKey
  ): Promise<[PublicKey, Account?]> {
    let account;
    const ata = await getAssociatedTokenAddress(splToken, owner);

    try {
      account = await getAccount(this.connection, ata);
    } catch (err) {
      return [ata];
    }

    if (!account.isInitialized) throw new Error("owner not initialized");
    if (account.isFrozen) throw new Error("owner is frozen");

    return [ata, account];
  }

  private async createTransaction(
    instructions: TransactionInstruction[]
  ): Promise<Transaction> {
    const { blockhash } = await this.connection.getLatestBlockhash("finalized");

    const tx = new Transaction({
      feePayer: this.operator.publicKey,
      recentBlockhash: blockhash,
    });
    instructions.forEach((ix) => tx.add(ix));
    tx.partialSign(this.operator);

    return tx;
  }

  private createTokenAccount(
    splToken: PublicKey,
    owner: PublicKey,
    ata: PublicKey
  ): TransactionInstruction {
    return createAssociatedTokenAccountInstruction(
      this.operator.publicKey,
      ata,
      owner,
      splToken,
      TOKEN_PROGRAM_ID
    );
  }
}
