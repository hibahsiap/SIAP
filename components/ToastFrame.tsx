"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import ButtonClick from "./Button";

interface ToastFrameProps {
    isSuccess: boolean,
    id?: string,
    name?: string,
    process?: 'created' | 'updated' | 'deleted' | 'forwarded'
}

const ToastFrame = ({isSuccess, id, name,  process}: ToastFrameProps) => {
    useEffect(() => {
        toast.dismiss();
        if (isSuccess) {
            toast.custom((t) => (
                <div className="bg-white flex flex-col w-100 shadow-2xl shadow-black/40 rounded-[16px] overflow-hidden">
                    <div className="bg-[#14BD89] w-full h-2"></div>
                    <div className="px-4 py-8 flex flex-col gap-6 justify-center items-center h-full">
                        <CheckCircle2 strokeWidth={0.5} size={144} className="text-[#14BD89] font-light"/>
                        <h4 className="text-[#041942] font-bold text-xl">Progress Updated</h4>
                        <p className="text-[#969696] text-center text-sm">Your <b>{id}-{name}</b> has been {process} successfully.</p>
                        {/* <div className="w-50">
                            <ButtonClick name="continue" type="button"/>
                        </div> */}
                    </div>
                </div>
            ), {
                duration: 2500,
                position: 'top-center',
            });
        } else {
            toast.custom((t) => (
                <div className="bg-white flex flex-col w-100 shadow-2xl shadow-black/40 rounded-[16px] overflow-hidden">
                    <div className="bg-[#C41825] w-full h-2"></div>
                    <div className="px-4 py-8 flex flex-col gap-6 justify-center items-center h-full">
                        <XCircle strokeWidth={0.5} size={144} className="text-[#C41825] font-light"/>
                        <h4 className="text-[#041942] font-bold text-xl">An error has occured</h4>
                        <p className="text-[#AEAEAE] text-center text-sm">We couldn&apos;t process your request right now.<br />Please try again or contact support if the issue persists.</p>
                        {/* <div className="w-50">
                            <ButtonClick name="try again" type="button"/>
                        </div> */}
                    </div>
                </div>
            ), {
                duration: 2500,
                position: 'top-center',
            });
        }
    }, [isSuccess, id, process]);
    return null;
}

export default ToastFrame;