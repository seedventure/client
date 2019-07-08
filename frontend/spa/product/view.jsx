var Product = React.createClass({
    /*<dt className="d-block">Description</dt>
                        <dd>
                            <p>{product.description}</p>
                        </dd>*/
    requiredModules: [
        'spa/detail',
        'spa/fundingPool/edit'
    ],
    onClick(e) {
        e && e.preventDefault();
        if(!this.getProduct().name) {
            alert("Please, wait for the retrievement of all data");
            return;
        }
        //TODO MV Remove this when investor part is ready
        if (this.props.view !== 'mine') {
            return;
        }
        this.emit((this.props.type ? this.props.type : 'page') + '/change', this.props.view === 'mine' ? EditFundingPool : Detail, { element: this.getProduct(), type: this.props.type, view: this.props.view });
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
        var product = this.getProduct();
        if (!product.name) {
            client.contractsManager.getFundingPanelData(product);
        }
    },
    makeUnsuitable(e) {
        e && e.preventDefault();
        this.controller.makeUnsuitable(this.getProduct());
    },
    render() {
        var product = this.getProduct();
        return (
            <div className="kt-portlet" onClick={this.onClick}>
                <div className="kt-portlet__head">
                    <div className="kt-portlet__head-label">
                        <h3 className="kt-portlet__head-title">
                            {product.name} {product.symbol && ((product.name ? "(" : "") + product.symbol + (product.name ? ")" : ""))}
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
                        {product.url && [<dt>URL</dt>,
                        <dd><a href={product.url} target="_blank">{product.url}</a></dd>,
                        <br />]}
                        <dt>Latest Quotation:</dt>
                        <dd className="text-cta">{Utils.roundWei(product.value || product.seedRate)} SEED</dd>
                        {this.props.view === 'mine' && [<br />,
                        <dt>Total Supply:</dt>,
                        <dd className="text-cta">{Utils.roundWei(product.totalSupply)} SEED</dd>,
                        <span>{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}</span>,
                        <dd><button className="btn btn-pill micro btn-brand" onClick={this.makeUnsuitable}>Make Unsuitable</button></dd>]}
                    </dl>
                </div>
            </div>
        );
    }
});