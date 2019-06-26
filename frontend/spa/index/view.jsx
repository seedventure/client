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
            'user/askForget': this.askForget,
            'page/change': this.changePage,
            'loader/show': this.showLoaderModal,
            'loader/hide': () => this.genericLoadingModal.hide(),
            'transaction/show': this.showTransactionModal
        };
    },
    askForget(e) {
        e && e.preventDefault && e.preventDefault();
        if(confirm('All your data will be lost, do you want to continue?')) {
            this.controller.forgetUser();
            this.emit('page/change');
        }
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
        return !client.configurationManager.hasUser() ? Products : client.configurationManager.hasUnlockedUser() ? Products : Unlock;
    },
    render() {
        var rendered = this.state && this.state.element ? this.state.element : this.getDefaultRenderer();
        if(rendered === Unlock) {
            return (
                <div className="kt-grid kt-grid--hor kt-grid--root">
                    {React.createElement(rendered, this.state && this.state.props ? this.state.props : null)}
                </div>
            );
        }
        return (
            <div className="kt-grid kt-grid--hor kt-grid--root">
                <div className="kt-grid__item kt-grid__item--fluid kt-grid kt-grid--ver kt-page">
                    <div className={"kt-grid__item kt-grid__item--fluid kt-grid kt-grid--hor kt-wrapper" + (client.userManager.user ? "" : " guest")} id="kt_wrapper">
                        <Header title={this.state && this.state.title ? this.state.title : ''} element={rendered}/>
                        {React.createElement(rendered, this.state && this.state.props ? this.state.props : null)}
                    </div>
                </div>
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
            </div>
        );
    }
});