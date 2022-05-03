export function asyncRoute(route) {
  return (req, res, next) => {
    Promise.resolve(route(req, res, next))
      .then((payload) => res.send(payload))
      .catch((err) => next(err));
  };
}
