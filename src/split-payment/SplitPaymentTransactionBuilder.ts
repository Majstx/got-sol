import {
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { Account } from "@solana/spl-token";
import { SplUtils } from "./SplUtils";
import { TransactionFactory } from "./TransactionFactory";
import { inject, injectable } from "tsyringe";
import { Logger } from "winston";

export const MEMO_PROGRAM_ID = new PublicKey(
  "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr"
);

const PAYMENT_FEE = 0.0125;
const SPLITTER_SHARE = 0;
const DEV_SHARE = 0.5;
const OPERATOR_SHARE = 0.5;

type Part = {
  to: PublicKey;
  amount: number;
  isMerchant: boolean;
};

@injectable()
export class SplitPaymentTransactionBuilder {
  private readonly parts: Part[] = [];

  private amount: number;
  private fee: number;
  private decimals: number;
  private feePayer: Keypair;
  private splToken: PublicKey;
  private sender: PublicKey;
  private senderATA: PublicKey;
  private reference: PublicKey;
  private senderAccount: Account;
  private id: number;
  private memo: string;

  constructor(
    @inject(TransactionFactory)
    private readonly transactionFactory: TransactionFactory,
    @inject(SplUtils) private readonly splUtils: SplUtils,
    @inject("Logger") private readonly logger: Logger
  ) {}

  setId(id: number): SplitPaymentTransactionBuilder {
    this.id = id;
    return this;
  }

  setAmount(amount: number): SplitPaymentTransactionBuilder {
    this.amount = amount;
    this.fee = Math.floor(amount * PAYMENT_FEE);
    return this;
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

  setReference(reference: PublicKey) {
    this.reference = reference;
    return this;
  }

  setMemo(memo: string) {
    this.memo = memo;
    return this;
  }

  async build(): Promise<Transaction> {
    if (!this.amount) {
      throw new Error("invalid amount");
    }

    const sum = this.parts
      .map(({ amount }) => amount)
      .reduce((acc, val) => acc + val, 0);

    if (sum > this.amount) {
      throw new Error("the sum of parts cannot be greater than the total");
    }

    if (sum < this.amount) {
      const leftover = this.amount - sum;
      const merchant = this.parts.find((p) => p.isMerchant);
      merchant.amount += leftover;
    }

    this.logger.info("split", {
      id: this.id,
      parts: this.parts.map(({ to, amount }) => {
        return { to: to.toString(), amount };
      }),
    });

    await this.loadSenderAccounts();

    const instructions = await this.getTransferInstructions();

    if (this.memo) {
      instructions.push(this.createMemoIx());
    }

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

  private async getTransferInstructions() {
    const instructionGroups = await Promise.all(
      this.parts.map(({ to, amount, isMerchant }) => {
        return this.transferTo(to, amount, isMerchant);
      })
    );

    return instructionGroups.reduce((ixs, group) => ixs.concat(group));
  }

  private addPart(receiver: PublicKey, amount: number, isMerchant = false) {
    if (amount < 1) {
      this.logger.warn("part is less than 1, skipping...", {
        to: receiver.toString(),
      });
      return;
    }

    this.parts.push({
      to: receiver,
      amount,
      isMerchant,
    });
  }

  private async transferTo(
    recipient: PublicKey,
    amount: number,
    isMerchant: boolean
  ): Promise<TransactionInstruction[]> {
    const instructions = [];

    const recipientATA = await this.splUtils.getAssociatedTokenAddress(
      this.splToken,
      recipient
    );
    const recipientAccount = await this.splUtils.getAccount(recipientATA);
    if (!recipientAccount) {
      instructions.push(
        this.splUtils.createTokenAccount(
          this.feePayer.publicKey,
          recipientATA,
          recipient,
          this.splToken
        )
      );
    }

    const transferIx = this.splUtils.createTransferCheckedInstruction(
      this.senderATA,
      this.splToken,
      recipientATA,
      this.sender,
      amount,
      this.decimals
    );

    if (isMerchant) {
      transferIx.keys.push({
        pubkey: this.reference,
        isWritable: false,
        isSigner: false,
      });
    }

    return instructions.concat(transferIx);
  }

  private createMemoIx(): TransactionInstruction {
    return new TransactionInstruction({
      programId: MEMO_PROGRAM_ID,
      keys: [],
      data: Buffer.from(this.memo, "utf8"),
    });
  }
}
