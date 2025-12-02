import React, { useCallback, useState } from "react";
import { useWallet } from "@meshsdk/react";
import {
  applyCborEncoding,
  deserializeDatum,
  Data,
  PlutusScript,
  resolvePlutusScriptAddress,
  UTxO,
} from "@meshsdk/core";

import "@meshsdk/react/styles.css";

import { sendToScript, unlockFromScript } from "../_api/spendTx";
import { parseData, initializeBlockchainProvider } from "../_api/utils";

const blockchainProvider = initializeBlockchainProvider();

const Customized = () => {
  const { wallet, connected } = useWallet();
  const [scriptAddress, setAddress] = useState("");
  const [scriptUTxOs, setScriptUTxOs] = useState<UTxO[]>([]);
  const [cbor, setCbor] = useState("");
  const [cborEncoded, setCborEncoded] = useState("");
  const [datum, setDatum] = useState("");
  const [redeemer, setRedeemer] = useState("");
  const [lovelace, setLovelace] = useState("");
  const [error, setError] = useState("");
  const [datumType, setDatumType] = useState<"data" | "constructor">("data");
  const [redeemerType, setRedeemerType] = useState<"data" | "constructor">(
    "data",
  );
  const [globalMessage, setGlobalMessage] = useState<string | null>(null);
  const [loadingUTxOs, setLoadingUTxOs] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const MIN_LOVELACE = 1_000_000;

  const setLovelaceFromInput = (value: string) => {
    setGlobalMessage(null);

    if (!/^\d*$/.test(value)) {
      setLovelace(value);
      setError("Must be a Lovelace amount (numbers only).");
      return;
    }

    setLovelace(value);

    if (value && parseInt(value, 10) < MIN_LOVELACE) {
      setError("Amount must be greater than or equal to 1,000,000 lovelace.");
    } else {
      setError("");
    }
  };

  const setRedeemerFromInput = (value: string) => {
    setGlobalMessage(null);
    setRedeemer(value);
  };

  const setDatumFromInput = (value: string) => {
    setGlobalMessage(null);
    setDatum(value);
  };

  const obtenerAddress = useCallback(async (cborParameter: string) => {
    try {
      setLoadingUTxOs(true);
      setGlobalMessage(null);

      const encoded = applyCborEncoding(cborParameter);

      const script: PlutusScript = {
        version: "V3",
        code: encoded,
      };

      const scriptAddr = resolvePlutusScriptAddress(script, 0);
      const UTxOs = await blockchainProvider.fetchAddressUTxOs(scriptAddr);

      setAddress(scriptAddr);
      setScriptUTxOs(UTxOs);
      setCborEncoded(encoded);
      setCbor(cborParameter);
      setGlobalMessage("Script and UTxOs updated successfully.");
    } catch (err) {
      console.error(err);
      setGlobalMessage(
        "Could not resolve script address or load UTxOs. Check the CBOR.",
      );
    } finally {
      setLoadingUTxOs(false);
    }
  }, []);

  const setCborFromTextarea = async (
    event: React.ClipboardEvent<HTMLTextAreaElement>,
  ) => {
    event.preventDefault();
    const pastedData = event.clipboardData.getData("text");
    event.currentTarget.value += pastedData;
    await obtenerAddress(pastedData);
  };

  const reload = async () => {
    if (!cbor) {
      setGlobalMessage("Paste the script CBOR code first.");
      return;
    }
    await obtenerAddress(cbor);
  };

  const bloquear = async () => {
    if (!connected || !wallet) {
      setGlobalMessage("Connect your wallet to continue.");
      return;
    }

    if (!lovelace || !!error || !datum || !scriptAddress) {
      setGlobalMessage(
        "Check the lovelace amount, the datum, and that the script is valid.",
      );
      return;
    }

    try {
      setSubmitting(true);
      setGlobalMessage(null);

      if (datumType === "constructor") {
        const parsed: Data = parseData(JSON.parse(datum));
        await sendToScript(wallet, scriptAddress, lovelace, parsed);
      } else {
        await sendToScript(wallet, scriptAddress, lovelace, datum);
      }

      setGlobalMessage("Transaction submitted to lock ADAs.");
      await reload();
    } catch (err) {
      console.error(err);
      setGlobalMessage(
        "Data error. Make sure the datum is valid for the selected type.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const desbloquearDesdeScript = async (txHash: string, index: number) => {
    if (!connected || !wallet) {
      setGlobalMessage("Connect your wallet to continue.");
      return;
    }

    if (!redeemer) {
      setGlobalMessage("Specify a redeemer before unlocking.");
      return;
    }

    try {
      setSubmitting(true);
      setGlobalMessage(null);

      if (redeemerType === "constructor") {
        await unlockFromScript(
          wallet,
          cborEncoded,
          txHash,
          index,
          JSON.parse(redeemer),
        );
      } else {
        await unlockFromScript(wallet, cborEncoded, txHash, index, redeemer);
      }

      setGlobalMessage("Transaction submitted to unlock ADAs.");
      await reload();
    } catch (err) {
      console.error(err);
      setGlobalMessage("Could not build or submit the unlock transaction.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#05070B] text-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col px-4 pb-10 pt-6">
        <section className="mb-6 rounded-2xl border border-[#2A3140] bg-[#0D1117] p-4 shadow-lg">
          <p className="mb-3 text-center text-xs font-semibold uppercase tracking-wide text-customTextMuted">
            Script address
          </p>
          <p className="mb-4 break-all rounded-md bg-[#161B22] px-3 py-2 text-xs md:text-sm">
            {scriptAddress
              ? scriptAddress
              : "Paste the script CBOR code to get the address."}
          </p>

          <div className="flex flex-col space-y-3">
            <label className="text-xs text-customTextMuted">Script CBOR</label>
            <textarea
              className="min-h-[80px] w-full rounded-lg border border-[#2A3140] bg-[#161B22]
             p-3 text-xs text-white outline-none 
             focus:border-[#0A5AFF] focus:ring-1 focus:ring-[#0A5AFF]"
              placeholder="Paste the script CBOR code here..."
              onPaste={setCborFromTextarea}
            />
          </div>
        </section>

        {globalMessage && (
          <div className="mb-4 rounded-xl border border-customBorder bg-black/40 px-4 py-3 text-sm text-customText">
            {globalMessage}
          </div>
        )}
        {error && (
          <div className="mb-4 rounded-xl border border-customDanger/40 bg-customDanger/10 px-4 py-2 text-xs text-customDanger">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-4 md:flex-row">
          <section className="flex-1 rounded-2xl border border-[#2A3140] bg-[#0D1117] p-4 shadow-lg">
            <p className="mb-4 text-center text-sm font-semibold text-customText">
              Lock ADAs
            </p>

            <div className="flex flex-col space-y-4">
              <div>
                <label className="mb-1 block text-xs text-customTextMuted">
                  Amount in lovelace
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1000000"
                  className="w-full rounded-lg border border-[#2A3140] bg-[#161B22]
           px-3 py-2 text-sm text-white outline-none 
           focus:border-[#0A5AFF] focus:ring-1 focus:ring-[#0A5AFF]"
                  onChange={(e) => setLovelaceFromInput(e.target.value)}
                />
              </div>

              <div>
                <p className="mb-2 text-xs text-customTextMuted">Datum type</p>
                <div className="flex flex-wrap gap-4 text-xs">
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      value="data"
                      checked={datumType === "data"}
                      onChange={() => setDatumType("data")}
                      className="h-3 w-3 accent-customPrimary"
                    />
                    <span>Data</span>
                  </label>
                  <label className="inline-flex items-center gap-2">
                    <input
                      type="radio"
                      value="constructor"
                      checked={datumType === "constructor"}
                      onChange={() => setDatumType("constructor")}
                      className="h-3 w-3 accent-customPrimary"
                    />
                    <span>Constructor</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs text-customTextMuted">
                  Datum
                </label>
                <input
                  type="text"
                  placeholder="Datum value"
                  className="w-full rounded-lg border border-[#2A3140] bg-[#161B22]
           px-3 py-2 text-sm text-white outline-none 
           focus:border-[#0A5AFF] focus:ring-1 focus:ring-[#0A5AFF]"
                  onChange={(e) => setDatumFromInput(e.target.value)}
                />
              </div>

              <button
                disabled={!connected || submitting}
                onClick={bloquear}
                className="inline-flex w-full items-center justify-center rounded-lg 
                           bg-customPrimary px-3 py-2 text-sm font-semibold text-white 
                           transition-colors duration-200 hover:bg-customPrimaryDark 
                           disabled:cursor-not-allowed disabled:bg-customBorder"
              >
                {submitting ? "Processing..." : "Lock ADAs"}
              </button>
            </div>
          </section>

          <section className="flex-1 rounded-2xl border border-[#2A3140] bg-[#0D1117] p-4 shadow-lg">
            <div className="mb-3 flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-customText">
                {scriptAddress
                  ? "UTxOs on script"
                  : "Paste the CBOR and reload to see UTxOs"}
              </p>
              <button
                onClick={reload}
                className="rounded-md border border-customPrimary/60 bg-transparent 
                           px-3 py-1 text-xs font-medium text-customPrimary 
                           hover:bg-customPrimary/10"
              >
                {loadingUTxOs ? "Refreshing..." : "Reload"}
              </button>
            </div>

            <div className="mt-2 max-h-60 space-y-2 overflow-y-auto pr-1 text-xs">
              {scriptUTxOs.length === 0 && !loadingUTxOs && (
                <p className="text-customTextMuted">
                  No UTxOs found for the current address.
                </p>
              )}

              {scriptUTxOs.map((item) => (
                <button
                  key={`${item.input.txHash}#${item.input.outputIndex}`}
                  className="flex w-full flex-col rounded-lg border border-customBorder 
                             bg-black/40 p-2 text-left hover:border-customPrimary 
                             hover:bg-black/60 disabled:opacity-50"
                  onClick={() =>
                    desbloquearDesdeScript(
                      item.input.txHash,
                      item.input.outputIndex,
                    )
                  }
                  disabled={!connected || submitting}
                >
                  {item.output.amount.map((asset) =>
                    asset.unit === "lovelace"
                      ? `Spend ${asset.quantity} lovelace ${
                          item.output.plutusData
                            ? JSON.stringify(
                                deserializeDatum(item.output.plutusData),
                                (_key, value) =>
                                  typeof value === "bigint"
                                    ? value.toString()
                                    : value,
                              )
                            : " (no datum)"
                        }`
                      : "",
                  )}
                </button>
              ))}
            </div>

            <div className="mt-4 border-t border-customBorder pt-4">
              <p className="mb-2 text-xs text-customTextMuted">
                Redeemer configuration
              </p>

              <div className="mb-3 flex flex-wrap gap-4 text-xs">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    value="data"
                    checked={redeemerType === "data"}
                    onChange={() => setRedeemerType("data")}
                    className="h-3 w-3 accent-customPrimary"
                  />
                  <span>Data</span>
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="radio"
                    value="constructor"
                    checked={redeemerType === "constructor"}
                    onChange={() => setRedeemerType("constructor")}
                    className="h-3 w-3 accent-customPrimary"
                  />
                  <span>Constructor</span>
                </label>
              </div>

              <input
                type="text"
                placeholder="Redeemer value"
                className="w-full rounded-lg border border-[#2A3140] bg-[#161B22]
           px-3 py-2 text-sm text-white outline-none 
                focus:border-[#0A5AFF] focus:ring-1 focus:ring-[#0A5AFF]"
                onChange={(e) => setRedeemerFromInput(e.target.value)}
              />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Customized;
