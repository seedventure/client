var Index = React.createClass({
    requiredModules: [
        'spa/unlock',
        'spa/header',
        'spa/products',
        'spa/fundingPool/create',
        'spa/preferences',
        'spa/dex',
        'spa/choose',
        'spa/detail',
        'spa/preferences/networkChooser'
    ],
    requiredScripts: [
        'spa/modal.jsx'
    ],
    getDefaultSubscriptions() {
        return {
            'wallet/show': this.showWalletModal,
            'user/askForget': this.askForget,
            'page/change': this.changePage,
            'loader/show': this.showLoaderModal,
            'loader/hide': () => this.genericLoadingModal.hide(),
            'transaction/ask': this.showAskTransactionModal,
            'transaction/lock': this.showTransactionLockModal,
            'transaction/unlock': () => this.genericLoadingModal.hide(),
            'transaction/submitted': this.showTransactionModal,
            'investment/mine': this.renderOwnedToken,
            'configuration/forgotten': this.refreshTokenList
        };
    },
    showWalletModal() {
        var _this = this;
        client.userManager.getBalances().then(balances => {
            _this.walletEth.innerHTML = Utils.roundWei(balances.eth);
            _this.walletSeed.innerHTML = Utils.roundWei(balances.seed);
            _this.addressLink.attr('href', client.persistenceManager.get(client.persistenceManager.PERSISTENCE_PROPERTIES.etherscanURL) + 'address/' + client.userManager.user.wallet);
            _this.addressLink.html(client.userManager.user.wallet);
            _this.privateKeyLabel.html('***************************************************************************'.substring(0, 50));
            _this.renderOwnedTokens();
            _this.walletModal.isHidden() && this.walletModal.show();
        });
    },
    copyAddress(e) {
        e && e.preventDefault() && e.stopPropagation();
        Utils.copyToClipboard(client.userManager.user.wallet);
    },
    copyPrivateKey(e) {
        e && e.preventDefault() && e.stopPropagation();
        Utils.copyToClipboard(client.userManager.user.privateKey);
    },
    togglePrivateKey(e) {
        e && e.preventDefault() && e.stopPropagation();
        var x = client.userManager.user.privateKey.substring(0, 50) + '...';
        if (this.privateKeyLabel.html().indexOf("*") !== 0) {
            x = '***************************************************************************'.substring(0, 50);
        }
        this.privateKeyLabel.html(x);
    },
    askForget(e) {
        e && e.preventDefault && e.preventDefault() && e.stopPropagation && e.stopPropagation();
        if (confirm('All your data will be lost, do you want to continue?')) {
            this.controller.forgetUser();
            this.emit('page/change');
        }
    },
    showLoaderModal(title, body) {
        this.genericLoadingModal.setTitle(title || '');
        this.genericLoadingText.html(body || '');
        this.genericLoadingModal.isHidden() && this.genericLoadingModal.show();
    },
    showAskTransactionModal(txHash, title) {
        if (!title) {
            title = '';
        }
        this.askTransactionModal.setTitle(title);
        this.askTransactionModal.isHidden() && this.askTransactionModal.show();
    },
    showTransactionLockModal(title, transaction) {
        var body = '<span>Sealing transaction into Blockchain. This can take more than 30 seconds...</span><br/><br/>';
        body += '<a href="' + (transaction ? client.persistenceManager.get(client.persistenceManager.PERSISTENCE_PROPERTIES.etherscanURL) + 'tx/' + transaction : '#') + '" target="_blank">Follow on Etherscan</a>';
        this.showLoaderModal(title, body);
    },
    showTransactionModal(txHash, title, error, tx) {
        this.transactionModal.setTitle(title);
        this.transactionBody.html('');
        var body = '';
        if (error) {
            body += '<h3 class="error">Transaction error:</h3><br/><br/>';
            body += '<p>' + error.message || error + '</p>';
        } else {
            body += '<h3 class="success">Transaction Correctly submitted</h3><br/><br/>';
            body += '<h3><a target="_blank" href="' + (txHash ? client.persistenceManager.get(client.persistenceManager.PERSISTENCE_PROPERTIES.etherscanURL) + 'tx/' + txHash : '#') + '">View on Etherscan</a></h3>';
        }
        this.transactionBody.html(body);
        this.transactionModal.isHidden() && this.transactionModal.show();
    },
    changePage(element, props, callback) {
        !element && (element = null);
        !props && (props = null);
        if (!element) {
            this.setState({ title: null, element: null, props: null });
        } else {
            var _this = this;
            ReactModuleLoader.load({
                modules: element.prototype.requiredModules || [],
                scripts: element.prototype.requiredScripts || [],
                callback: function () {
                    _this.setState({ title: element.prototype.title, element, props }, callback);
                }
            });
        }
    },
    getDefaultRenderer() {
        return !client.configurationManager.hasUser() || client.configurationManager.hasUnlockedUser() ? Products : Unlock;
    },
    onElementRef(ref) {
        if (!ref) {
            return;
        }
        var title = null;
        if (ref.getTitle) {
            title = ref.getTitle();
            if (!this.state || !this.state.title || this.state.title !== title) {
                if (title && this.state.title && typeof title !== 'string' && typeof this.state.title !== 'string') {
                    if (title.key === this.state.title.key) {
                        title = null;
                    }
                }
            }
        }
        var newState = {
            back: ref.back
        };
        if (newState.back === undefined || newState.back === null || this.state.back === newState.back) {
            delete newState.back;
        }
        title && this.state.title !== title && (newState.title = title);
        !ref.getTitle && this.state && this.state.title !== null && (newState.title = null);
        ref.title && delete newState.title;
        Object.keys(newState).length > 0 && this.setState(newState);
    },
    clearSearch(e) {
        e && e.preventDefault() && e.stopPropagation();
        this.searchBar.value = '';
        this.emit('products/search');
    },
    renderOwnedToken(product, consume) {
        if (!product || !product.tokenAddress || !product.symbol) {
            typeof consume === 'function' && setTimeout(consume);
            return;
        }
        var _this = this;
        client.contractsManager.tokenBalanceOf(product.tokenAddress, client.userManager.user.wallet).then(result => {
            if (parseInt(result) <= 0) {
                typeof consume === 'function' && setTimeout(consume);
                return;
            }
            result = Utils.roundWei(result);
            var element = _this.ownedTokens.children('[data-position="' + product.position + '"]');
            element.length === 0 && (element = $(`
            <div class="row token-container" data-position="${product.position}">
                <div class="col-md-12">
                    <div class="row token">
                        <div class="col-md-2">${product.image ? `<img width="40" height="40" src="data:image/png;base64, ${product.image}" />` : '&nbsp;'}</div>
                        <div class="col-md-5"><h3>${product.name || product.symbol}</h3></div>
                        <div class="col-md-5 amount"><h3>${result} ${product.symbol}</h3></div>
                    </div>
                </div>
            </div>`).click(e => {
                e && e.preventDefault() && e.stopPropagation();
                if(!product.name) {
                    return alert('Please wait until data has been downloaded');
                }
                _this.walletModal.hide();
                _this.emit('page/change', Detail, { element: product });
            }).appendTo(_this.ownedTokens));
            element.children().find('.amount').html('<h3>' + result + ' ' + product.symbol + '</h3>');
            typeof consume === 'function' && setTimeout(consume);
        });
    },
    refreshTokenList() {
        this.ownedTokens && this.ownedTokens.html('');
        this.ownedTokens && this.renderOwnedTokens();
    },
    renderOwnedTokens() {
        var array = client.contractsManager.getArray();
        var i = -1;
        var _this = this;
        var consume = () => i++ < array.length && _this.renderOwnedToken(array[i], consume);
        setTimeout(consume);
    },
    checkDistDate(newVersionAvailableModal) {
        if (!newVersionAvailableModal) {
            return;
        }
        var distDate = window.distDate;
        client.updaterManager.distDate = distDate;
        delete window.distDate;
        distDate && distDate > ecosystemData.distDate && setTimeout(() => newVersionAvailableModal.show(), 1200);
    },
    componentDidMount() {
        this.componentDidUpdate();
    },
    componentDidUpdate() {
        if ((!this.state || !this.state.element || this.state.element !== Preferences) && !client.persistenceManager.get(client.persistenceManager.PERSISTENCE_PROPERTIES.seedTokenAddress)) {
            this.emit('page/change', Preferences);
        }
    },
    openEthFaucet(e) {
        e && e.preventDefault() && e.stopPropagation();
        this.copyAddress();
    },
    render() {
        var _this = this;
        var rendered = this.state && this.state.element ? this.state.element : this.getDefaultRenderer();
        var props = this.state && this.state.props;
        !props && (props = {});
        props.ref = this.onElementRef.bind(this)
        if (rendered === Unlock) {
            return (
                <div className="kt-grid kt-grid--hor kt-grid--root">
                    {React.createElement(rendered, props)}
                </div>
            );
        }
        return (
            <div className="kt-grid kt-grid--hor kt-grid--root">
                <div className="kt-grid__item kt-grid__item--fluid kt-grid kt-grid--ver kt-page">
                    <div className={"kt-grid__item kt-grid__item--fluid kt-grid kt-grid--hor kt-wrapper" + (client.userManager.user ? "" : " guest")} id="kt_wrapper">
                        {(!this.state || !this.state.element || this.state.element !== Choose) && [<Header title={this.state && this.state.title ? this.state.title : ''} element={rendered} view={props.view} back={this.state && this.state.back} />,
                        <br />]}
                        {!client.configurationManager.hasUnlockedUser() && [<br />, <br />,<br />, <br />,<br />]}
                        {(!this.state || !this.state.element || this.state.element === Products) && [<div className="kt-subheader kt-grid__item" id="kt_subheader">
                            <div className="kt-subheader__main">
                                <div className="kt-subheader__breadcrumbs">
                                </div>
                            </div>
                            <div className="kt-subheader__main">
                                <input type="text" placeholder="Search..." onChange={e => this.emit('products/search', e)} ref={ref => this.searchBar = ref} />
                                {'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}
                                <span className="kt-subheader__separator"></span>
                                <div className="kt-subheader__breadcrumbs">
                                    <a href="#" className="kt-subheader__breadcrumbs-home" onClick={this.clearSearch}><i className="fas fa-remove"></i></a>
                                </div>
                            </div>
                        </div>,
                        <br/>]}
                        {React.createElement(rendered, props)}
                    </div>
                </div>
                <Modal
                    ref={ref => this.genericLoadingModal = ref}
                    readonly="true"
                    backdrop="static"
                    keyboard="false"
                    className="index loader">
                    <Loader size='x2' />
                    <br />
                    <br />
                    <h4 ref={ref => this.genericLoadingText = $(ref)}></h4>
                </Modal>
                <Modal
                    ref={ref => this.transactionModal = ref}
                    backdrop="static"
                    keyboard="false"
                    onHide={() => $.publish('transaction/finalize')}
                    className="index">
                    <div ref={ref => this.transactionBody = $(ref)}></div>
                </Modal>
                <Modal
                    title="Submit Transaction"
                    ref={ref => this.askTransactionModal = ref}
                    backdrop="static"
                    className="index transaction"
                    onHide={() => $.publish('transaction/submit')}
                    actions={[{
                        text: "Send",
                        className: "btn-brand btn-pill",
                        onClick() {
                            $.publish('transaction/submit', true);
                            var _this = this;
                            setTimeout(_this.hide);
                        }
                    }]}>
                    <h2>
                        Sending a new payable transaction to Blockchain. Continue?
                    </h2>
                </Modal>
                <Modal
                    title="Welcome!"
                    ref={ref => this.walletModal = ref}
                    className="index wallet">
                    <h4>Your Address:</h4>
                    <div>
                        <a target="_blank" ref={ref => this.addressLink = $(ref)}></a>
                        {'\u00A0'}
                        <a href="#" onClick={this.copyAddress}><i className="copy fa fa-file"></i></a>
                    </div>
                    <br />
                    <h4>Your Private Key:</h4>
                    <div>
                        <span ref={ref => this.privateKeyLabel = $(ref)}></span>
                        {'\u00A0'}
                        <a href="#" onClick={this.togglePrivateKey}><i className="copy fa fa-eye"></i></a>
                        {'\u00A0'}
                        <a href="#" onClick={this.copyPrivateKey}><i className="copy fa fa-file"></i></a>
                    </div>
                    <br />
                    <br />
                    <h4>Your wallet contains <strong><span ref={ref => this.walletEth = ref}></span> eth</strong> and <strong><span ref={ref => this.walletSeed = ref}></span> SEED</strong></h4>
                    <br/>
                    {client.persistenceManager.get(client.persistenceManager.PERSISTENCE_PROPERTIES.etherscanURL).indexOf('ropsten') === -1 && <p>You can purchase them on <a href="https://www.therocktrading.com" target="_blank">TheRock Trading</a></p>}
                    {client.persistenceManager.get(client.persistenceManager.PERSISTENCE_PROPERTIES.etherscanURL).indexOf('ropsten') !== -1 && <p className="faucets"><a href="https://faucet.ropsten.be" target="_blank" onClick={this.openEthFaucet}>Get 1 Eth</a> <a href={"http://86.107.98.39/faucet?addr=" + (client.userManager.user && client.userManager.user.wallet || '')} target="_blank">Get 100 SEEDs</a></p>}
                    <br />
                    <h2>Owned Basket Tokens</h2>
                    <br />
                    <div ref={ref => this.ownedTokens = $(ref)} className="ownedTokens">
                    </div>
                </Modal>
                <Modal
                    readonly="false"
                    backdrop="static"
                    keyboard="false"
                    title="New Version of the SEEDVenture Client is available!"
                    ref={this.checkDistDate}
                    className="index newVersionAvailableModel"
                    actions={[{
                        text: "Update",
                        className: "btn-brand btn-pill",
                        onClick() {
                            var _this = this;
                            setTimeout(_this.hide);
                            client.updaterManager.download();
                        }
                    }]}>
                    <h3>It is recommended to always keep the client update. You can do in any moment.</h3>
                </Modal>
                <Modal 
                    ref={ref => ref && _this.state && _this.state && _this.state.element !== Unlock && _this.state.element !== Choose && !window.network && setTimeout(ref.show) && (window.network = true)}
                    readonly="true"
                    backdrop="static"
                    keyboard="false"
                    actions={[{
                        text: "OK",
                        className: "btn-brand btn-pill",
                        onClick() {
                            var _modal = this;
                            _this.networkChooser.changeFactoryAddress(() => {
                                _modal.hide();
                                _this.forceUpdate();
                            });
                        }
                    }]}>
                    <NetworkChooser hideButton="true" ref={ref => this.networkChooser = ref}/>
                </Modal>
            </div>
        );
    }
});