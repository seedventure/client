var Member = React.createClass({
    getDefaultSubscriptions() {
        var position = this.props.element.position;
        var subscriptions = {};
        subscriptions['fundingPanel/' + this.props.parent.position + '/member/' + position + '/updated'] = product => this.setState({ product });
        return subscriptions;
    },
    edit(e) {
        e && e.preventDefault();
        var _this = this;
        var product = _this.getProduct();
        if(!product.name || product.unavailable) {
            alert("Please wait until data has been downloaded");
            return;
        }
        this.emit('page/change', this.props.view === 'mine' ? EditFundingPool : Detail, { element: this.getProduct(), parent: this.props.parent, view: this.props.view }, () => _this.emit('product/set', this.getProduct()));
    },
    getProduct() {
        return this.state && this.state.product || this.props.element;
    },
    componentDidMount() {
        var _this = this;
        var product = this.getProduct();
        (!product.name || product.unavailable) && client.contractsManager.getFundingPanelMemberData(product).then(p => _this.setState({product: p}));
    },
    enableDisable(e) {
        e && e.preventDefault();
        var product = this.getProduct();
        this.controller[(product.disabled === 0 ? 'disable' : 'enable') + 'Startup'](product, this.props.parent);
    },
    unlockFunds(e) {
        e && e.preventDefault();
        var amount = 0;
        try {
            amount = parseFloat(this.unlockAmount.value);
        } catch(e) {}
        if(isNaN(amount) || amount < 1) {
            alert("Unlock amount must be a number greater than 0");
            return;
        }
        this.controller.unlockAmount(this.getProduct(), this.props.parent, amount);
    },
    onClick(e) {
        if(this.props.view === 'mine') {
            return;
        }
        this.edit(e);
    },
    render() {
        var product = this.getProduct();
        return (
            <div className={"kt-portlet" + (this.props.view === 'mine' ? '' : ' selectable')} onClick={this.onClick}>
                <div className="kt-portlet__head">
                    <div className="kt-portlet__head-label">
                        {product.image && <img width="50" height="50" ref={ref => this.image = $(ref)} src={product.image ? ("data:image/png;base64, " + product.image) : ''} />}
                        {product.image && '\u00A0\u00A0\u00A0\u00A0'}
                        <h3 className="kt-portlet__head-title">
                            {product.name || 'New Startup'} {product.url && <span> ({product.url})</span>}
                        </h3>
                    </div>
                    {!product.name && <div className="retrieving">
                        <div className="retrievingContainer row">
                            <div className="label col-md-8">Retrieveing data...</div>
                            <div className="spinner col-md-4">
                                <Loader/>
                            </div>
                        </div>
                    </div>}
                </div>
                <div className="kt-portlet__body">
                    <dl>
                        {this.props.view === 'mine' && <input type="number" className="form-control" placeholder="Funds to unlock" ref={ref => this.unlockAmount = ref}/>}
                    </dl>
                </div>
                {this.props.view === 'mine' && <div className="kt-portlet__foot">
                    <button type="button" className="btn btn-brand btn-pill btn-elevate browse-btn tiny" onClick={this.enableDisable}>{product.disabled === 0 ? "Disable" : "Enable"}</button>
                    {'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}
                    <button type="button" className="btn btn-secondary btn-pill btn-elevate browse-btn tiny" onClick={this.unlockFunds}>Unlock Funds</button>
                    {'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}
                    {product.name && <button type="button" className="btn btn-brand btn-pill btn-elevate browse-btn tiny" onClick={this.edit}>Edit</button>}
                </div>}
            </div>
        );
    }
});