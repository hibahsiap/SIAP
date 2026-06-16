
interface ButtonClickProps {
    name: string,
    type?: "submit" | "reset" | "button",
    className?: string,
    disabled?: boolean,
    onClick?: () => void,
    icon?: React.ReactNode,
}

const ButtonClick = ({name, type = "submit", className="", disabled, onClick, icon}: ButtonClickProps) => {
    const buttonStyle = className ? className : "bg-linear-to-br from-[#1D2F58] to-[#041942] text-white font-medium"
    // const Icon = icon;
    return (
        <button 
            type={type}
            disabled={disabled} 
            onClick={onClick}
            className={` rounded-lg w-full text-[10px] 2xl:text-xs tracking-widest uppercase py-3 2xl:py-4 disabled:bg-gray-400 disabled:cursor-not-allowed ${buttonStyle} flex items-center justify-center gap-1`}
        >
            {icon && icon}
            {name}
        </button>
    )
}

export default ButtonClick;