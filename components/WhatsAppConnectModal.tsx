"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CustomModal from "@/components/CustomModal";
import { toast } from "sonner";

const FormField = ({
  label,
  value,
  onChange,
  placeholder,
  hint,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  hint?: string;
  type?: string;
}) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{label}</label>
    <Input
      placeholder={placeholder}
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-gray-50 border-gray-200 text-gray-900 w-full"
    />
    {hint && <p className="text-[11px] text-gray-400 leading-snug">{hint}</p>}
  </div>
);

interface WhatsAppConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnected: () => void | Promise<void>;
}

export default function WhatsAppConnectModal({ isOpen, onClose, onConnected }: WhatsAppConnectModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [phoneNumberId, setPhoneNumberId] = useState("");
  const [accessToken, setAccessToken] = useState("");
  const [displayNumber, setDisplayNumber] = useState("");

  // Reset on close (event-driven) instead of in an effect, so all fields are
  // cleared for the next open without a setState-in-effect cascade.
  const handleClose = () => {
    setPhoneNumberId("");
    setAccessToken("");
    setDisplayNumber("");
    onClose();
  };

  const handleSubmit = async () => {
    if (!phoneNumberId.trim()) {
      toast.error("Phone Number ID is required");
      return;
    }
    if (!accessToken.trim()) {
      toast.error("Access Token is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/channel/whatsapp", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isActive: true,
          accountId: phoneNumberId.trim(),
          accessToken: accessToken.trim(),
          accountHandle: displayNumber.trim() || null,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to connect WhatsApp");
      }

      toast.success("WhatsApp connected successfully!");
      await onConnected();
      handleClose();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <CustomModal isOpen={isOpen} onClose={handleClose} title="Connect WhatsApp">
      <div className="space-y-5">
        <p className="text-xs text-gray-500 leading-relaxed">
          Enter the credentials from the Meta Developer Console (WhatsApp &gt; API Setup).
          Use a <span className="font-semibold">permanent access token</span> so the
          connection does not expire.
        </p>

        <FormField
          label="Phone Number ID"
          placeholder="e.g. 1099256999944739"
          value={phoneNumberId}
          onChange={setPhoneNumberId}
          hint="From WhatsApp > API Setup, below your registered number."
        />

        <FormField
          label="Access Token"
          placeholder="EAAG..."
          value={accessToken}
          onChange={setAccessToken}
          type="password"
          hint="Permanent token from a System User, or a temporary token for testing."
        />

        <FormField
          label="Display Number (optional)"
          placeholder="e.g. +62 857-2683-8746"
          value={displayNumber}
          onChange={setDisplayNumber}
          hint="Only shown on the channel card."
        />
      </div>

      <div className="flex gap-3 mt-6">
        <Button onClick={handleClose} variant="outline" className="flex-1 bg-gray-100 border-0 text-[#1a233a] font-bold" disabled={isSubmitting}>
          CANCEL
        </Button>
        <Button onClick={handleSubmit} className="flex-1 bg-[#1a233a] text-white font-bold" disabled={isSubmitting}>
          {isSubmitting ? "CONNECTING..." : "CONNECT"}
        </Button>
      </div>
    </CustomModal>
  );
}
