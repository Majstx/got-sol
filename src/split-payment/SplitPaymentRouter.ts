import { Router } from "express";
import { SplitPaymentController } from "./SplitPaymentController";
import { asyncRoute } from "../http/async-route-handler";
import { injectable } from "tsyringe";

@injectable()
export class SplitPaymentRouter {
  private readonly router: Router;

  constructor(private readonly splitPaymentController: SplitPaymentController) {
    this.router = Router();
  }

  register(): Router {
    this.router.get("/", asyncRoute(this.splitPaymentController.requestMeta));

    this.router.post(
      "/",
      asyncRoute(
        this.splitPaymentController.splitPay.bind(this.splitPaymentController)
      )
    );

    return this.router;
  }
}
