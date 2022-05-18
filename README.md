# Got SOL Digital Financial Transaction System!

## Installation instructions

1. Copy the environment variables file:
```shell
cp .env.example .env
```

2. Edit the `.env` file with the correct values, like addresses and keys

3. Install dependencies:
```shell
npm i
```

4. Check if the codebase works
```shell
npm test
```

5. Start the application
```shell
npm start
```

## Examples

Get metadata:

```shell
curl "https://api.gotsol.store/tx?amount=0.5&label=label&recipient=AbUV7m5KCcfYWM1sC9TMVZyPnXSBFTHS8QnKLwdJFj3x&spl-token=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
```

Get transaction:

```shell
curl --location --request POST 'https://api.gotsol.store/tx?amount=0.5&recipient=AbUV7m5KCcfYWM1sC9TMVZyPnXSBFTHS8QnKLwdJFj3x&spl-token=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&reference=BS2tfQjTxzCyDEf4oJVLqMGvqGTRbKbW3UYFtspnPZGi' \
--header 'Content-Type: application/json' \
--data-raw '{"account":"AorQX7369GgwrTLqANpfrS83GmdDTa8o2WJZyCfUbFji"}'
```
