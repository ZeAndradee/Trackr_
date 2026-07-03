import { toast } from "react-hot-toast";
import { CircleCheck, CircleX, TriangleAlert, Info } from "lucide-react";

import style from "./Toast.module.css";

const typeStyles = {
    success: { bgColor: "var(--toast-success-bg)", textColor: "var(--toast-success-text)" },
    error: { bgColor: "var(--toast-error-bg)", textColor: "var(--toast-error-text)" },
    warning: { bgColor: "var(--toast-warning-bg)", textColor: "var(--toast-warning-text)" },
    info: { bgColor: "var(--toast-info-bg)", textColor: "var(--toast-info-text)" },
};

let unsavedToastId = null;

const showToast = (message, type = "success", options = {}) => {
    const { icon: CustomIcon, color, bgColor, confirm, confirmText = "Confirm", cancelText = "Cancel" } = options;

    const renderToast = (t, resolve) => {
        const defaultStyle = typeStyles[type] || typeStyles.info;
        const activeBgColor = bgColor || defaultStyle.bgColor;
        const activeColor = color || defaultStyle.textColor;

        const customContainerStyles = {
            backgroundColor: activeBgColor,
            color: activeColor,
            border: `2px solid color-mix(in srgb, ${activeColor} 20%, transparent)`,
        };

        return (
            <div
                className={`${style.toastContainer} ${t.visible ? style.enter : style.leave}`}
                style={customContainerStyles}
            >
                {!confirm && (
                    <div className={style.iconWrapper} style={{ color: activeColor }}>
                        {CustomIcon ? (
                            <CustomIcon />
                        ) : (
                            <>
                                {type === "success" && <CircleCheck size={16} />}
                                {type === "error" && <CircleX size={16} />}
                                {type === "warning" && <TriangleAlert size={16} />}
                                {type === "info" && <Info size={16} />}
                            </>
                        )}
                    </div>
                )}
                <span className={style.message}>{message}</span>
                {confirm && (
                    <div className={style.actionButtons}>
                        <button
                            className={style.cancelButton}
                            style={{ color: activeColor }}
                            onClick={() => {
                                toast.dismiss(t.id);
                                if (resolve) resolve(false);
                            }}
                        >
                            {cancelText}
                        </button>
                        <button
                            className={style.confirmButton}
                            style={{ backgroundColor: activeColor, color: activeBgColor }}
                            onClick={() => {
                                toast.dismiss(t.id);
                                if (resolve) resolve(true);
                            }}
                        >
                            {confirmText}
                        </button>
                    </div>
                )}
            </div>
        );
    };

    if (confirm) {
        return new Promise((resolve) => {
            toast.custom((t) => renderToast(t, resolve), { duration: Infinity });
        });
    }

    toast.custom((t) => renderToast(t), options);
};

export const dismissUnsavedChangesToast = () => {
    if (unsavedToastId) {
        toast.dismiss(unsavedToastId);
        unsavedToastId = null;
    }
};

export const showUnsavedChangesToast = ({ onSave, onDiscard }) => {
    if (unsavedToastId) return;

    const cleanup = () => { unsavedToastId = null; };

    unsavedToastId = toast.custom(
        (t) => (
            <div className={`${style.unsavedToast} ${t.visible ? style.enter : style.leave}`}>
                <span className={style.unsavedMessage}>Attention — You have unsaved changes!</span>
                <div className={style.unsavedActions}>
                    <button
                        className={style.discardButton}
                        onClick={() => {
                            toast.dismiss(t.id);
                            cleanup();
                            onDiscard();
                        }}
                    >
                        Discard
                    </button>
                    <button
                        className={style.saveButton}
                        onClick={() => {
                            toast.dismiss(t.id);
                            cleanup();
                            onSave();
                        }}
                    >
                        Save changes
                    </button>
                </div>
            </div>
        ),
        { duration: Infinity }
    );
};

export default showToast;
