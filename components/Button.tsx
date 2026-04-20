interface ButtonClickProps {
    name: string,
    type?: "submit" | "reset" | "button",
    className?: string,
    disabled?: boolean,
    onClick?: () => void
}

const ButtonClick = ({name, type = "submit", className="", disabled, onClick}: ButtonClickProps) => {
    const buttonStyle = className ? className : "bg-linear-to-br from-[#1D2F58] to-[#041942] text-white font-medium"
    return (
        <button 
            type={type}
            disabled={disabled} 
            onClick={onClick}
            className={` rounded-lg w-full text-[10px] tracking-widest uppercase py-3 disabled:bg-gray-400 disabled:cursor-not-allowed ${buttonStyle}`}
        >
            {name}
        </button>
    )
}

export default ButtonClick;