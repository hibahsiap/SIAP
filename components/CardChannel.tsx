"use client";

import { ElementType, useState } from "react";
import ButtonClick from "./Button";
import { AnimatePresence, motion } from "framer-motion";

interface CardChannelProps {
    icon: ElementType,
    title: string,
    status: boolean,
    account: string,
    account_id: string
}

const CardChannel = ({icon, title, status, account, account_id}: CardChannelProps) => {
    const Icon = icon;
   
    const [isConnected, setIsConnected] = useState(status)
    const toggleChannel = () => setIsConnected(!isConnected);

    // Mapping warna card
    const colorCard: Record< string, string> = {
        "whatsapp": "bg-[#F0FCF3]",
        "instagram": "bg-[#FAF5FF]",
        "facebook": "bg-[#E2F0FF]",
    };

    // Mapping warna card inside
    const colorCardInside: Record< string, string> = {
        "whatsapp": "bg-[#DCFBE7]",
        "instagram": "bg-[#F3E8FE]",
        "facebook": "bg-[#ABD1FD]/50",
    };

    // Mapping warna text card 
    const colorTextCard: Record< string, string> = {
        "whatsapp": "text-[#49724E]",
        "instagram": "text-[#876BA5]",
        "facebook": "text-[#7BADFF]",
    };

    // const height = isConnected ? "h-44" : "h-34";

    return (
        <motion.div
            initial={false}
            animate={{ height: isConnected ? 160 : 124 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className={`flex flex-col gap-2.5 p-4 overflow-hidden rounded-[15px] ${colorCard[title]} shadow-sm shadow-black/40`}>

            <div className="flex flex-row gap-1.5 items-center">
                <Icon size={20} className={`${colorTextCard[title]}`} />
                <p className="text-[#041942] font-bold text-sm capitalize tracking-wide">{title} Integration</p>
            </div>

            <motion.div 
                initial={false}
                animate={{ height: isConnected ? 96 : 60 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className={`${colorCardInside[title]} rounded-lg p-3 flex flex-row items-center justify-between`}>

                {/* 2. ANIMASI ISI KONTEN (Fade-in / Fade-out) */}
                <AnimatePresence mode="wait"> 
                {isConnected ? (
                    // Konten saat Connected
                    <motion.div
                    key="connected" // Key unik wajib ada agar AnimatePresence bekerja
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-full flex flex-row items-center justify-between"
                    >
                    <div className={`flex gap-1 flex-col ${colorTextCard[title]}`}>
                        <p className="font-semibold text-sm capitalize">{title} Connected</p>
                        {/* <p>{status}</p> */}
                        <p className="text-[12px]">Account: {account}</p>
                        <p className="text-[12px]">ID: {account_id}</p>
                    </div>
                    <div className="w-24">
                        <ButtonClick
                        onClick={toggleChannel}
                        name="Disconnect"
                        type="button"
                        className="bg-red-500 text-white font-semibold"
                        />
                    </div>
                    </motion.div>
                ) : (
                    // Konten saat Disconnected
                    <motion.div
                    key="disconnected" // Key unik wajib ada
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="w-full flex flex-row items-center justify-between"
                    >
                    <div className={`flex gap-0.5 flex-col ${colorTextCard[title]}`}>
                        <p className="font-semibold text-sm">Connect your channel</p>
                    </div>
                    <div className="w-24">
                        <ButtonClick
                        onClick={toggleChannel}
                        name="Connect"
                        type="button"
                        className="bg-white text-[#041942] border-2 border-[#d2d2d2] font-semibold"
                        />
                    </div>
                    </motion.div>
                )}
                </AnimatePresence>
            </motion.div>
        </motion.div>
    )
}

export default CardChannel;