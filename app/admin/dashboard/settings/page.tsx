"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import CardChannel from "@/components/CardChannel";
import CategoryModal from "@/components/CategoryModal";
import DeleteModal from "@/components/DeleteModal";
import SearchField from "@/components/SearchField";
import TableTemplate, { ColumnDefinition } from "@/components/TableTemplate";
import { formatActionCell, formatNameCell, TableRowData } from "@/constants/tableFormats";
import { MessageSquare, PlusIcon } from "lucide-react";
import { FaFacebook, FaInstagram, FaWhatsapp } from "react-icons/fa";
import { toast } from "sonner";
import ButtonClick from "@/components/Button";

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

type Category = {
  id: string;
  name: string;
  defaultOpdId: string | null;
  defaultOpd: { id: string; name: string } | null;
};

// Komponen terpisah agar useSearchParams punya Suspense boundary
function OAuthNotifier() {
  const searchParams = useSearchParams();
  useEffect(() => {
    const success = searchParams.get("success");
    const error = searchParams.get("error");
    if (success === "instagram_connected") toast.success("Instagram connected successfully!");
    if (error === "oauth_denied") toast.error("Instagram connection was cancelled.");
    if (error === "oauth_failed") toast.error("Failed to connect Instagram. Please try again.");
    if (error === "unauthorized") toast.error("Unauthorized.");
  }, [searchParams]);
  return null;
}

export default function Settings() {
  const [channels, setChannels] = useState<ChannelData[]>([]);
  const [loadingChannels, setLoadingChannels] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categorySearch, setCategorySearch] = useState("");
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<Category | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);

  const fetchChannels = useCallback(async () => {
    setLoadingChannels(true);
    try {
      const res = await fetch("/api/channel");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setChannels(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load channels:", err);
      toast.error("Failed to load channels");
    } finally {
      setLoadingChannels(false);
    }
  }, []);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch("/api/category");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load categories");
    }
  }, []);

  useEffect(() => {
    fetchChannels();
    fetchCategories();
  }, [fetchChannels, fetchCategories]);

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

  const handleEditCategory = (id: string) => {
    const cat = categories.find((c) => c.id === id);
    if (cat) { setEditCategory(cat); setCategoryModalOpen(true); }
  };

  const handleDeleteCategory = (id: string) => {
    const cat = categories.find((c) => c.id === id);
    if (cat) { setDeletingCategory(cat); setDeleteModalOpen(true); }
  };

  const confirmDelete = async () => {
    if (!deletingCategory) return;
    try {
      const res = await fetch(`/api/category/${deletingCategory.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Category deleted");
      setCategories((prev) => prev.filter((c) => c.id !== deletingCategory.id));
    } catch {
      toast.error("Failed to delete category");
    } finally {
      setDeleteModalOpen(false);
      setDeletingCategory(null);
    }
  };

  const filteredCategories = categories.filter((c) =>
    c.name.toLowerCase().includes(categorySearch.toLowerCase()) ||
    (c.defaultOpd?.name ?? "").toLowerCase().includes(categorySearch.toLowerCase())
  );

  const categoryColumns: ColumnDefinition[] = [
    { header: "NO", key: "no" },
    { header: "CATEGORIES", key: "category" },
    {
      header: "NAME OPD",
      key: "name",
      cell: (_, rowData) => formatNameCell(rowData as TableRowData),
    },
    {
      header: "ACTIONS",
      key: "actions",
      className: "text-center",
      cell: (_, rowData) =>
        formatActionCell(rowData as TableRowData, handleEditCategory, handleDeleteCategory),
    },
  ];

  const categoryData: TableRowData[] = filteredCategories.map((c, i) => ({
    id: c.id,
    no: String(i + 1),
    category: c.name,
    name: c.defaultOpd?.name ?? "—",
  }));

  return (
    <div className="grid grid-rows-[100px_1fr] gap-2.5 p-2">
      <Suspense fallback={null}>
        <OAuthNotifier />
      </Suspense>

      {/* Header */}
      <div className="flex flex-col justify-center text-[#041942] gap-1.5 px-2 border-b border-black/10">
        <h1 className="font-bold text-3xl">Settings</h1>
        <p className="tracking-wide">Configure your account, channels, and preferences here</p>
      </div>

      {/* Content */}
      <div className="p-2.5 flex flex-col gap-4">
        {/* Channel Management */}
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

        {/* Issue Categories */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-row justify-between items-center">
            <h2 className="font-bold text-2xl text-[#041942]">Issue Categories</h2>
            <div className="flex flex-row gap-2 w-[40%]">
              <SearchField placeholder="Search" value={categorySearch} onChange={setCategorySearch} />
              <ButtonClick
                name="add category"
                type="button"
                icon={<PlusIcon size={16} />}
                onClick={() => { setEditCategory(null); setCategoryModalOpen(true); }}
              />
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg shadow-sm shadow-black/40 overflow-hidden">
            <TableTemplate columns={categoryColumns} data={categoryData} />
          </div>
        </div>
      </div>

      <CategoryModal
        isOpen={categoryModalOpen}
        onClose={() => { setCategoryModalOpen(false); setEditCategory(null); }}
        onSaved={fetchCategories}
        editData={editCategory}
      />

      <DeleteModal
        isOpen={deleteModalOpen}
        onClose={() => { setDeleteModalOpen(false); setDeletingCategory(null); }}
        onConfirm={confirmDelete}
        itemName={deletingCategory?.name ?? "category"}
      />
    </div>
  );
}
