interface ButtonClickProps {
    name: string,
    type?: "submit" | "reset" | "button",
    className?: string,
    disabled?: boolean
}

const ButtonClick = ({name, type = "submit", className="", disabled}: ButtonClickProps) => {
    return (
        <button 
            type={type}
            disabled={disabled} 
            className={`bg-linear-to-br from-[#1D2F58] to-[#041942] rounded-lg w-full text-white font-medium text-[10px] tracking-widest uppercase py-3 disabled:bg-gray-400 disabled:cursor-not-allowed ${className}`}
        >
            {name}
        </button>
    )
}

export default ButtonClick;