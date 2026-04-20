"use client";

import CardChannel from "@/components/CardChannel";
import { MessageSquare } from "lucide-react";
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
    return (
        <div className="grid grid-rows-[120px_1fr] gap-2.5">
            <div className="flex flex-col justify-center text-[#041942] gap-1.5 px-2 border-b border-black/10">
                <h1 className="font-bold text-3xl ">Settings</h1>
                <p className="tracking-wide">Configure your account, channels, and preferences here</p>
            </div>
            <div className="p-2.5">
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
            </div>
        </div>
    )
}