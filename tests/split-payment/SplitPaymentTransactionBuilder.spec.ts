import "reflect-metadata";
import { SplitPaymentTransactionBuilder } from "../../src/split-payment/SplitPaymentTransactionBuilder";
import { TransactionFactory } from "../../src/split-payment/TransactionFactory";
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import { SplUtils } from "../../src/split-payment/SplUtils";
import { expect } from "chai";
import { Account } from "@solana/spl-token";
import { assert, createSandbox } from "sinon";
import { Logger } from "winston";

describe("SplitPaymentTransactionBuilder", () => {
  const sandbox = createSandbox();

  afterEach(() => {
    sandbox.reset();
  });

  const stubGetAssociatedTokenAddress = sandbox.stub();
  const stubGetAccount = sandbox.stub();
  const stubMakeTransaction = sandbox.stub();
  const logger = {
    info: sandbox.stub(),
    warn: sandbox.stub(),
  };

  class MockTransactionFactory extends TransactionFactory {
    constructor() {
      super(null as Connection);
    }

    async make(
      feePayer: Keypair,
      instructions: TransactionInstruction[]
    ): Promise<Transaction> {
      return stubMakeTransaction(feePayer, instructions);
    }
  }

  class MockSplUtils extends SplUtils {
    constructor() {
      super(null as Connection);
    }

    getAssociatedTokenAddress(splToken, owner): Promise<PublicKey> {
      return stubGetAssociatedTokenAddress(splToken, owner);
    }

    async getAccount(ata: PublicKey): Promise<Account | null> {
      return stubGetAccount(ata);
    }

    createTokenAccount(
      payer: PublicKey,
      associatedToken: PublicKey,
      owner: PublicKey,
      mint: PublicKey
    ): TransactionInstruction {
      return {
        payer,
        associatedToken,
        owner,
        mint,
      } as any as TransactionInstruction;
    }

    createTransferCheckedInstruction(
      source: PublicKey,
      mint: PublicKey,
      destination: PublicKey,
      owner: PublicKey,
      amount: number,
      decimals: number
    ): TransactionInstruction {
      return {
        source,
        mint,
        destination,
        owner,
        amount,
        decimals,
      } as any as TransactionInstruction;
    }
  }

  const transactionFactory = new MockTransactionFactory();
  const splUtils = new MockSplUtils();
  const senderAta = new PublicKey(0);
  const senderAccount = { amount: 1000 * 1e6 } as any as Account;

  const tokens = 42 * 1e6;
  const decimals = 6;
  const splToken = new PublicKey(1);
  const sender = new PublicKey(2);
  const recipient = new PublicKey(3);
  const devA = new PublicKey(4);
  const devB = new PublicKey(5);
  const splitterA = new PublicKey(6);
  const splitterB = new PublicKey(7);
  const operator = Keypair.generate();
  const feePayer = operator;

  it("builds a transaction", async () => {
    const fakeTx = new Transaction();

    stubGetAssociatedTokenAddress.resolves(senderAta);
    stubGetAccount.resolves(senderAccount);
    stubGetAssociatedTokenAddress.onCall(1).resolves(recipient);
    stubGetAssociatedTokenAddress.onCall(2).resolves(devA);
    stubGetAssociatedTokenAddress.onCall(3).resolves(devB);
    stubGetAssociatedTokenAddress.onCall(4).resolves(splitterA);
    stubGetAssociatedTokenAddress.onCall(5).resolves(splitterB);
    stubGetAssociatedTokenAddress.onCall(6).resolves(operator.publicKey);
    stubMakeTransaction.resolves(fakeTx);

    const builder = new SplitPaymentTransactionBuilder(
      transactionFactory,
      splUtils,
      logger as any as Logger
    );
    const tx = await builder
      .setAmount(tokens)
      .setSplToken(splToken)
      .setFeePayer(feePayer)
      .setSender(sender)
      .setDecimals(decimals)
      .addMerchant(recipient)
      .addDev(devA)
      .addDev(devB)
      .addSplitter(splitterA)
      .addSplitter(splitterB)
      .addOperator(operator.publicKey)
      .build();

    expect(tx).to.eq(fakeTx);

    assert.calledWithExactly(
      stubGetAssociatedTokenAddress.firstCall,
      splToken,
      sender
    );
    assert.calledWithExactly(stubGetAccount.firstCall, senderAta);

    assert.calledOnce(stubMakeTransaction);
    const {
      args: [txFeePayer, instructions],
    } = stubMakeTransaction.firstCall;
    expect(txFeePayer).to.eq(feePayer);
    expect(instructions).to.eql([
      {
        source: senderAta,
        mint: splToken,
        destination: recipient,
        owner: sender,
        amount: 41580000,
        decimals,
      },
      {
        source: senderAta,
        mint: splToken,
        destination: devA,
        owner: sender,
        amount: 21000,
        decimals,
      },
      {
        source: senderAta,
        mint: splToken,
        destination: devB,
        owner: sender,
        amount: 21000,
        decimals,
      },
      {
        source: senderAta,
        mint: splToken,
        destination: splitterA,
        owner: sender,
        amount: 168000,
        decimals,
      },
      {
        source: senderAta,
        mint: splToken,
        destination: splitterB,
        owner: sender,
        amount: 168000,
        decimals,
      },
      {
        source: senderAta,
        mint: splToken,
        destination: operator.publicKey,
        owner: sender,
        amount: 42000,
        decimals,
      },
    ]);
  });

  it("invalid amount", async () => {
    const builder = new SplitPaymentTransactionBuilder(
      transactionFactory,
      splUtils,
      logger as any as Logger
    );

    try {
      await builder.build();
      assert.fail();
    } catch (e) {
      expect(e.message).to.eq("invalid amount");
    }
  });

  it("the sum of parts cannot be greater than the total", async () => {
    const builder = new SplitPaymentTransactionBuilder(
      transactionFactory,
      splUtils,
      logger as any as Logger
    );

    try {
      await builder
        .setAmount(100)
        .addMerchant(recipient)
        .addMerchant(recipient)
        .build();
      assert.fail();
    } catch (e) {
      expect(e.message).to.eq(
        "the sum of parts cannot be greater than the total"
      );
    }
  });

  it("amounts that are less than 1 should be ignored", async () => {
    stubGetAssociatedTokenAddress.resolves(senderAta);
    stubGetAccount.resolves(senderAccount);

    const builder = new SplitPaymentTransactionBuilder(
      transactionFactory,
      splUtils,
      logger as any as Logger
    );

    await builder
      .setAmount(5)
      .setSender(sender)
      .addMerchant(recipient)
      .addDev(devA)
      .build();

    assert.calledWithExactly(logger.warn, "part is less than 1, skipping...", {
      to: devA.toString(),
    });

    const {
      args: [, [ix]],
    } = stubMakeTransaction.firstCall;
    expect(ix.amount).to.eq(5);
  });

  it("insufficient funds", async () => {
    stubGetAccount.resolves({ amount: 10 });

    const builder = new SplitPaymentTransactionBuilder(
      transactionFactory,
      splUtils,
      logger as any as Logger
    );

    try {
      await builder.setAmount(100).addMerchant(recipient).build();
      assert.fail();
    } catch (e) {
      expect(e.message).to.eq("insufficient funds");
    }
  });

  it("leftover goes to merchant", async () => {
    stubGetAccount.resolves({ amount: 100 });
    stubGetAssociatedTokenAddress.onCall(1).resolves(recipient);

    const builder = new SplitPaymentTransactionBuilder(
      transactionFactory,
      splUtils,
      logger as any as Logger
    );

    await builder
      .setFeePayer(feePayer)
      .setAmount(100)
      .addMerchant(recipient)
      .build();

    const {
      args: [txFeePayer, [ix]],
    } = stubMakeTransaction.firstCall;
    expect(txFeePayer).to.eq(feePayer);
    expect(ix.destination).to.eq(recipient);
    expect(ix.amount).to.eq(100);
  });

  it("create spl account if needed", async () => {
    const ata = new PublicKey(10);

    stubGetAccount.onCall(0).resolves({ amount: 100 });
    stubGetAccount.onCall(1).resolves(null);
    stubGetAssociatedTokenAddress.onCall(1).resolves(ata);

    const builder = new SplitPaymentTransactionBuilder(
      transactionFactory,
      splUtils,
      logger as any as Logger
    );

    await builder
      .setSplToken(splToken)
      .setFeePayer(feePayer)
      .setAmount(100)
      .addMerchant(recipient)
      .build();

    const {
      args: [txFeePayer, [createAccountIx, transferIx]],
    } = stubMakeTransaction.firstCall;
    expect(txFeePayer).to.eq(feePayer);
    expect(createAccountIx).to.eql({
      payer: feePayer.publicKey,
      associatedToken: ata,
      owner: recipient,
      mint: splToken,
    });
    expect(transferIx.destination).to.eq(ata);
    expect(transferIx.amount).to.eq(100);
  });
});
