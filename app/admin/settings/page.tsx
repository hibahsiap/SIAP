"use client";

import ButtonClick from "@/components/Button";
import CardChannel from "@/components/CardChannel";
import CategoryModals from "@/components/CategoryModal";
import DeleteModal from "@/components/DeleteModal";
import EmptyState from "@/components/EmptyState";
import SearchEmptyState from "@/components/SearchEmpty";
import SearchField from "@/components/SearchField";
import TableTemplate, { ColumnDefinition } from "@/components/TableTemplate";
import { Input } from "@/components/ui/input";
import { formatActionCell, formatNameCell, TableRowData } from "@/constants/tableFormats";
import { useUserStore } from "@/store/useUserStore";
import { MessageSquare, Pencil, PlusIcon, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { FaFacebook, FaInstagram, FaWhatsapp } from "react-icons/fa";
import { toast } from "sonner";

const channels = [
    {
        icon: FaWhatsapp,
        title: "whatsapp",
        status: true,
        account: "+62 820-7568-3908",
        account_id: "927520968192725086"
    },
    {
        icon: FaInstagram,
        title: "instagram",
        status: true,
        account: "@siap_id",
        account_id: "927520968192725086"
    },
    {
        icon: FaFacebook,
        title: "facebook",
        status: false,
        account: "Sahabat Diskominfo",
        account_id: "927520968192725086"
    }
]

export default function Settings() {

    const handleEdit = (id: string) => console.log("Edit User ID:", id);
    
    const handleDelete = async () => {
        if (!selectedUser) return
        try {
        await deleteUser(selectedUser.id)
        toast.success("Category deleted successfully")
        } catch {
        toast.error("Failed to delete category")
        } finally {
        closeDeleteModal()
        }
    }

    const {
        users, isLoading, fetchUsers, deleteUser,
        openEditModal, openAddModal,
        isDeleteModalOpen, closeDeleteModal, selectedUser, openDeleteModal,
      } = useUserStore()

    // Definisi Kolom khusus untuk halaman issue category
    const categoryColumns: ColumnDefinition[] = useMemo(() => [
        { header: "NO", key: "id" },
        { header: "CATEGORIES", key: "category" },
        { 
            header: "NAME OPD", 
            key: "name", 
            cell: (_, rowData) => formatNameCell(rowData as TableRowData) 
        },
        { 
            header: "ACTIONS", 
            key: "actions", 
            className: "text-center pr-8 w-[150px]",
            // cell: (_, rowData) => formatActionCell(rowData as TableRowData, handleEdit, handleDelete)
            cell: (_, row) => (
                <div className="flex justify-center gap-2 text-gray-400">
                    <button onClick={() => openEditModal(row as User)} className="p-2 hover:bg-gray-100 rounded-md hover:text-[#14234b] transition-all">
                    <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => openDeleteModal(row as User)} className="p-2 hover:bg-red-50 rounded-md hover:text-red-600 transition-all">
                    <Trash2 className="w-4 h-4" />
                    </button>
                </div>
                ),
        },
    ], [openEditModal, openDeleteModal]);

    // contoh
    const categoryData: TableRowData[] = [
        { id: "1", category: "kesehatan", name: "Dinas Kesehatan"},
        { id: "2", category: "jalan raya", name: "Dinas Pekerjaan Umum"},
        { id: "3", category: "keamanan lingkungan", name: "Dinas Lingkungan"},
        { id: "4", category: "pendidikan masyarakat", name: "Dinas Pendidikan"},
        { id: "5", category: "bantuan pangan", name: "Dinas Pangan"},
        { id: "6", category: "lingkungan layak", name: "Dinas Lingkungan"},
    ];

    const [searchQuery, setSearchQuery] = useState("")
    
    const filteredCategories = useMemo(() => {
        return categoryData.filter((item) =>
            (item.category || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
            (item.name || "").toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [searchQuery, categoryData]);

    return (
        <div className="grid grid-rows-[100px_1fr] gap-2.5 p-2">
            {/* header page */}
            <div className="flex flex-col justify-center text-[#041942] gap-1.5 px-2 border-b border-black/10">
                <h1 className="font-bold text-3xl">Settings</h1>
                <p className="tracking-wide">Configure your account, channels, and preferences here</p>
            </div>

            {/* content */}
            <div className="p-2.5 flex flex-col gap-4">
                {/* channel management section */}
                <div className="rounded-[12px] overflow-hidden p-4 shadow-sm shadow-black/40 flex flex-col gap-2 bg-white">
                    <div className="flex flex-row items-center gap-3.5 text-[#041942]">
                        <MessageSquare size={36} />
                        <div className="flex flex-col gap-0.5">
                            <h2 className="text-2xl font-bold">Channel Management</h2>
                            <p className="text-sm">Connect your communication channels</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-2">
                        {channels.map((channel, index) => {
                            return (
                                <CardChannel
                                    key={index}
                                    icon={channel.icon}
                                    title={channel.title}
                                    status={channel.status}
                                    account={channel.account}
                                    account_id={channel.account_id}
                                />
                            )
                        })}
                    </div>
                </div>

                {/* issue categories */}
                <div className=" flex flex-col gap-4">
                    <div className="flex flex-row justify-between items-center">
                        <h2 className="font-bold text-2xl text-[#041942]">Issue Categories</h2>
                        <div className="grid grid-cols-2 gap-2 w-[40%]">
                            {/* <SearchField placeholder="Search" value="" onChange={() => {}}/> */}
                            
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                <Input
                                    placeholder="Search"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-9 w-full border-[#D2D2D2] bg-white focus:bg-white focus:border-[#1D2F58] rounded-md h-10 text-sm transition-all"
                                />
                            </div>
                            
                            <ButtonClick onClick={openAddModal} name="add category" type="button" icon={<PlusIcon size={16}/>}/>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow-sm shadow-black/40 overflow-hidden">
                        {/* <TableTemplate columns={categoryColumns} data={categoryData} /> */}

                        <div className="w-full">
                            {isLoading ? (
                                <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">Loading...</div>
                            ) : filteredCategories.length > 0 ? (
                                <TableTemplate columns={categoryColumns} data={filteredCategories as any}/>
                            ) : searchQuery !== "" ? (
                                <SearchEmptyState type="category" searchQuery={searchQuery} />
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

            <CategoryModals />
            <DeleteModal
                isOpen={isDeleteModalOpen}
                onClose={closeDeleteModal}
                onConfirm={handleDelete}
                itemName="category"
            />
        </div>
    )
}