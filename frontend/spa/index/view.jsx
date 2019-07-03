var Index = React.createClass({
    requiredModules: [
        'spa/unlock',
        'spa/header',
        'spa/products',
        'spa/fundingPool/list'
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
            'transaction/submitted': this.showTransactionModal
        };
    },
    showWalletModal() {
        var _this = this;
        client.userManager.getBalances().then(balances => {
            _this.walletEth.innerHTML = Utils.roundWei(balances.eth);
            _this.walletSeed.innerHTML = Utils.roundWei(balances.seed);
            _this.addressLink.attr('href', ecosystemData.etherscanURL + 'address/' + client.userManager.user.wallet);
            _this.addressLink.html(client.userManager.user.wallet);
            _this.privateKeyLabel.html('***************************************************************************'.substring(0, 50));
            _this.walletModal.isHidden() && this.walletModal.show();
        });
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
    togglePrivateKey(e) {
        e && e.preventDefault();
        var x = client.userManager.user.privateKey.substring(0, 50) + '...';
        if(this.privateKeyLabel.html().indexOf("*") !== 0) {
            x = '***************************************************************************'.substring(0, 50);
        }
        this.privateKeyLabel.html(x);
    },
    askForget(e) {
        e && e.preventDefault && e.preventDefault();
        if(confirm('All your data will be lost, do you want to continue?')) {
            this.controller.forgetUser();
            this.emit('page/change');
        }
    },
    showLoaderModal(title) {
        this.genericLoadingText.html(title ? title : '');
        this.genericLoadingModal.isHidden() && this.genericLoadingModal.show();
    },
    showAskTransactionModal(txHash, title) {
        if(!title) {
            title = '';
        }
        this.askTransactionModal.setTitle(title);
        this.askTransactionModal.isHidden() && this.askTransactionModal.show();
    },
    showTransactionLockModal(transaction) {
        var title = '<span>Sealing transaction into Blockchain. This can take more than 30 seconds...</span><br/><br/>';
        title += '<a href=" ' + (transaction ? ecosystemData.etherscanURL + 'tx/' + transaction : '#') + '" target="_blank">Follow on Etherscan</a>';
        this.showLoaderModal(title);
    },
    showTransactionModal(txHash, title, error, tx) {
        this.transactionModal.setTitle(title);
        this.transactionBody.html('');
        var body = '';
        if(error) {
            body += '<h3 class="error">Transaction error:</h3><br/><br/>';
            body += '<p>' + error.message || error + '</p>';
        } else {
            body += '<h3 class="success">Transaction Correctly submitted</h3><br/><br/>';
            body += '<h3><a target="_blank" href="' + (txHash ? ecosystemData.etherscanURL + 'tx/' + txHash : '#') + '">View on Etherscan</a></h3>';
        }
        this.transactionBody.html(body);
        this.transactionModal.isHidden() && this.transactionModal.show();
    },
    changePage(element, props) {
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
                    _this.setState({ title: element.prototype.title, element, props });
                }
            });
        }
    },
    getDefaultRenderer() {
        return !client.configurationManager.hasUser() ? Products : client.configurationManager.hasUnlockedUser() ? Products : Unlock;
    },
    onElementRef(ref) {
        if(ref === undefined || ref === null) {
            return;
        }
        if(ref.getTitle) {
            var title = ref.getTitle();
            if(!this.state || !this.state.title || this.state.title !== title) {
                if(title && this.state.title && typeof title !== 'string' && typeof this.state.title !== 'string') {
                    if(title.key === this.state.title.key) {
                        return;
                    }
                }
                this.setState({title});
            }
        }
    },
    render() {
        var rendered = this.state && this.state.element ? this.state.element : this.getDefaultRenderer();
        var props = this.state && this.state.props;
        !props && (props = {});
        props.ref = this.onElementRef.bind(this)
        if(rendered === Unlock) {
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
                        <Header title={this.state && this.state.title ? this.state.title : ''} element={rendered}/>
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
                    <br/>
                    <br/>
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
                    className="header wallet">
                    <h4>Your Address:</h4>
                    <div>
                        <a target="_blank" ref={ref => this.addressLink = $(ref)}></a>
                        {'\u00A0'}
                        <a href="#" onClick={this.copyAddress}><i className="copy fa fa-file"></i></a>
                    </div>
                    <br/>
                    <h4>Your Private Key:</h4>
                    <div>
                        <span ref={ref => this.privateKeyLabel = $(ref)}></span>
                        {'\u00A0'}
                        <a href="#" onClick={this.togglePrivateKey}><i className="copy fa fa-eye"></i></a>
                        {'\u00A0'}
                        <a href="#" onClick={this.copyPrivateKey}><i className="copy fa fa-file"></i></a>
                    </div>
                    <br/>
                    <br/>
                    <h4>Your wallet contains <strong><span ref={ref => this.walletEth = ref}></span> eth</strong> and <strong><span ref={ref => this.walletSeed = ref}></span> SEED</strong></h4>
                    <p>You can purchase them on <a href="https://www.therocktrading.com" target="_blank">TheRock Trading</a></p>
                </Modal>
            </div>
        );
    }
});