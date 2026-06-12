"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import CardChannel from "@/components/CardChannel";
import WhatsAppConnectModal from "@/components/WhatsAppConnectModal";
import CategoryModal from "@/components/CategoryModal";
import DeleteModal from "@/components/DeleteModal";
import EmptyState from "@/components/EmptyState";
import SearchEmptyState from "@/components/SearchEmpty";
import TableTemplate, { ColumnDefinition } from "@/components/TableTemplate";
import { Input } from "@/components/ui/input";
import { formatNameCell, TableRowData } from "@/constants/tableFormats";
import { MessageSquare, Pencil, PlusIcon, Search, Trash2 } from "lucide-react";
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
    const [whatsappModalOpen, setWhatsappModalOpen] = useState(false);

    const fetchChannels = useCallback(async () => {
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
        void (async () => {
            await Promise.all([fetchChannels(), fetchCategories()]);
        })();
    }, [fetchChannels, fetchCategories]);

    const handleDisconnect = async (platform: string) => {
        const res = await fetch(`/api/channel/${platform.toLowerCase()}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ isActive: false, accountHandle: null, accountId: null, accessToken: null }),
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

    const handleConnect = (platform: string) => {
        if (platform === "WHATSAPP") setWhatsappModalOpen(true);
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
            className: "text-center pr-8 w-[150px]",
            cell: (_, rowData) => (
                <div className="flex justify-center gap-2 text-gray-400">
                    <button onClick={() => handleEditCategory((rowData as TableRowData).id)} className="p-2 hover:bg-gray-100 rounded-md hover:text-[#14234b] transition-all">
                        <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteCategory((rowData as TableRowData).id)} className="p-2 hover:bg-red-50 rounded-md hover:text-red-600 transition-all">
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            ),
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
                <div className="rounded-[12px] overflow-hidden p-4 shadow-sm shadow-black/40 flex flex-col gap-2 bg-white">
                    <div className="flex flex-row items-center gap-3.5 text-[#041942]">
                        <MessageSquare size={36} />
                        <div className="flex flex-col gap-0.5">
                            <h2 className="text-2xl font-bold">Channel Management</h2>
                            <p className="text-sm">Connect your communication channels</p>
                        </div>
                    </div>

                    {loadingChannels ? (
                        <div className="py-6 text-center text-gray-400 text-sm">Loading channels...</div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4 pt-2">
                            {channels.map((channel) => {
                                const Icon = CHANNEL_ICONS[channel.platform] ?? FaWhatsapp;
                                return (
                                    <CardChannel
                                        key={channel.id}
                                        icon={Icon}
                                        data={channel}
                                        onDisconnect={handleDisconnect}
                                        onConnect={handleConnect}
                                    />
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Issue Categories */}
                <div className=" flex flex-col gap-4">
                    <div className="flex flex-row justify-between items-center">
                        <h2 className="font-bold text-2xl text-[#041942]">Issue Categories</h2>
                        <div className="grid grid-cols-2 gap-2 w-[40%]">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <Input
                                    placeholder="Search"
                                    value={categorySearch}
                                    onChange={(e) => setCategorySearch(e.target.value)}
                                    className="pl-9 w-full border-[#D2D2D2] bg-white focus:bg-white focus:border-[#1D2F58] rounded-md h-10 text-sm transition-all"
                                />
                            </div>
                            <ButtonClick
                                name="add category"
                                type="button"
                                icon={<PlusIcon size={16} />}
                                onClick={() => { setEditCategory(null); setCategoryModalOpen(true); }}
                            />
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow-sm shadow-black/40 overflow-hidden">
                        <div className="w-full">
                            {filteredCategories.length > 0 ? (
                                <TableTemplate columns={categoryColumns} data={categoryData} />
                            ) : categorySearch !== "" ? (
                                <SearchEmptyState type="category" searchQuery={categorySearch} />
                            ) : (
                                <EmptyState
                                    title="No Category found"
                                    description={<>There is currently no data available. <br /> Please add new data to see it displayed here.</>}
                                />
                            )}
                        </div>
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

            <WhatsAppConnectModal
                isOpen={whatsappModalOpen}
                onClose={() => setWhatsappModalOpen(false)}
                onConnected={fetchChannels}
            />
        </div>
    );
}