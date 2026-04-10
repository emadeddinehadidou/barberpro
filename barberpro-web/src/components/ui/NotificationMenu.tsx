import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { api } from "../../api/axios";
import type { AppNotification, NotificationsResponse } from "../../types";

function formatNotificationTime(value: string) {
  return new Date(value).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function NotificationMenu() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState("");

  const loadNotifications = async () => {
    try {
      const response = await api.get<NotificationsResponse>("/notifications");
      setItems(response.data.items);
      setUnreadCount(response.data.unread_count);
      setError("");
    } catch (err) {
      console.error("Failed to load notifications", err);
      setError("Impossible de charger les notifications.");
    }
  };

  useEffect(() => {
    loadNotifications();

    const intervalId = window.setInterval(() => {
      loadNotifications();
    }, 60000);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (open) {
      loadNotifications();
    }
  }, [open]);

  const handleMarkAllAsRead = async () => {
    try {
      await api.patch("/notifications/read-all");
      setItems((prev) =>
        prev.map((item) => ({
          ...item,
          read_at: item.read_at || new Date().toISOString(),
        }))
      );
      setUnreadCount(0);
      setError("");
    } catch (err) {
      console.error("Failed to mark notifications as read", err);
      setError("Impossible de marquer les notifications comme lues.");
    }
  };

  const handleRead = async (notificationId: string) => {
    try {
      const target = items.find((item) => item.id === notificationId);
      await api.patch(`/notifications/${notificationId}/read`);
      setItems((prev) =>
        prev.map((item) =>
          item.id === notificationId
            ? { ...item, read_at: item.read_at || new Date().toISOString() }
            : item
        )
      );
      if (!target?.read_at) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
      setError("");
    } catch (err) {
      console.error("Failed to mark notification as read", err);
      setError("Impossible de marquer cette notification comme lue.");
    }
  };

  const handleDelete = async (notificationId: string) => {
    const target = items.find((item) => item.id === notificationId);

    setItems((prev) => prev.filter((item) => item.id !== notificationId));
    if (!target?.read_at) {
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }

    try {
      await api.delete(`/notifications/${notificationId}`);
      setError("");
    } catch (err) {
      console.error("Failed to delete notification", err);
      setError("Impossible de supprimer cette notification.");
      loadNotifications();
    }
  };

  const handleDeleteAll = async () => {
    const previousItems = items;
    const previousUnreadCount = unreadCount;

    setItems([]);
    setUnreadCount(0);

    try {
      await api.delete("/notifications");
      setError("");
    } catch (err) {
      console.error("Failed to delete notifications", err);
      setItems(previousItems);
      setUnreadCount(previousUnreadCount);
      setError("Impossible de supprimer les notifications.");
    }
  };

  const modal = open
    ? createPortal(
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[rgba(64,45,24,0.18)] p-4 backdrop-blur-sm">
          <div
            className="absolute inset-0"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          <div className="relative z-[121] flex max-h-[88vh] w-[min(56rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-[28px] border border-[#dfcfb5] bg-[linear-gradient(180deg,rgba(255,252,246,0.98)_0%,rgba(244,234,220,0.98)_100%)] text-[#2b2116] shadow-[0_30px_80px_rgba(88,63,34,0.18)]">
            <div className="flex items-start justify-between gap-4 border-b border-[#e2d5c2] px-6 py-5">
              <div className="min-w-0">
                <h3 className="text-xl font-semibold text-[#2b2116]">Notifications</h3>
                <p className="mt-1 text-sm text-[#665440]">
                  {unreadCount > 0
                    ? `${unreadCount} non lue${unreadCount > 1 ? "s" : ""}`
                    : "Tout est lu"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="shrink-0 rounded-full border border-[#decfb8] bg-white/80 px-3 py-1.5 text-sm text-[#4b3824] transition hover:bg-white"
              >
                Fermer
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-3 border-b border-[#e2d5c2] px-6 py-4">
              <button
                type="button"
                onClick={() => handleMarkAllAsRead().catch(() => undefined)}
                className="text-sm font-medium text-[#c8a96b] transition hover:text-[#d8bb82]"
              >
                Tout lire
              </button>
              <button
                type="button"
                onClick={() => handleDeleteAll().catch(() => undefined)}
                className="text-sm font-medium text-red-300 transition hover:text-red-300/80"
              >
                Tout supprimer
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-6">
              <div className="space-y-4">
                {error ? (
                  <p className="rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
                    {error}
                  </p>
                ) : null}

                {items.length === 0 ? (
                  <p className="rounded-2xl border border-[#e2d5c2] bg-white/75 p-5 text-sm text-[#665440]">
                    Aucune notification.
                  </p>
                ) : (
                  items.map((item) => (
                    <div
                      key={item.id}
                      className={`w-full rounded-2xl border p-5 text-left transition ${
                        item.read_at
                          ? "border-[#e2d5c2] bg-white/78 text-[#2b2116]"
                          : "border-[#c8a96b]/30 bg-[#f5e7cf] text-[#2b2116]"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <span
                          className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${
                            item.read_at ? "bg-[#d9c7ad]" : "bg-[#8a6a3c]"
                          }`}
                        />

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0 flex-1">
                              <button
                                type="button"
                                onClick={() => handleRead(item.id).catch(() => undefined)}
                                className="block w-full text-left"
                              >
                                <p className="break-words text-base font-semibold leading-6 text-[#2b2116]">
                                  {item.data.title}
                                </p>
                                <p className="mt-2 break-words text-sm leading-6 text-[#5b4a37]">
                                  {item.data.body}
                                </p>
                              </button>
                            </div>

                            <div className="flex shrink-0 items-center gap-2 self-start">
                              <span className="text-xs text-[#7f6c57]">
                                {formatNotificationTime(item.created_at)}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleDelete(item.id).catch(() => undefined)}
                                className="rounded-lg border border-[#dfcfb5] bg-white/80 px-2.5 py-1.5 text-xs text-red-300 transition hover:bg-red-500/10"
                                aria-label="Supprimer la notification"
                              >
                                Suppr.
                              </button>
                            </div>
                          </div>

                          <p className="mt-3 break-words text-xs leading-5 text-[#7f6c57]">
                            {item.data.service_name || "Service"} • {item.data.appointment_date} •{" "}
                            {item.data.start_time.slice(0, 5)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="relative flex w-full items-center justify-between gap-3 rounded-2xl border border-[#d9c8af] bg-white/80 px-4 py-3 text-left text-sm text-[#2b2116] transition hover:bg-white"
      >
        <span className="font-medium">Notifications</span>
        {unreadCount > 0 ? (
          <span className="shrink-0 rounded-full bg-[#8a6a3c] px-2 py-0.5 text-xs font-semibold text-[#fffaf2]">
            {unreadCount}
          </span>
        ) : null}
      </button>

      {modal}
    </div>
  );
}
