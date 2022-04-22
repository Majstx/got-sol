import { NextFunction, Request, Response } from "express";
import { TransactionService } from "../services/TransactionService";

export class TransactionController {
  constructor(private readonly transactionService: TransactionService) {}

  async splitPay(req: Request, res: Response, next: NextFunction) {
    try {
      const tx = await this.transactionService.splitPay();

      res.json({
        transaction: tx.serialize().toString("base64"),
      });
    } catch (e) {
      next(e);
    }
  }
}
