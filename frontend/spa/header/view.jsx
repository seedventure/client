var Header = React.createClass({
    requiredModules: [
        'spa/configuration/import',
        'spa/configuration/create',
        'spa/configuration/backup',
        'spa/configuration/move'
    ],
    getDefaultSubscriptions() {
        return {
            'wallet/show': this.showWalletModal,
            'index/title': title => this.setState({ title }),
            'amount/seed': seed => this.setState({ seed }),
            'amount/eth': eth => this.setState({ eth }),
        };
    },
    showWalletModal() {
        this.addressLink.attr('href', ecosystemData.etherscanURL + 'address/' + client.userManager.user.wallet);
        this.addressLink.html(client.userManager.user.wallet);
        this.privateKeyLabel.html(client.userManager.user.privateKey.substring(0, 50) + '...');
        this.walletModal.isHidden() && this.walletModal.show();
    },
    copyAddress(e) {
        e && e.preventDefault();
        const el = document.createElement('textarea');
        el.value = client.userManager.user.wallet;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
    },
    copyPrivateKey(e) {
        e && e.preventDefault();
        const el = document.createElement('textarea');
        el.value = client.userManager.user.privateKey;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
    },
    importConfiguration(e) {
        e.preventDefault();
        this.emit('page/change', ImportConfiguration);
    },
    createConfiguration(e) {
        e.preventDefault();
        this.emit('page/change', CreateConfiguration);
    },
    backupConfiguration(e) {
        e.preventDefault();
        this.emit('page/change', BackupConfiguration);
    },
    moveConfiguration(e) {
        e.preventDefault();
        this.emit('page/change', MoveConfiguration);
    },
    componentDidUpdate() {
        if(client.userManager.user && (new Date().getTime() - this.lastBalanceCheck) > 50000) {
            this.lastBalanceCheck = new Date().getTime();
            client.userManager.getBalances();
        }
    },
    setupChooseSection(ref) {
        if(!ref) {
            return;
        }
        var firstSection = $((ref = $(ref)).children().find('li.kt-menu__item').click(function() {
            ref.children().find('li.kt-menu__item').removeClass('kt-menu__item--open').removeClass('kt-menu__item--here');
            $(this).addClass('kt-menu__item--open').addClass('kt-menu__item--here');
        })[0]).click();
        /*setTimeout(function() {
            firstSection.click().children().find('a').click();
        }, 700);*/
    },
    componentDidMount() {
        if(!client.userManager.user) {
            return;
        }
        this.lastBalanceCheck = new Date().getTime();
        client.userManager.getBalances();
    },
    render() {
        return (
            <header id="kt_header" className="kt-header kt-grid__item kt-header--fixed row mx-0" data-ktheader-minimize="on">
                <div className="kt-header__top col-12 py-3 bg-primary">
                    <div className="kt-container">
                        <div className="kt-header__topbar header-left back-title">
                            {this.props.title && <a href="javascript:;" data-toggle="kt-tooltip" data-placement="bottom" title="Back" className="back" onClick={() => this.emit('page/change')}>
                                <i className="fas fa-arrow-left"></i>
                            </a>}
                            <span className="mr-4"><strong>{this.props.title}</strong></span>
                        </div>
                        <div className="kt-header__topbar justify-content-end header-right">
                            <span className="mr-4">Welcome <strong>{client.userManager.user ? (client.userManager.user.wallet.substring(0,9) + "...") : client.configurationManager.hasUser() ? "" : "Guest"}</strong></span>
                            {client.userManager.user && this.state && this.state.eth && <span className="mr-4">(<strong>{Utils.roundWei(this.state.eth)} eth</strong>)</span>}
                            {client.userManager.user && this.state && this.state.seed && <span className="mr-4">(<strong>{Utils.roundWei(this.state.seed)} SEED</strong>)</span>}
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
                            {false && <a href="javascript:;" data-toggle="kt-tooltip" data-placement="bottom" title="Settings">
                                <i className="fas fa-cog"></i>
                            </a>}
                            {client.userManager.user && <a href="javascript:;" data-toggle="kt-tooltip" data-placement="bottom" title="Forget Me" onClick={() => this.emit('user/askForget')}>
                                <i className="fas fa-sign-out-alt"></i>
                            </a>}
                        </div>
                    </div>
                </div>
                {client.userManager.user && <div className="kt-header__bottom col-12 py-3 bg-secondary">
                    <div className="kt-container" ref={this.setupChooseSection}>
                        <div className="kt-header-menu-wrapper" id="kt_header_menu_wrapper">
                            <div id="kt_header_menu" className="kt-header-menu">
                                <ul className="kt-menu__nav">
                                    <li className="kt-menu__item">
                                        <a href="javascript:;" onClick={() => this.emit('page/change', Products)}>
                                            Investor
                                        </a>
                                    </li>
                                    <li className="kt-menu__item">
                                        <a href="javascript:;" onClick={() => this.emit('page/change', ListFundingPool)}>
                                            Incubator
                                        </a>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>}
                <Modal
                    title="Your Wallet"
                    ref={ref => this.walletModal = ref}
                    className="header wallet">
                    <h4>Your Address:</h4>
                    <div>
                        <a target="_blank" ref={ref => this.addressLink = $(ref)}></a>
                        <a href="#" onClick={this.copyAddress}><i className="copy fa fa-file"></i></a>
                    </div>
                    <h4>Your Private Key:</h4>
                    <div>
                        <span ref={ref => this.privateKeyLabel = $(ref)}></span>
                        <a href="#" onClick={this.copyPrivateKey}><i className="copy fa fa-file"></i></a>
                    </div>
                </Modal>
            </header>
        );
    }
});