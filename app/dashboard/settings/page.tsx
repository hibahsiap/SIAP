"use client";

import ButtonClick from "@/components/Button";
import CardChannel from "@/components/CardChannel";
import SearchField from "@/components/SearchField";
import TableTemplate, { ColumnDefinition } from "@/components/TableTemplate";
import { formatActionCell, formatNameCell, formatRoleCell, TableRowData } from "@/constants/tableFormats";
import { MessageSquare, PlusIcon } from "lucide-react";
import { FaFacebook, FaInstagram, FaWhatsapp } from "react-icons/fa";

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
    const handleDelete = (id: string) => console.log("Hapus User ID:", id);

    // Definisi Kolom khusus untuk halaman issue category
    const userColumns: ColumnDefinition<TableRowData>[] = [
        { header: "NO", key: "id" },
        { header: "CATEGORIES", key: "category" },
        { 
        header: "NAME OPD", 
        key: "name", 
        cell: (_, rowData) => formatNameCell(rowData) 
        },
        // { 
        // header: "ROLE", 
        // key: "role", 
        // cell: (value) => formatRoleCell(value) 
        // },
        { 
        header: "ACTIONS", 
        key: "actions", 
        className: "text-right",
        cell: (_, rowData) => formatActionCell(rowData, handleEdit, handleDelete)
        },
    ];

    // contoh
    const userData: TableRowData[] = [
        { id: "1", category: "kesehatan", name: "budi wahyudi"},
        { id: "2", category: "jalan raya", name: "tono sudibyo"},
        { id: "3", category: "keamanan lingkungan", name: "amal hidayah"},
    ];

    return (
        <div className="grid grid-rows-[120px_1fr] gap-2.5">
            {/* header page */}
            <div className="flex flex-col justify-center text-[#041942] gap-1.5 px-2 border-b border-black/10">
                <h1 className="font-bold text-3xl">Settings</h1>
                <p className="tracking-wide">Configure your account, channels, and preferences here</p>
            </div>

            {/* content */}
            <div className="p-2.5 flex flex-col gap-4">
                {/* channel management section */}
                <div className="rounded-[12px] overflow-hidden px-5 py-4 shadow-sm shadow-black/40 flex flex-col gap-2 bg-white">
                    <div className="flex flex-row items-center gap-3.5 text-[#041942]">
                        <MessageSquare size={40} />
                        <div className="flex flex-col gap-0.5">
                            <h2 className="text-2xl font-bold opacity-60">Channel Management</h2>
                            <p className="text-sm">Connect your communication channels</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
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
                        <div className="flex flex-row gap-2 w-[40%]">
                            <SearchField placeholder="Search" value="" onChange={() => {}} />
                            <ButtonClick name="add category" type="button" icon={<PlusIcon size={16}/>}/>
                        </div>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow-sm shadow-black/40 overflow-hidden">
                        <TableTemplate columns={userColumns} data={userData} />
                    </div>
                </div>
            </div>
        </div>
    )
}