var Products = React.createClass({
    requiredModules: [
        'spa/product'
    ],
    getDefaultSubscriptions() {
        return {
            'list/updated': this.controller.loadProducts,
            'products/search': this.search
        };
    },
    componentDidMount() {
        this.controller.loadProducts();
    },
    getProductsArray(all) {
        var products = [];
        if (this.state && this.state.products) {
            var prods = this.state.products;
            Object.keys(prods).map((key) => {
                var prod = prods[key];
                try {
                    if (this.props.view === 'mine' && prod.owner.toLowerCase() !== client.userManager.user.wallet.toLowerCase()) {
                        return;
                    }
                } catch (e) {
                }
                products.push(prod);
            });
        }
        this.props.view !== 'mine' && (products = Enumerable.From(products).Where(it => it.totalSupply === undefined || parseInt(it.totalSupply) > 0).OrderByDescending(it => parseInt(it.position)).ToArray());
        this.props.view === 'mine' && (products = Enumerable.From(products).OrderByDescending(it => parseInt(it.position)).ToArray());
        var search = this.state && this.state.search;
        search && (search = search.toLowerCase());
        search && all !== true && (products = Enumerable.From(products).Where(product => {
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
        e && e.preventDefault();
        this.searchTimeout && clearTimeout(this.searchTimeout);
        var target = e && e.target;
        var _this = this;
        this.searchTimeout = setTimeout(function () {
            _this.setState({ search: target && target.value});
        }, 300);
    },
    render() {
        var products = this.getProductsArray();
        if (products.length === 0) {
            products = this.getProductsArray(true);
            if (products.length === 0) {
                if(this.props.view === 'mine') {
                    return ([
                        <div className="row">
                            <div className="col-md-12">
                                <h2 style={{"text-align" : "center"}}>No baskets right now. You can <a href="javascript:;" onClick={() => this.emit('page/change', CreateFundingPool, {view : 'mine'})}>create a new one</a>.</h2>
                            </div>
                        </div>]
                    );
                }
                return ([
                    <div className="row">
                        <div className="col-md-12">
                            <Loader size="x2" />
                        </div>
                    </div>,
                    <div className="row">
                        <div className="col-md-12">
                            <h2 style={{"text-align" : "center"}}>Reaching new Baskets from the Blockchain...</h2>
                        </div>
                    </div>]
                );
            }
            products = this.getProductsArray();
        }
        return (
            <div className="kt-grid__item kt-grid__item--fluid kt-grid kt-grid--ver kt-grid--stretch">
                <div className="kt-container kt-body kt-grid kt-grid--ver" id="kt_body">
                    <div className="kt-grid__item kt-grid__item--fluid kt-grid kt-grid--hor">
                        <div className="kt-content kt-grid__item kt-grid__item--fluid">
                            {products.map((product, i) => {
                                if (i !== 0 && i % 3 !== 0) {
                                    return;
                                }
                                return (
                                    <div className="row">
                                        <div className="col-xl-4">
                                            <Product key={product.position + product.documentUrl} element={product} view={this.props.view} />
                                        </div>
                                        <div className="col-xl-4">
                                            {i + 1 < products.length &&
                                                <Product key={products[i + 1].position + products[i + 2].documentUrl} element={products[i + 1]} view={this.props.view} />
                                            }
                                        </div>
                                        <div className="col-xl-4">
                                            {i + 2 < products.length &&
                                                <Product key={products[i + 2].position + products[i + 2].documentUrl} element={products[i + 2]} view={this.props.view} />
                                            }
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});