import {Keyboard, Library} from "lucide-react";
import React from "react";

const ReferenceSection = ({activePanel, setActivePanel}) => {
    const toggleShortcuts = () => {
        setActivePanel(prevPanel => prevPanel === "shortcuts" ? null : "shortcuts");
    };

    const toggleLibrary = () => {
        setActivePanel(prevPanel => prevPanel === "library" ? null : "library");
    };

    const buttonStyle = (applyHoverFormatting) => {
        return `p-2 rounded-md flex items-center gap-2 text-sm transition-colors ${
            applyHoverFormatting
                ? "hover:bg-gray-100"
                : "bg-black text-white"
        }`
    }

    return <>
        <div className="ml-auto flex items-center gap-2">
            <button
                onClick={toggleShortcuts}
                className={buttonStyle(activePanel !== "shortcuts")}
                title="Toggle Keyboard Shortcuts"
            >
                <Keyboard className="w-5 h-5"/>
                <span>Shortcuts</span>
            </button>
            <button
                onClick={toggleLibrary}
                className={buttonStyle(activePanel !== "library")}
                title="Toggle Block Library"
            >
                <Library className="w-5 h-5"/>
                <span>Library</span>
            </button>
        </div>
    </>
}

export default ReferenceSection;