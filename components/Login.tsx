import ButtonClick from "./Button";
import Field from "./Field";
import Image from "next/image";
import Link from "next/link";
import FieldPassword from "./FieldPassword";
import { IoPersonCircleOutline } from "react-icons/io5";

const field = 
  {
    title: 'Email',
    placeholder: "Enter your email"

  }

const Login = () => {
    return (
        // card login
        <div className="grid grid-cols-2 w-full max-w-246 h-120 items-center justify-between rounded-lg shadow-[#1d2f5879] shadow-2xl overflow-hidden">

            <div className="bg-linear-to-br from-[#1D2F58] to-[#041942] w-full h-full p-7 flex flex-col justify-between">
                <div className="flex flex-col gap-2">
                    <Image src={"/images/logo-siap.png"} alt={"logo_siap"} width={52} height={50}></Image>
                    <h1 className="capitalize font-bold text-xl tracking-wide">Sistem Informasi Aduan Publik</h1>
                    <p className="text-[#8697C7] text-xs font-light tracking-wide">Lorem ipsum dolor sit, amet consectetur adipisicing elit. Rem, id?</p>
                </div>
                <div className="py-5 uppercase border-t border-white/20 text-[10px] tracking-wider text-white/60">Authorized Access Only</div>
            </div>

            {/* form login */}
            <div className="bg-white flex flex-col items-center justify-center text-[#041942] p-7 gap-8 w-full h-full">
                <div className="flex flex-col gap-2">
                    <h1 className="text-[#041942] font-bold text-2xl tracking-wide">Login</h1>
                    <p className="text-[#75777F] text-xs font-light ">Please enter your credentials to access the portal dashboard.</p>
                </div>
                <div className="w-full flex-col flex gap-6">
                    <div className="flex flex-col gap-4 ">
                    <Field icon={<IoPersonCircleOutline size={13}/>} title={field.title} placeholder={field.placeholder} />

                    <FieldPassword title={"Password"} placeholder={"Enter your password"} setIcon={true} />
                    </div>
                    <ButtonClick name={"Login"} />
                </div>
                <div className="flex flex-col gap-1 text-center text-[10px] font-light text-[#75777F]">
                    <p>By logging in, you agree to the <Link href={'#'} className="underline font-medium text-[#546064]">Terms of Service</Link> and <Link href={'#'} className="underline font-medium text-[#546064]">Privacy Policy.</Link></p>
                    <p>© 2026 SIAP Portal Governance. All Rights Reserved.</p>
                </div>
            </div>
        </div>
    )
}

export default Login;