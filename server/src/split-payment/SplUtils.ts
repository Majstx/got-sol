import {
  Account,
  getAccount,
  getAssociatedTokenAddress,
} from "@solana/spl-token";
import { Connection, PublicKey } from "@solana/web3.js";

export class SplUtils {
  constructor(private readonly connection: Connection) {}

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
}
