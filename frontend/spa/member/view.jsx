var Member = React.createClass({
    /*<dt className="d-block">Description</dt>
                        <dd>
                            <p>{product.description}</p>
                        </dd>*/
    requiredModules: [
    ],
    onClick(e) {
        e && e.preventDefault();
        var _this = this;
        this.emit((this.props.type || 'page') + '/change', this.props.view === 'mine' ? EditFundingPool : Detail, { element: this.getProduct(), parent: this.props.parent, type: this.props.type, view: this.props.view }, () => _this.emit('product/set', this.getProduct()));
    },
    getProduct() {
        return this.state && this.state.product ? this.state.product : this.props.element;
    },
    componentDidMount() {
        var _this = this;
        var product = this.getProduct();
        if (!product.name) {
            client.contractsManager.refreshMember(product, this.props.parent.fundingPanelAddress).then(p => _this.setState({product: p}));
        }
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
    render() {
        var product = this.getProduct();
        return (
            <div className="kt-portlet">
                <div className="kt-portlet__head">
                    <div className="kt-portlet__head-label">
                        <h3 className="kt-portlet__head-title">
                            {product.name || "Loading info..."} {product.url && <a target="_blank" href={product.url}> ({product.url})</a>}
                        </h3>
                    </div>
                </div>
                <div className="kt-portlet__body">
                    <dl>
                        <input type="number" className="form-control" placeholder="Funds to unlock" ref={ref => this.unlockAmount = ref}/>
                    </dl>
                </div>
                <div className="kt-portlet__foot">
                    <button type="button" className="btn btn-brand btn-pill btn-elevate browse-btn tiny" onClick={this.enableDisable}>{product.disabled === 0 ? "Disable" : "Enable"}</button>
                    {'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}
                    <button type="button" className="btn btn-secondary btn-pill btn-elevate browse-btn tiny" onClick={this.unlockFunds}>Unlock Funds</button>
                    {'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}
                    {product.name && <button type="button" className="btn btn-brand btn-pill btn-elevate browse-btn tiny" onClick={this.onClick}>Edit</button>}
                </div>
            </div>
        );
    }
});