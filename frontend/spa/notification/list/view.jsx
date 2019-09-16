var NotificationList = React.createClass({
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
        _this.forceUpdate();
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
        _this.forceUpdate();
        return false;
    },
    select(e) {
        e && e.preventDefault() && e.stopPropagation();
        var position = $(e.target).attr('data-position');
        var element = client.contractsManager.getList()[position];
        this.emit('page/change', Detail, { element });
    },
    getNotifications() {
        var notifications = [];
        if (!client.userManager.user) {
            return notifications;
        }
        var all = client.persistenceManager.get(client.persistenceManager.PERSISTENCE_PROPERTIES.notifyAll) === true;
        var userWallet = client.userManager.user.wallet.toLowerCase();
        var products = client.contractsManager.getArray();
        for (var i in products) {
            var product = products[i];
            try {
                if (product.walletOnTop.toLowerCase() === userWallet) {
                    continue;
                }
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
                Enumerable.From(product.notifications).Where(it => (all && it.forAll) || favorite).ForEach(it => notifications.push(it));
            } catch (e) {
            }
        }
        return Enumerable.From(notifications).Where(it => it.blockNumber && it.texts.length > 0).OrderByDescending(it => it.blockNumber).ToArray();
    },
    render() {
        var notifications = this.getNotifications() || [];
        return (
            <div className="row">
                <div className="col-md-12">
                    {notifications && notifications.length > 0 && <div className="row">
                        <div className="col-md-8">
                            <h3><strong>{Enumerable.From(notifications).Count(it => it.read !== true)}</strong> New notifications to read</h3>
                        </div>
                        <div className="col-md-4">
                            <a href="javascript:;" className="mark-all-as-read" onClick={this.markAllNotificationsAsRead}><h3>Mark all as read</h3></a>
                        </div>
                    </div>}
                    <div className="row">
                        <div className="col-md-12">
                            {'\u00A0'}
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-12">
                            {'\u00A0'}
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-12">
                            {notifications && notifications.length === 0 && <h3>No new notifications to show right now</h3>}
                            {notifications && notifications.length > 0 && notifications.map(it =>
                                <div key={it.blockNumber} className="row">
                                    <div data-position={it.productPosition} className="col-md-10">
                                        <ul className="notifications" data-position={it.productPosition}>
                                            {it.texts && it.texts.length > 0 && it.texts.map(text =>
                                                <li data-position={it.productPosition}>
                                                    <a href="javascript:;" data-position={it.productPosition} onClick={this.select}>
                                                        <h3 data-position={it.productPosition}>{text}</h3>
                                                    </a>
                                                </li>
                                            )}
                                        </ul>
                                    </div>
                                    <div className="col-md-2">
                                        {it.read !== true && <a href="javascript:;" data-position={it.productPosition} data-key={it.blockNumber} onClick={this.markAsReadNotification}><h3><i data-key={it.blockNumber} data-position={it.productPosition} className="fa fa-check"></i></h3></a>}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});