import { Request, Response, NextFunction } from "express";

type Route<T> = (
  req: Request,
  res: Response,
  next: NextFunction
) => T | Promise<T>;

export function asyncRoute<T>(route: Route<T>) {
  return (req, res, next) => {
    Promise.resolve(route(req, res, next))
      .then((payload) => res.send(payload))
      .catch((err) => next(err));
  };
}
