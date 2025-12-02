import { useCallback, useEffect, useState } from "react";
import { useWallet } from "@meshsdk/react";
import type { IWallet } from "@meshsdk/core";
import { deserializeAddress } from "@meshsdk/core";

const getPKH = async (wallet: IWallet | null) => {
  if (!wallet) return "";
  const addr = await wallet.getChangeAddress();
  const { pubKeyHash } = deserializeAddress(addr);
  return pubKeyHash;
};

export const PubKeyHash = () => {
  const { wallet, connected } = useWallet();
  const [pubKeyHash, setPubKeyHash] = useState("");
  const [loading, setLoading] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState<null | string>(null);
  const [error, setError] = useState<null | string>(null);

  const handleCopy = useCallback(() => {
    if (!pubKeyHash) return;

    navigator.clipboard
      .writeText(pubKeyHash)
      .then(() => {
        setCopyFeedback("Public key copied");
        setTimeout(() => setCopyFeedback(null), 1800);
      })
      .catch((err) => {
        console.error("Error copying to clipboard:", err);
        setCopyFeedback("Could not copy");
        setTimeout(() => setCopyFeedback(null), 1800);
      });
  }, [pubKeyHash]);

  useEffect(() => {
    if (!connected || !wallet) {
      setPubKeyHash("");
      return;
    }

    setLoading(true);
    setError(null);

    getPKH(wallet)
      .then((res) => setPubKeyHash(res))
      .catch((err) => {
        console.error(err);
        setError("Could not obtain public key.");
      })
      .finally(() => setLoading(false));
  }, [connected, wallet]);

  if (!connected) {
    return (
      <span className="text-[#8B9EB6] text-sm md:text-base">
        Connect your wallet
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="group relative inline-flex max-w-full items-center gap-2 rounded-full 
                 border border-[#2A3140] bg-[#0D1117] px-4 py-1.5 text-left text-xs md:text-sm 
                 font-light text-[#E6E9EF] transition-colors duration-200 
                 hover:border-[#0A5AFF] hover:bg-[#161B22]"
    >
      <span className="truncate font-mono">
        {loading ? "Fetching public key..." : pubKeyHash}
      </span>

      <span
        aria-hidden
        className="text-xs md:text-sm opacity-75 group-hover:opacity-100"
      >
        📋
      </span>

      {copyFeedback && (
        <span
          className="pointer-events-none absolute -bottom-8 left-1/2 z-10 
                     w-max -translate-x-1/2 rounded-md bg-black/80 
                     px-2 py-1 text-[11px] text-white shadow-lg"
        >
          {copyFeedback}
        </span>
      )}

      {error && <span className="sr-only">{error}</span>}
    </button>
  );
};
