# Signature
In this example we will learn to lock and unlock ADA using a validator that only allows us to unlock funds if a predefined person signs the transaction.

To do that you have to follow the next steps:

## Create a validator that allows us to consume the UTxO only if the transaction is signed by a person defined in the Datum


1. Open the file `examples/signature/validators/signature.ak`
2. Verify that the content of the file looks like the following code:

```aiken
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
```

3. Compile the project running `aiken build` from the folder `examples/signature`

## Run the frontend server
1. Go to `spending-application/`
2. Run the command `npm install` (if you haven't done it)
3. Run the server `npm run dev`
4. Go to localhost:3000

## Lock ADAs
1. Copy the generated `compiledCode` found in the file `examples/signature/plutus.json`
2. Paste the copied code into the Frontend
3. Connect your wallet
4. Set up the collateral  
   (Open Lace → Click on your account → Go to settings → Click on **Collateral**, this will require signing a transaction)
5. Choose the number of ADAs you want to lock and the Datum you want to store. In this case, the Datum has to have the following format:

``` json
{
  "bytes": "<Public Key Hash of the beneficiary>"
}
```

6. Submit the transaction

## Unlock ADAs
1. With the code from `plutus.json` already copied, write a Redeemer in the text field. (In this case, any Redeemer is valid). Keep in mind that the beneficiary specified in the Datum must sign the transaction.
2. Click on any of the buttons representing the UTxOs
3. Sign the transaction
