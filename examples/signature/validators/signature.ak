use aiken/collection/list
use aiken/crypto.{VerificationKeyHash}
use cardano/transaction.{OutputReference, Transaction}

validator signature {
  spend(
    datum: Option<VerificationKeyHash>,
    _redeemer: Data,
    _utxo: OutputReference,
    transaction: Transaction,
  ) {
    expect Some(beneficiary) = datum
    list.has(transaction.extra_signatories, beneficiary)
  }

  else(_) {
    fail
  }
}
