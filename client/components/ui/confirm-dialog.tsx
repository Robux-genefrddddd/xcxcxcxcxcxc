import { X, AlertCircle, CheckCircle, Trash2 } from "lucide-react";
import { getThemeColors } from "@/lib/theme-colors";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  theme: string;
  loading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isDangerous = false,
  theme,
  loading = false,
}: ConfirmDialogProps) {
  const colors = getThemeColors(theme);

  if (!isOpen) return null;

  const Icon = isDangerous ? Trash2 : CheckCircle;
  const iconColor = isDangerous ? "#EF4444" : colors.primary;
  const iconBgColor = isDangerous
    ? "rgba(239, 68, 68, 0.1)"
    : `${colors.primary}15`;
  const confirmBgColor = isDangerous ? "#EF4444" : colors.accentLight;
  const confirmTextColor = isDangerous ? "white" : colors.primary;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200"
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.85)",
        backdropFilter: "blur(8px)",
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-2xl animate-in zoom-in-95 slide-in-from-top-12 duration-300"
        style={{
          backgroundColor: "#111214",
          border: "1px solid #1F2124",
        }}
      >
        {/* Content */}
        <div className="p-8 text-center space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{
                backgroundColor: isDangerous
                  ? "rgba(239, 68, 68, 0.15)"
                  : `${colors.primary}20`,
              }}
            >
              <Icon
                className="w-8 h-8"
                style={{
                  color: isDangerous ? "#EF4444" : colors.primary,
                }}
              />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold" style={{ color: "#FFFFFF" }}>
            {title}
          </h2>

          {/* Description */}
          {description && (
            <p className="text-sm" style={{ color: "#9CA3AF" }}>
              {description}
            </p>
          )}
        </div>

        {/* Actions */}
        <div
          className="px-8 pb-8 space-y-3 flex flex-col-reverse"
          style={{
            borderTop: "1px solid #1F2124",
            paddingTop: "24px",
          }}
        >
          <button
            onClick={onConfirm}
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg active:scale-95"
            style={{
              backgroundColor: isDangerous ? "#EF4444" : colors.primary,
              color: "white",
            }}
          >
            {loading ? "Processing..." : confirmText}
          </button>
          <button
            onClick={onClose}
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl font-semibold transition-all disabled:opacity-50 hover:opacity-80 active:scale-95"
            style={{
              backgroundColor: "#1A1D20",
              color: "#D1D5DB",
              border: "1px solid #2A2D30",
            }}
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
}
