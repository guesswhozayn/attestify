class NotificationService {
  constructor() {
    this.subscribers = [];
  }

  subscribe(callback) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  notify(message, type = 'info') {
    this.subscribers.forEach(callback => callback({ message, type }));
  }

  success(message) {
    this.notify(message, 'success');
  }

  error(message) {
    this.notify(message, 'error');
  }

  warning(message) {
    this.notify(message, 'warning');
  }

  info(message) {
    this.notify(message, 'info');
  }
}

export default new NotificationService();
