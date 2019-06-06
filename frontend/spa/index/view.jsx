var Index = React.createClass({
    requiredModules: [
        'spa/products',
        'spa/user',
        'spa/unlock',
        'spa/myProducts',
        'spa/fundingPool/list'
    ],
    requiredScripts: [
        'spa/welcome.jsx',
        'spa/modal.jsx'
    ],
    getDefaultSubscriptions() {
        return {
            'page/change': this.changePage,
            'index/title': title => this.setState({ title }),
            'loader/show': this.showLoaderModal,
            'loader/hide': () => this.genericLoadingModal.hide(),
            'transaction/show': this.showTransactionModal,
            'wallet/show': this.showWalletModal
        };
    },
    showWalletModal() {
        this.addressLink.attr('href', ecosystemData.etherscanURL + 'address/' + client.userManager.user.wallet);
        this.addressLink.html(client.userManager.user.wallet);
        this.privateKeyLabel.html(client.userManager.user.privateKey.substring(0, 55) + '...');
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
    showTransactionModal(transaction) {
        console.log(transaction);
        this.transactionLink.attr('href', transaction ? ecosystemData.etherscanURL + 'tx/' + transaction : '#');
        this.transactionModal.isHidden() && this.transactionModal.show();
    },
    showLoaderModal(title) {
        this.genericLoadingText.html(title ? title : '');
        this.genericLoadingModal.isHidden() && this.genericLoadingModal.show();
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
                    _this.setState({ title: element.prototype.title || (element.prototype.getTitle ? element.prototype.getTitle() : null), element, props });
                }
            });
        }
    },
    getDefaultRenderer() {
        return !client.configurationManager.hasUser() ? Products : client.configurationManager.hasUnlockedUser() ? Welcome : Unlock;
    },
    renderChoose() {
        if (!client.configurationManager.hasUnlockedUser()) {
            return null;
        }
        return (
            <div className="row sections">
                <div className="col-md-6">
                    <button type="button" className={"btn choose " + (this.state.element === ListFundingPool ? "" : "selected")} onClick={() => this.changePage(MyProducts)}>Investments</button>
                </div>
                <div className="col-md-6">
                    <button type="button" className={"btn choose " + (this.state.element === ListFundingPool ? "selected" : "")} onClick={() => this.changePage(ListFundingPool)}>Baskets</button>
                </div>
            </div>
        )
    },
    render() {
        return (
            <div>
                <div className="row">
                    <div className="col-md-6">
                        <h1>
                            {this.state && this.state.element && <a className="back" href="javascript:;" onClick={() => this.changePage()}>{"<"}{'\u00A0'}{'\u00A0'}{'\u00A0'}</a>}
                            {this.state && this.state.title}
                        </h1>
                    </div>
                    <div className="col-md-6">
                        <User />
                    </div>
                </div>
                {this.renderChoose()}
                {React.createElement(this.state && this.state.element ? this.state.element : this.getDefaultRenderer(), this.state && this.state.props ? this.state.props : null)}
                <Modal
                    ref={ref => this.genericLoadingModal = ref}
                    readonly={true}
                    backdrop="static"
                    keyboard="false"
                    className="index loader">
                    <Loader size='x2' />
                    <h4 ref={ref => this.genericLoadingText = $(ref)}></h4>
                </Modal>
                <Modal
                    title="Transaction Submitted!"
                    ref={ref => this.transactionModal = ref}
                    backdrop="static"
                    className="index transaction">
                    <h2>
                        <a ref={ref => this.transactionLink = $(ref)} target="_blank">View on Etherscan</a>
                    </h2>
                </Modal>
                <Modal
                    title="Your Wallet"
                    ref={ref => this.walletModal = ref}
                    className="index wallet">
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
            </div>
        );
    }
});