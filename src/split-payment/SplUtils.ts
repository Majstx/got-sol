import {
  Account,
  createAssociatedTokenAccountInstruction,
  createTransferCheckedInstruction,
  getAccount,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { Connection, PublicKey, TransactionInstruction } from "@solana/web3.js";
import { inject, injectable, singleton } from "tsyringe";
import LRUCache from "lru-cache";

@injectable()
@singleton()
export class SplUtils {
  private readonly ataCache: LRUCache<string, PublicKey>;
  private readonly accountCache: LRUCache<string, Account>;

  constructor(@inject(Connection) private readonly connection: Connection) {
    this.ataCache = new LRUCache({ max: 64 });
    this.accountCache = new LRUCache({ max: 64 });
  }

  async getAssociatedTokenAddress(
    splToken: PublicKey,
    owner: PublicKey
  ): Promise<PublicKey> {
    const key = splToken.toString() + owner.toString();
    if (this.ataCache.has(key)) {
      return this.ataCache.get(key);
    }

    const ata = await getAssociatedTokenAddress(splToken, owner);
    this.ataCache.set(key, ata);

    return ata;
  }

  async getAccount(ata: PublicKey): Promise<Account | null> {
    const key = ata.toString();

    if (this.accountCache.has(key)) {
      return this.accountCache.get(key);
    }

    try {
      const acc = await getAccount(this.connection, ata);
      this.accountCache.set(key, acc);

      return acc;
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
