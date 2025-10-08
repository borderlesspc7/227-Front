import React, { useState, useEffect, useContext, useCallback } from "react";
import { FiBell, FiCheck, FiX, FiClock, FiAlertCircle, FiFileText } from "react-icons/fi";
import { AuthContext } from "../../../contexts/authContext";
import { notificationService } from "../../../services/notificationService";
import type { ApprovalNotification } from "../../../types/approvalWorkflow";
import { formatDateTime } from "../../../utils/dateUtils";
import "./NotificationBell.css";

const NotificationBell: React.FC = () => {
  const { user } = useContext(AuthContext) || {};
  const [notifications, setNotifications] = useState<ApprovalNotification[]>(
    []
  );
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const loadNotifications = useCallback(async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      const userNotifications = await notificationService.getUserNotifications(
        user.uid
      );

      // Filtrar notificações que não foram removidas pelo usuário
      const visibleNotifications = userNotifications.filter(
        (n) => !n.isDismissed
      );
      setNotifications(visibleNotifications);

      const unread = visibleNotifications.filter((n) => !n.isRead).length;
      setUnreadCount(unread);
    } catch (error) {
      console.error("Erro ao carregar notificações:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.uid]);

  useEffect(() => {
    if (user?.uid) {
      loadNotifications();
      // Carregar notificações a cada 30 segundos
      const interval = setInterval(loadNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user?.uid, loadNotifications]);

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Erro ao marcar notificação como lida:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.uid) return;

    try {
      await notificationService.markAllAsRead(user.uid);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Erro ao marcar todas como lidas:", error);
    }
  };

  const handleDismissNotification = async (
    notificationId: string,
    event: React.MouseEvent
  ) => {
    event.stopPropagation(); // Previne que clique no X dispare o clique da notificação

    try {
      await notificationService.dismissNotification(notificationId);
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Erro ao remover notificação:", error);
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "urgent":
        return (
          <FiAlertCircle className="notification-bell__priority-icon urgent" />
        );
      case "high":
        return (
          <FiAlertCircle className="notification-bell__priority-icon high" />
        );
      case "medium":
        return <FiClock className="notification-bell__priority-icon medium" />;
      default:
        return <FiClock className="notification-bell__priority-icon low" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "approved":
        return <FiCheck className="notification-bell__type-icon approved" />;
      case "rejected":
        return <FiX className="notification-bell__type-icon rejected" />;
      case "returned":
        return (
          <FiAlertCircle className="notification-bell__type-icon returned" />
        );
      case "contract_limit_warning":
      case "user_limit_warning":
      case "storage_limit_warning":
        return <FiAlertCircle className="notification-bell__type-icon urgent" />;
      case "pending_returns":
        return <FiClock className="notification-bell__type-icon high" />;
      case "pending_formalizations":
        return <FiFileText className="notification-bell__type-icon medium" />;
      default:
        return <FiBell className="notification-bell__type-icon default" />;
    }
  };

  const handleNotificationClick = (notification: ApprovalNotification) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }

    if (notification.actionUrl) {
      window.location.href = notification.actionUrl;
    }
  };

  return (
    <div className="notification-bell">
      <button
        className="notification-bell__trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Notificações"
      >
        <FiBell className="notification-bell__icon" />
        {unreadCount > 0 && (
          <span className="notification-bell__badge">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="notification-bell__dropdown">
          <div className="notification-bell__header">
            <h3>Notificações</h3>
            {unreadCount > 0 && (
              <button
                className="notification-bell__mark-all"
                onClick={handleMarkAllAsRead}
              >
                Marcar todas como lidas
              </button>
            )}
          </div>

          <div className="notification-bell__list">
            {loading ? (
              <div className="notification-bell__loading">
                Carregando notificações...
              </div>
            ) : notifications.length === 0 ? (
              <div className="notification-bell__empty">
                Nenhuma notificação encontrada
              </div>
            ) : (
              notifications.slice(0, 10).map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-bell__item ${!notification.isRead ? "unread" : ""
                    } ${notification.priority}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="notification-bell__item-header">
                    <div className="notification-bell__item-icons">
                      {getTypeIcon(notification.type)}
                      {getPriorityIcon(notification.priority)}
                    </div>
                    <div className="notification-bell__item-actions">
                      <span className="notification-bell__item-time">
                        {formatDateTime(notification.createdAt)}
                      </span>
                      <button
                        className="notification-bell__dismiss-btn"
                        onClick={(e) =>
                          handleDismissNotification(notification.id, e)
                        }
                        title="Remover notificação"
                        aria-label="Remover notificação"
                      >
                        <FiX />
                      </button>
                    </div>
                  </div>

                  <div className="notification-bell__item-content">
                    <h4 className="notification-bell__item-title">
                      {notification.title}
                    </h4>
                    <p className="notification-bell__item-message">
                      {notification.message}
                    </p>
                    {notification.department && (
                      <span className="notification-bell__item-department">
                        {notification.department}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {notifications.length > 10 && (
            <div className="notification-bell__footer">
              <a href="/notifications" className="notification-bell__view-all">
                Ver todas as notificações
              </a>
            </div>
          )}
        </div>
      )}

      {isOpen && (
        <div
          className="notification-bell__overlay"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default NotificationBell;
