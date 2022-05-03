import {
  Account,
  createAssociatedTokenAccountInstruction,
  createTransferCheckedInstruction,
  getAccount,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { Connection, PublicKey, TransactionInstruction } from "@solana/web3.js";
import { inject, injectable } from "tsyringe";

@injectable()
export class SplUtils {
  constructor(@inject(Connection) private readonly connection: Connection) {}

  getAssociatedTokenAddress(splToken, owner): Promise<PublicKey> {
    return getAssociatedTokenAddress(splToken, owner);
  }

  async getAccount(ata: PublicKey): Promise<Account | null> {
    try {
      return await getAccount(this.connection, ata);
    } catch (err) {
      return null;
    }
  }

  createTokenAccount(
    payer: PublicKey,
    associatedToken: PublicKey,
    owner: PublicKey,
    mint: PublicKey
  ): TransactionInstruction {
    return createAssociatedTokenAccountInstruction(
      payer,
      associatedToken,
      owner,
      mint,
      TOKEN_PROGRAM_ID
    );
  }

  createTransferCheckedInstruction(
    source: PublicKey,
    mint: PublicKey,
    destination: PublicKey,
    owner: PublicKey,
    amount: number,
    decimals: number
  ) {
    return createTransferCheckedInstruction(
      source,
      mint,
      destination,
      owner,
      amount,
      decimals
    );
  }
}
