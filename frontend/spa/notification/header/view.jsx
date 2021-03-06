var NotificationHeader = React.createClass({
    requiredModules: [
        'spa/notification/list'
    ],
    getDefaultSubscriptions() {
        return {
            'notifications/new': this.forceUpdate
        };
    },
    markAllNotificationsAsRead(e) {
        e && e.preventDefault() && e.stopPropagation();
        var _this = this;
        Enumerable.From(_this.getNotifications()).ForEach(it => it.read = true);
        _this.emit('notifications/new');
        _this.forceUpdate(() => _this.notificationIcon.click());
    },
    markAsReadNotification(e) {
        e && e.preventDefault() && e.stopPropagation();
        var _this = this;
        var position = $(e.target).attr('data-position');
        var element = client.contractsManager.getList()[position];
        var blockNumber = parseInt($(e.target).attr('data-key'));
        try {
            Enumerable.From(element.notifications).Where(it => it.blockNumber === blockNumber).First().read = true;
        } catch (e) {
        }
        _this.emit('notifications/new');
        _this.forceUpdate(() => _this.notificationIcon.click());
        return false;
    },
    select(e) {
        e && e.preventDefault() && e.stopPropagation();
        if ($(e.target).attr('data-return') === 'true') {
            return;
        }
        var position = $(e.target).attr('data-position');
        var element = client.contractsManager.getList()[position];
        if(!element.name) {
            return alert('Please wait until data has been downloaded');
        }
        var blockNumber = parseInt($(e.target).attr('data-key'));
        try {
            Enumerable.From(element.notifications).Where(it => it.blockNumber === blockNumber).First().read = true;
        } catch (e) {
        }
        this.emit('page/change', Detail, { element });
    },
    getNotifications() {
        var notifications = [];
        if (!client.userManager.user) {
            return notifications;
        }
        var all = false;
        try {
            all = client.persistenceManager.get(client.persistenceManager.PERSISTENCE_PROPERTIES.notifyAll) === true;
        } catch(e) {
        }
        var userWallet = client.userManager.user.wallet.toLowerCase();
        var products = client.contractsManager.getArray();
        for (var i in products) {
            var product = products[i];
            try {
                var favorite = false;
                try {
                    favorite = Enumerable.From(client.userManager.user.list).Any(it => product.position === it);
                } catch (e) {
                }
                if (!favorite) {
                    try {
                        favorite = (product.investors[userWallet] && product.investors[userWallet] > 0);
                    } catch (e) {
                    }
                }
                Enumerable.From(product.notifications).Where(it => (all && it.forAll) || favorite).Select(it => {
                    if (product.walletOnTop.toLowerCase() === userWallet) {
                        var texts = Enumerable.From(it.texts).Where(it => it.indexOf('A new order of ') === 0).ToArray();
                        it.texts = texts;
                        return texts.length === 0 ? undefined : it;
                    }
                    return it;
                }).Where(it => it !== undefined).ForEach(it => notifications.push(it));
            } catch (e) {
            }
        }
        return Enumerable.From(notifications).Where(it => it.blockNumber && it.texts.length > 0).OrderByDescending(it => it.blockNumber).ToArray();
    },
    render() {
        var notifications = (this.getNotifications() || []);
        var count = Enumerable.From(notifications).Count(it => it.read !== true);
        notifications = notifications.splice(0, 5);
        return (
            <div className="kt-header__topbar-item dropdown">
                <div ref={ref => this.notificationIcon = $(ref)} className="kt-header__topbar-wrapper px-2" data-toggle="dropdown" data-offset="10px,0px" aria-expanded="true">
                    <span><i className="fa fa-bell"></i></span>
                    <span className="kt-badge kt-badge--dot kt-badge--notify bg-secondary">{count}</span>
                </div>
                <div className="dropdown-menu dropdown-menu-fit dropdown-menu-right dropdown-menu-anim dropdown-menu-top-unround dropdown-menu-lg" x-placement="bottom-end">
                    {notifications && notifications.length > 0 && <div className="kt-notification kt-margin-t-10 kt-scroll ps top">
                        <span className="notifications-title">Notifications</span>
                        <a href="javascript:;" className="mark-all-as-read" onClick={this.markAllNotificationsAsRead}>Mark all as read</a>
                    </div>}
                    {notifications && notifications.length === 0 && <span>{'\u00A0'}{'\u00A0'}{'\u00A0'}No new notifications to show right now</span>}
                    {notifications && notifications.length > 0 && notifications.map(it =>
                        <div key={it.blockNumber} className="kt-notification kt-margin-t-10 kt-scroll ps">
                            <a href="#" data-position={it.productPosition} data-key={it.blockNumber} className="kt-notification__item" onClick={this.select}>
                                <div data-position={it.productPosition} data-key={it.blockNumber} className="kt-notification__item-details">
                                    <div data-position={it.productPosition} data-key={it.blockNumber} className="kt-notification__item-title">
                                        <ul className="notifications" data-position={it.productPosition} data-key={it.blockNumber}>
                                            {it.texts && it.texts.length > 0 && it.texts.map(text =>
                                                <li data-position={it.productPosition} data-key={it.blockNumber}>{text}</li>
                                            )}
                                        </ul>
                                    </div>
                                </div>
                                <div className="kt-notification__item-icon">
                                    {it.read !== true && <a href="javascript:;" data-position={it.productPosition} data-key={it.blockNumber} data-return="true" onClick={this.markAsReadNotification}><i data-key={it.blockNumber} data-position={it.productPosition} data-return="true" className="fa fa-check"></i></a>}
                                </div>
                            </a>
                        </div>
                    )}
                    {notifications && notifications.length > 0 && <div className="kt-notification kt-margin-t-10 kt-scroll ps bottom">
                        <a href="javascript:;" className="view-all" onClick={() => this.emit('page/change', NotificationList)}>View All</a>
                    </div>}
                </div>
            </div>
        );
    }
});