"use client";

import { ElementType, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ChannelData {
  id: string;
  platform: string;
  accountHandle: string | null;
  accountId: string | null;
  isActive: boolean;
}

interface CardChannelProps {
  icon: ElementType;
  data: ChannelData;
  onDisconnect: (platform: string) => Promise<void>;
}

const colorCard: Record<string, string> = {
  WHATSAPP: "bg-[#F0FCF3]",
  INSTAGRAM: "bg-[#FAF5FF]",
  FACEBOOK: "bg-[#E2F0FF]",
};

const colorCardInside: Record<string, string> = {
  WHATSAPP: "bg-[#DCFBE7]",
  INSTAGRAM: "bg-[#F3E8FE]",
  FACEBOOK: "bg-[#ABD1FD]/50",
};

const colorText: Record<string, string> = {
  WHATSAPP: "text-[#49724E]",
  INSTAGRAM: "text-[#876BA5]",
  FACEBOOK: "text-[#7BADFF]",
};

const platformLabel: Record<string, string> = {
  WHATSAPP: "WhatsApp",
  INSTAGRAM: "Instagram",
  FACEBOOK: "Facebook",
};

const CardChannel = ({ icon, data, onDisconnect }: CardChannelProps) => {
  const Icon = icon;
  const [loading, setLoading] = useState(false);
  const platform = data.platform;

  const handleConnect = () => {
    if (platform === "INSTAGRAM") {
      const oauthUrl = process.env.NEXT_PUBLIC_INSTAGRAM_OAUTH_URL;
      if (oauthUrl) window.location.href = oauthUrl;
    } else {
      toast.info(`${platformLabel[platform]} integration coming soon`);
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    try {
      await onDisconnect(platform);
      toast.success(`${platformLabel[platform]} disconnected`);
    } catch {
      toast.error("Failed to disconnect");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={false}
      animate={{ height: data.isActive ? 160 : 124 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className={`flex flex-col gap-2.5 p-4 overflow-hidden rounded-[15px] ${colorCard[platform]} shadow-sm shadow-black/40`}
    >
      <div className="flex flex-row gap-1.5 items-center">
        <Icon size={20} className={colorText[platform]} />
        <p className="text-[#041942] font-bold text-sm tracking-wide capitalize">
          {platformLabel[platform]} Integration
        </p>
      </div>

      <motion.div
        initial={false}
        animate={{ height: data.isActive ? 96 : 60 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
        className={`${colorCardInside[platform]} rounded-lg p-3 flex flex-row items-center justify-between`}
      >
        <AnimatePresence mode="wait">
          {data.isActive ? (
            <motion.div
              key="connected"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full flex flex-row items-center justify-between"
            >
              <div className={`flex flex-col gap-1 ${colorText[platform]}`}>
                <p className="font-semibold text-sm capitalize">{platformLabel[platform]} Connected</p>
                {data.accountHandle && <p className="text-[12px]">Account: {data.accountHandle}</p>}
                {data.accountId && <p className="text-[12px]">ID: {data.accountId}</p>}
              </div>
              <div className="w-24">
                <button
                  onClick={handleDisconnect}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-1 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-md transition-colors disabled:opacity-50"
                >
                  {loading && <Loader2 size={12} className="animate-spin" />}
                  Disconnect
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="disconnected"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full flex flex-row items-center justify-between"
            >
              <p className={`font-semibold text-sm ${colorText[platform]}`}>
                Connect your channel
              </p>
              <div className="w-24">
                <button
                  onClick={handleConnect}
                  className="w-full py-1.5 bg-white text-[#041942] border-2 border-[#d2d2d2] text-xs font-semibold rounded-md hover:bg-gray-50 transition-colors"
                >
                  Connect
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default CardChannel;
