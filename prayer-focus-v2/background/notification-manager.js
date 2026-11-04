export function showDesktopNotification(title, message, iconUrl = '../assets/icons/icon128.png') {
  if (typeof chrome !== 'undefined' && chrome.notifications) {
    const notifOptions = {
      type: 'basic',
      iconUrl: iconUrl,
      title: title,
      message: message,
      priority: 2,
      requireInteraction: true
    };
    chrome.notifications.create(`prayer_notif_${Date.now()}`, notifOptions, () => {
      if (chrome.runtime.lastError) {
        console.warn('[Notification Error]:', chrome.runtime.lastError);
      }
    });
  }
}
