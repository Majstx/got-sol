import {
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import {
  Account,
  createAssociatedTokenAccountInstruction,
  createTransferCheckedInstruction,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { SplUtils } from "./SplUtils";
import { TransactionFactory } from "./TransactionFactory";

const PAYMENT_FEE = 0.01;
const SPLITTER_SHARE = 0.4;
const DEV_SHARE = 0.05;
const OPERATOR_SHARE = 0.1;

type Part = {
  to: PublicKey;
  amount: number;
  isMerchant: boolean;
};

export class SplitPaymentTransactionBuilder {
  private readonly parts: Part[] = [];
  private readonly fee: number;
  private decimals: number;
  private feePayer: Keypair;
  private splToken: PublicKey;
  private sender: PublicKey;
  private senderATA: PublicKey;
  private senderAccount: Account;

  private constructor(
    private readonly transactionFactory: TransactionFactory,
    private readonly splUtils: SplUtils,
    private readonly amount: number
  ) {
    this.fee = Math.floor(amount * PAYMENT_FEE);
  }

  static init(
    transactionFactory: TransactionFactory,
    splUtils: SplUtils,
    amount
  ): SplitPaymentTransactionBuilder {
    return new SplitPaymentTransactionBuilder(
      transactionFactory,
      splUtils,
      amount
    );
  }

  addMerchant(receiver: PublicKey): SplitPaymentTransactionBuilder {
    const amount = this.amount - this.fee;
    this.addPart(receiver, amount, true);
    return this;
  }

  addDev(receiver: PublicKey): SplitPaymentTransactionBuilder {
    const amount = Math.floor(this.fee * DEV_SHARE);
    this.addPart(receiver, amount);
    return this;
  }

  addSplitter(receiver: PublicKey): SplitPaymentTransactionBuilder {
    const amount = Math.floor(this.fee * SPLITTER_SHARE);
    this.addPart(receiver, amount);
    return this;
  }

  addOperator(receiver: PublicKey): SplitPaymentTransactionBuilder {
    const amount = Math.floor(this.fee * OPERATOR_SHARE);
    this.addPart(receiver, amount);
    return this;
  }

  setDecimals(decimals: number) {
    this.decimals = decimals;
    return this;
  }

  setFeePayer(feePayer: Keypair) {
    this.feePayer = feePayer;
    return this;
  }

  setSplToken(splToken: PublicKey) {
    this.splToken = splToken;
    return this;
  }

  setSender(sender: PublicKey) {
    this.sender = sender;
    return this;
  }

  async build(): Promise<Transaction> {
    const sum = this.parts
      .map(({ amount }) => amount)
      .reduce((acc, val) => acc + val);

    if (sum > this.amount) {
      throw new Error("the sum of parts cannot be greater than the total");
    }

    if (sum < this.amount) {
      const leftover = this.amount - sum;
      const merchant = this.parts.find((p) => p.isMerchant);
      merchant.amount += leftover;
    }

    await this.loadSenderAccounts();

    const instructions = await this.getInstructions();

    return this.transactionFactory.make(this.feePayer, instructions);
  }

  private async loadSenderAccounts() {
    this.senderATA = await this.splUtils.getAssociatedTokenAddress(
      this.splToken,
      this.sender
    );

    this.senderAccount = await this.splUtils.getAccount(this.senderATA);

    // Check that the sender has enough tokens
    if (this.amount > this.senderAccount.amount) {
      throw new Error("insufficient funds");
    }
  }

  private async getInstructions() {
    const instructionGroups = await Promise.all(
      this.parts.map(({ to, amount }) => {
        return this.transferTo(to, amount);
      })
    );

    return instructionGroups.reduce((ixs, group) => ixs.concat(group));
  }

  private addPart(receiver: PublicKey, amount: number, isMerchant = false) {
    this.parts.push({
      to: receiver,
      amount,
      isMerchant,
    });
  }

  private async transferTo(
    recipient: PublicKey,
    amount: number
  ): Promise<TransactionInstruction[]> {
    const instructions = [];

    const recipientATA = await this.splUtils.getAssociatedTokenAddress(
      this.splToken,
      recipient
    );
    const recipientAccount = await this.splUtils.getAccount(recipientATA);
    if (!recipientAccount) {
      instructions.push(this.createTokenAccount(recipient, recipientATA));
    }

    return instructions.concat(
      createTransferCheckedInstruction(
        this.senderATA,
        this.splToken,
        recipientATA,
        this.sender,
        amount,
        this.decimals
      )
    );
  }

  private createTokenAccount(
    owner: PublicKey,
    ata: PublicKey
  ): TransactionInstruction {
    return createAssociatedTokenAccountInstruction(
      this.feePayer.publicKey,
      ata,
      owner,
      this.splToken,
      TOKEN_PROGRAM_ID
    );
  }
}
