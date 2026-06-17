"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { IoPersonCircleOutline } from "react-icons/io5";
import { toast } from "sonner";
import ButtonClick from "./Button";
import Field from "./Field";
import FieldPassword from "./FieldPassword";

const field =
{
    title: 'Email',
    placeholder: "Enter your email"

}

const Login = () => {

    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        email: "admin@hibah.go.id",
        password: "admin123"
    });

    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const data = await res.json();
                setError(data.error ?? "Login failed");
                setLoading(false);
                return;
            }

            const data = await res.json();
            const userRole = data.user?.role

            // Simpan role agar bisa diakses di halaman NotFound)
            if (userRole) {
                localStorage.setItem("userRole", userRole);
            }
            
            if (userRole === "ADMIN") {
                router.push("admin/chat");
            } else {
                router.push("opd/inbox");
            }

        } catch {
            setError("An unexpected error occurred");
            setLoading(false);
        }
    };

    return (
        // card login
        <div className="grid grid-cols-2 w-full max-w-246 h-120 2xl:max-w-230 2xl:h-152 items-center justify-between rounded-lg shadow-[#1d2f5879] shadow-2xl overflow-hidden">

            <div className="bg-linear-to-br from-[#1D2F58] to-[#041942] w-full h-full p-7 2xl:p-9 flex flex-col justify-between">
                <div className="flex flex-col gap-2">
                    <Image src={"/images/logo-siap.png"} alt={"logo_siap"} width={52} height={50}></Image>
                    <h1 className="capitalize font-bold text-xl 2xl:text-2xl tracking-wide text-white">Sistem Informasi Aduan Publik</h1>
                    <p className="text-[#8697C7] text-xs 2xl:text-base font-light tracking-wide">Platform terintegrasi untuk menerima, mengelola, dan memantau aduan masyarakat secara cepat, transparan, dan akuntabel.</p>
                </div>
                <div className="py-5 uppercase border-t border-white/20 text-[10px] 2xl:text-xs tracking-wider text-white/60">Authorized Access Only</div>
            </div>

            {/* form login */}
            <div className="bg-white flex flex-col items-center justify-center text-[#041942] p-7 2xl:p-9 gap-8 w-full h-full">
                <div className="flex flex-col gap-2 w-full">
                    <h1 className="text-[#041942] font-bold text-2xl 2xl:text-3xl tracking-wide">Login</h1>
                    <p className="text-[#75777F] text-xs 2xl:text-base font-light ">Please enter your credentials to access the portal dashboard.</p>
                </div>
                {error && (
                    <p className="text-red-500 text-xs 2xl:text-sm text-center -mt-4">{error}</p>
                )}
                <form onSubmit={handleSubmit} className="w-full flex-col flex gap-6 2xl:gap-8">
                    <div className="flex flex-col gap-4 2xl:gap-6">
                        <Field
                            icon={<IoPersonCircleOutline size={13} />}
                            title="Email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />

                        <FieldPassword
                            title="Password"
                            placeholder="Enter your password"
                            setIcon={true}
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>
                    <ButtonClick name={loading ? "Processing..." : "Login"} disabled={loading} />
                </form>
                <div className="flex flex-col gap-1 text-center text-[10px] 2xl:text-xs font-light text-[#75777F]">
                    <p>By logging in, you agree to the <Link href={'#'} className="underline font-medium text-[#546064]">Terms of Service</Link> and <Link href={'#'} className="underline font-medium text-[#546064]">Privacy Policy.</Link></p>
                    <p>© 2026 SIAP Portal Governance. All Rights Reserved.</p>
                </div>
            </div>
        </div>
    )
}

export default Login;