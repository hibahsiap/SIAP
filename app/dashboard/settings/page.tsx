"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ButtonClick from "@/components/Button";
import CardChannel from "@/components/CardChannel";
import SearchField from "@/components/SearchField";
import TableTemplate, { ColumnDefinition } from "@/components/TableTemplate";
import { formatActionCell, formatNameCell, TableRowData } from "@/constants/tableFormats";
import { MessageSquare, PlusIcon } from "lucide-react";
import { FaFacebook, FaInstagram, FaWhatsapp } from "react-icons/fa";
import { toast } from "sonner";

const CHANNEL_ICONS: Record<string, React.ElementType> = {
  WHATSAPP: FaWhatsapp,
  INSTAGRAM: FaInstagram,
  FACEBOOK: FaFacebook,
};

type ChannelData = {
  id: string;
  platform: string;
  accountHandle: string | null;
  accountId: string | null;
  isActive: boolean;
};

function OAuthNotifier() {
  const searchParams = useSearchParams();
  useEffect(() => {
    const success = searchParams.get("success");
    const error = searchParams.get("error");
    if (success === "instagram_connected") toast.success("Instagram connected successfully!");
    if (error === "oauth_denied") toast.error("Instagram connection was cancelled.");
    if (error === "oauth_failed") toast.error("Failed to connect Instagram. Please try again.");
  }, [searchParams]);
  return null;
}

export default function Settings() {
  const [channels, setChannels] = useState<ChannelData[]>([]);
  const [loadingChannels, setLoadingChannels] = useState(true);

  const fetchChannels = useCallback(async () => {
    setLoadingChannels(true);
    try {
      const res = await fetch("/api/channel");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setChannels(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load channels");
    } finally {
      setLoadingChannels(false);
    }
  }, []);

  useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);

  const handleDisconnect = async (platform: string) => {
    const res = await fetch(`/api/channel/${platform.toLowerCase()}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: false, accountHandle: null, accountId: null }),
    });
    if (!res.ok) throw new Error("Failed to disconnect");
    setChannels((prev) =>
      prev.map((c) =>
        c.platform === platform
          ? { ...c, isActive: false, accountHandle: null, accountId: null }
          : c
      )
    );
  };

  const handleEdit = (id: string) => console.log("Edit:", id);
  const handleDelete = (id: string) => console.log("Delete:", id);

  const userColumns: ColumnDefinition<TableRowData>[] = [
    { header: "NO", key: "id" },
    { header: "CATEGORIES", key: "category" },
    { header: "NAME OPD", key: "name", cell: (_, rowData) => formatNameCell(rowData) },
    {
      header: "ACTIONS",
      key: "actions",
      className: "text-right",
      cell: (_, rowData) => formatActionCell(rowData, handleEdit, handleDelete),
    },
  ];

  const userData: TableRowData[] = [
    { id: "1", category: "kesehatan", name: "budi wahyudi" },
    { id: "2", category: "jalan raya", name: "tono sudibyo" },
    { id: "3", category: "keamanan lingkungan", name: "amal hidayah" },
  ];

  return (
    <div className="grid grid-rows-[120px_1fr] gap-2.5">
      <Suspense fallback={null}>
        <OAuthNotifier />
      </Suspense>

      <div className="flex flex-col justify-center text-[#041942] gap-1.5 px-2 border-b border-black/10">
        <h1 className="font-bold text-3xl">Settings</h1>
        <p className="tracking-wide">Configure your account, channels, and preferences here</p>
      </div>

      <div className="p-2.5 flex flex-col gap-4">
        <div className="rounded-[12px] overflow-hidden px-5 py-4 shadow-sm shadow-black/40 flex flex-col gap-2 bg-white">
          <div className="flex flex-row items-center gap-3.5 text-[#041942]">
            <MessageSquare size={40} />
            <div className="flex flex-col gap-0.5">
              <h2 className="text-2xl font-bold opacity-60">Channel Management</h2>
              <p className="text-sm">Connect your communication channels</p>
            </div>
          </div>

          {loadingChannels ? (
            <div className="py-6 text-center text-gray-400 text-sm">Loading channels...</div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {channels.map((channel) => {
                const Icon = CHANNEL_ICONS[channel.platform] ?? FaWhatsapp;
                return (
                  <CardChannel
                    key={channel.id}
                    icon={Icon}
                    data={channel}
                    onDisconnect={handleDisconnect}
                  />
                );
              })}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-row justify-between items-center">
            <h2 className="font-bold text-2xl text-[#041942]">Issue Categories</h2>
            <div className="flex flex-row gap-2 w-[40%]">
              <SearchField placeholder="Search" value="" onChange={() => {}} />
              <ButtonClick name="add category" type="button" icon={<PlusIcon size={16} />} />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm shadow-black/40 overflow-hidden">
            <TableTemplate columns={userColumns} data={userData} />
          </div>
        </div>
      </div>
    </div>
  );
}
