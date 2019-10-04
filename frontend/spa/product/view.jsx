var Product = React.createClass({
    requiredModules: [
        'spa/detail',
        'spa/fundingPool/edit'
    ],
    onClick(e) {
        e && e.preventDefault() && e.stopPropagation();
        var product = this.getProduct();
        if(!product.name || (this.props.view === 'mine' && product.unavailable)) {
            alert("Please wait until data has been downloaded");
            return;
        }
        this.emit('page/change', this.props.view === 'mine' ? EditFundingPool : Detail, { element: this.getProduct(), view: this.props.view });
    },
    getDefaultSubscriptions() {
        var position = this.props.element.position;
        var subscriptions = {};
        subscriptions['fundingPanel/' + position + '/updated'] = element => this.setState({ product: element });
        return subscriptions;
    },
    getProduct() {
        return this.state && this.state.product ? this.state.product : this.props.element;
    },
    componentDidMount() {
        this.tryUpdateProduct();
    },
    componentDidUpdate() {
        this.tryUpdateProduct();
    },
    tryUpdateProduct() {
        var _this = this;
        var product = _this.getProduct();
        (!product.name || product.unavailable) && client.contractsManager.getFundingPanelData(product).then(p => p && p.name && !p.unavailable && _this.setState({product : p}, () => _this.emit('products/search')));
    },
    makeUnsuitable(e) {
        e && e.preventDefault() && e.stopPropagation();
        this.controller.makeUnsuitable(this.getProduct());
    },
    render() {
        var product = this.getProduct();
        return (
            <div className="kt-portlet" onClick={this.onClick}>
                <div className="kt-portlet__head">
                    <div className="kt-portlet__head-label">
                        {product.image && <img width="50" height="50" ref={ref => this.image = $(ref)} src={product.image ? ("data:image/png;base64, " + product.image) : ''} />}
                        {product.image && '\u00A0\u00A0\u00A0\u00A0'}
                        <h3 className="kt-portlet__head-title">
                            {product.name} {product.symbol && ((product.name ? "(" : "") + product.symbol + (product.name ? ")" : ""))}
                        </h3>
                    </div>
                    {(!product.name || product.unavailable) && <div className="retrieving">
                        <div className="retrievingContainer row">
                            <div className="label col-md-8">Updating info...</div>
                            <div className="spinner col-md-4">
                                <Loader/>
                            </div>
                        </div>
                    </div>}
                </div>
                <div className="kt-portlet__body">
                    <dl>
                        {product.url && [<dt>URL</dt>,
                        <dd><h4>{product.url}</h4></dd>,
                        <br />]}
                        <dt>Latest Quotation:</dt>
                        <dd className="text-cta">{product.value && product.value > 0 ? Utils.roundWei(product.value) : Utils.numberToString(1/Utils.toEther(product.seedRate), true)} SEED</dd>
                        <br/>
                        <dt>Total Raised:</dt>
                        <dd className="text-cta">{Utils.roundWei(product.totalRaised)} SEED</dd>
                        {this.props.view === 'mine' && [<span>{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}</span>,
                        <dd><button className="btn btn-pill micro btn-brand" onClick={this.makeUnsuitable}>Make Unsuitable</button></dd>]}
                    </dl>
                </div>
            </div>
        );
    }
});