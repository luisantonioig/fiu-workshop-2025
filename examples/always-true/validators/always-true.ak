use cardano/transaction.{OutputReference, Transaction}

validator alwaysTrue {
  spend(
    _datum: Option<Data>,
    _redeemer: Data,
    _policy_id: OutputReference,
    _self: Transaction,
  ) {
    True
  }

  else(_) {
    fail
  }
}
