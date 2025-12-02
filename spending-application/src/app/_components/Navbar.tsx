import { CardanoWallet } from "@meshsdk/react";
import { PubKeyHash } from "./PubKeyHash";

export const Navbar = () => {
  return (
    <nav className="border-b border-[#2A3140] bg-[#05070B]">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center space-x-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0A5AFF]">
            <span className="text-lg font-semibold text-white">₳</span>
          </div>
          <div className="flex flex-col">
            <span className="text-base font-semibold text-white">
              Spending Application
            </span>
          </div>
        </div>

        <div className="hidden flex-1 justify-center md:flex">
          <PubKeyHash />
        </div>

        <div className="flex items-center gap-3">
          <div className="text-sm text-[#E6E9EF]">
            <CardanoWallet isDark={true} />
          </div>
        </div>
      </div>
    </nav>
  );
};
