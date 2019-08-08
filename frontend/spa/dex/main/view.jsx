var Dex = React.createClass({
    title: 'Trade',
    detail(e) {
        e && e.preventDefault() && e.stopPropagation();
        var position = $(e.target).attr('data-position');
        var element = client.contractsManager.getList()[position];
        this.emit('page/change', Detail, { element });
    },
    getProductsArray() {
        var products = client.contractsManager.getArray();
        products = Enumerable.From(products).Where(it => it.totalSupply === undefined || parseInt(it.totalSupply) > 0).OrderByDescending(it => parseInt(it.position)).ToArray();
        var search = this.state && this.state.search;
        search && (search = search.toLowerCase()) && (products = Enumerable.From(products).Where(product => {
            if (product.fundingPanelAddress && product.fundingPanelAddress.toLowerCase().indexOf(search) !== -1) {
                return true;
            }
            if (product.name && product.name.toLowerCase().indexOf(search) !== -1) {
                return true;
            }
            if (product.symbol && product.symbol.toLowerCase().indexOf(search) !== -1) {
                return true;
            }
            if (product.tags && product.tags.length > 0 && Enumerable.From(product.tags).Any(it => it.toLowerCase().indexOf(search) !== -1)) {
                return true;
            }
            return false;
        }).ToArray());
        return products;
    },
    search(e) {
        e && e.preventDefault() && e.stopPropagation();
        this.searchTimeout && clearTimeout(this.searchTimeout);
        var target = this.searchBar;
        var _this = this;
        this.searchTimeout = setTimeout(function () {
            _this.setState({ search: target && target.value });
        }, 300);
    },
    clearSearch(e) {
        e && e.preventDefault() && e.stopPropagation();
        this.searchBar.value = '';
        this.search();
    },
    onClick(e) {
        e && e.preventDefault() && e.stopPropagation();
        var position = $(e.target).attr('data-position');
        var product = client.contractsManager.getList()[position];
        this.setState({product});
    },
    getProduct() {
        return this.state && this.state.product ? this.state.product : this.props.element;
    },
    render() {
        var _this = this;
        var products = _this.getProductsArray();
        return (
            <div className="kt-grid__item kt-grid__item--fluid kt-grid kt-grid--ver kt-grid--stretch">
                <div className="kt-container kt-body kt-grid kt-grid--ver" id="kt_body">
                    <div className="kt-grid__item kt-grid__item--fluid kt-grid kt-grid--hor">
                        <div className="kt-content kt-grid__item kt-grid__item--fluid">
                            <div className="row">
                                <div className="col-md-3">
                                    <div className="row">
                                        <div className="col-md-12">Status</div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-12">
                                            <h3>Baskets</h3>
                                            <div className="row">
                                                <div className="col-md-12">
                                                    <div className="row searchBar">
                                                        <div className="col-sm-10 separator">
                                                            <input type="text" placeholder="Search..." onChange={this.search} ref={ref => this.searchBar = ref} />
                                                        </div>
                                                        <div className="col-sm-2 clear">
                                                            <a href="#" className="kt-subheader__breadcrumbs-home" onClick={this.clearSearch}><i className="fas fa-remove"></i></a>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="row">
                                                <div className="col-md-12">
                                                    <ul className="products">
                                                        {products.map(product => {
                                                            return (<li key={product.position} data-position={product.position} onClick={_this.onClick}>
                                                                <div className="row">
                                                                    <div className="col-sm-8">
                                                                        {product.symbol} - {product.name}
                                                                    </div>
                                                                    <div className="col-sm-4">
                                                                        <a href="javascript:;" data-position={product.position} onClick={_this.detail}>Details</a>
                                                                    </div>
                                                                </div>
                                                            </li>);
                                                        })}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <div className="row">
                                        <div className="col-md-12">Book</div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-12">Buy/Sell</div>
                                    </div>
                                </div>
                                <div className="col-md-3">
                                    <div className="row">
                                        <div className="col-md-12">Trades</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});