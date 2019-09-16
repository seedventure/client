var Header = React.createClass({
    requiredModules: [
        'spa/configuration/import',
        'spa/configuration/create',
        'spa/configuration/backup',
        'spa/configuration/move',
        'spa/detail',
        'spa/dex',
        'spa/notification/header'
    ],
    getDefaultSubscriptions() {
        return {
            'index/title': title => this.setState({ title }),
            'amount/seed': seed => this.setState({ seed }),
            'amount/eth': eth => this.setState({ eth })
        };
    },
    copyAddress(e) {
        e && e.preventDefault() && e.stopPropagation();
        Utils.copyToClipboard(client.userManager.user.wallet);
    },
    copyPrivateKey(e) {
        e && e.preventDefault() && e.stopPropagation();
        Utils.copyToClipboard(client.userManager.user.privateKey);
    },
    importConfiguration(e) {
        e && e.preventDefault() && e.stopPropagation();
        this.emit('page/change', ImportConfiguration);
    },
    createConfiguration(e) {
        e && e.preventDefault() && e.stopPropagation();
        this.emit('page/change', CreateConfiguration);
    },
    backupConfiguration(e) {
        e && e.preventDefault() && e.stopPropagation();
        this.emit('page/change', BackupConfiguration);
    },
    moveConfiguration(e) {
        e && e.preventDefault() && e.stopPropagation();
        this.emit('page/change', MoveConfiguration);
    },
    openPreferences(e) {
        e && e.preventDefault() && e.stopPropagation();
        this.emit('page/change', Preferences);
    },
    componentDidUpdate() {
        if (client.userManager.user && (new Date().getTime() - this.lastBalanceCheck) > 50000) {
            this.lastBalanceCheck = new Date().getTime();
            client.userManager.getBalances();
        }
    },
    componentDidMount() {
        if (!client.userManager.user) {
            return;
        }
        this.lastBalanceCheck = new Date().getTime();
        client.userManager.getBalances();
    },
    renderTitle() {
        if (!this.props.title || typeof this.props.title === 'string') {
            return (<span className="mr-4">
                <strong>{this.props.title || ((this.props.view === 'mine' ? 'My ' : '') + 'Baskets')}</strong>
            </span>);
        }
        return this.props.title;
    },
    markAllNotificationsAsRead(e) {
        e && e.preventDefault() && e.stopPropagation();
        var _this = this;
        setTimeout(() => _this.notificationIncon.click());
    },
    readNotification(e) {
        e && e.preventDefault() && e.stopPropagation();
        var _this = this;
        setTimeout(() => _this.notificationIncon.click());
    },
    render() {
        var selected = null;
        (this.props.element === Products || this.props.element === Detail) && (selected = 'Baskets');
        this.props.view === 'mine' && (selected = 'My Baskets');
        this.props.element === Dex && (selected = 'Trade');
        return (
            <header id="kt_header" className="kt-header kt-grid__item kt-header--fixed row mx-0" data-ktheader-minimize="on">
                <div className="kt-header__top col-12 py-3 bg-primary">
                    <div className="kt-container">
                        <div className="kt-header__topbar header-left back-title">
                            {this.props.title && this.props.element !== Dex && <a href="javascript:;" data-toggle="kt-tooltip" data-placement="bottom" title="Back" className="back" onClick={e => this.props.back ? this.props.back(e) : this.emit('page/change', Products, { view: this.props.view })}>
                                <i className="fas fa-arrow-left"></i>
                            </a>}
                            <span>{'\u00A0'}{'\u00A0'}</span>
                            {this.renderTitle()}
                            {'\u00A0'}
                            {this.props.view === 'mine' && <a href="javascript:;" onClick={() => this.emit('page/change', CreateFundingPool, { view: 'mine' })} className="kt-subheader__breadcrumbs-home"><i className="fas fa-plus"></i></a>}
                        </div>
                        <div className="kt-header__topbar justify-content-end header-right">
                            <span className="mr-4">Welcome <strong>{client.userManager.user ? (client.userManager.user.wallet.substring(0, 9) + "...") : client.configurationManager.hasUser() ? "" : "Guest"}</strong></span>
                            {client.userManager.user && this.state && this.state.eth && <span className="mr-4">(<strong>{Utils.roundWei(this.state.eth)} eth</strong>)</span>}
                            {client.userManager.user && this.state && this.state.seed && <span className="mr-4">(<strong>{Utils.roundWei(this.state.seed)} SEED</strong>)</span>}
                            {window['NotificationHeader'] !== undefined && client.userManager.user && <NotificationHeader/>}
                            {client.userManager.user && <a href="javascript:;" data-toggle="kt-tooltip" data-placement="bottom" title="Wallet" onClick={() => this.emit('wallet/show')}>
                                <i className="fas fa-wallet"></i>
                            </a>}
                            {client.userManager.user && <a href="javascript:;" data-toggle="kt-tooltip" data-placement="bottom" title="Backup Configuration" onClick={this.backupConfiguration}>
                                <i className="fas fa-file-download"></i>
                            </a>}
                            {client.userManager.user && <a href="javascript:;" data-toggle="kt-tooltip" data-placement="bottom" title="Move Configuration" onClick={this.moveConfiguration}>
                                <i className="fas fa-external-link-alt"></i>
                            </a>}
                            {!client.userManager.user && <a href="javascript:;" onClick={this.createConfiguration} data-toggle="kt-tooltip" data-placement="bottom" title="Create New Wallet">
                                <i className="fas fa-plus"></i>
                            </a>}
                            {!client.userManager.user && <a href="javascript:;" onClick={this.importConfiguration} data-toggle="kt-tooltip" data-placement="bottom" title="Import Configuration">
                                <i className="fas fa-file-import"></i>
                            </a>}
                            <a href="javascript:;" onClick={this.openPreferences} data-toggle="kt-tooltip" data-placement="bottom" title="Preferences">
                                <i className="fas fa-cog"></i>
                            </a>
                            {client.configurationManager.hasUnlockedUser() && <a href="javascript:;" data-toggle="kt-tooltip" data-placement="bottom" title="Forget Me" onClick={() => this.emit('user/askForget')}>
                                <i className="fas fa-sign-out-alt"></i>
                            </a>}
                        </div>
                    </div>
                </div>
                <div className="kt-header__bottom col-12 py-3 bg-secondary">
                    <div className="kt-container">
                        <div className="kt-header-menu-wrapper" id="kt_header_menu_wrapper">
                            <div id="kt_header_menu" className="kt-header-menu">
                                <ul className="kt-menu__nav">
                                    <li className={"kt-menu__item" + (selected === 'Baskets' ? " kt-menu__item--open kt-menu__item--here" : "")}>
                                        <a href="javascript:;" onClick={() => this.emit('page/change', Products)}>
                                            Baskets
                                        </a>
                                    </li>
                                    <li className={"kt-menu__item" + (selected === 'Trade' ? " kt-menu__item--open kt-menu__item--here" : "")}>
                                        <a href="javascript:;" onClick={() => this.emit('page/change', Dex)}>
                                            Trade
                                        </a>
                                    </li>
                                    {client.configurationManager.hasUnlockedUser() && <li className={"kt-menu__item" + (selected === 'My Baskets' ? " kt-menu__item--open kt-menu__item--here" : "")}>
                                        <a href="javascript:;" onClick={() => this.emit('page/change', Products, { view: 'mine' })}>
                                            My Baskets
                                        </a>
                                    </li>}
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </header >
        );
    }
});