import { Connection, Finality, TransactionResponse, TransactionSignature } from '@solana/web3.js';
import { ValidateTransferError, ValidateTransferFields } from '@solana/pay';

export async function validateTransfer(
    connection: Connection,
    signature: TransactionSignature,
    { recipient, amount, splToken, reference, memo }: ValidateTransferFields,
    options?: { commitment?: Finality }
): Promise<TransactionResponse> {
    const response = await connection.getTransaction(signature, options);
    if (!response) throw new ValidateTransferError('not found');

    const message = response.transaction.message;
    const meta = response.meta;
    if (!meta) throw new ValidateTransferError('missing meta');
    if (meta.err) throw meta.err;

    if (reference) {
        if (!Array.isArray(reference)) {
            reference = [reference];
        }

        for (const pubkey of reference) {
            if (!message.accountKeys.some((accountKey) => accountKey.equals(pubkey)))
                throw new ValidateTransferError('reference not found');
        }
    }

    return response;
}
