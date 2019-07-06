var Products = React.createClass({
    requiredModules: [
        'spa/product'
    ],
    getDefaultSubscriptions() {
        return {
            'list/updated': this.controller.loadProducts,
            'fundingPanel/updated': this.productUpdated,
            'products/search' : search => this.search(undefined, search)
        };
    },
    productUpdated(product) {
        this.state.products[product.position] = product;
        this.setState({ products: this.state.products });
    },
    componentDidMount() {
        this.controller.loadProducts();
    },
    componentDidUpdate() {
        this.controller.retryUnavailableProducts();
        this.state && this.state.search && this.searchBar && (this.searchBar.value = this.state.search);
    },
    getProductsArray(availableOnly, all) {
        var favorites = undefined;
        if (all !== true) {
            try {
                favorites = this.props.view !== 'mine' ? favorites : Enumerable.From(client.userManager.user.list);
            } catch (e) {
            }
        }
        var products = [];
        if (this.state && this.state.products) {
            var prods = this.state.products;
            Object.keys(prods).map((key) => {
                if (favorites && !favorites.Contains(key)) {
                    return;
                }
                var prod = prods[key];
                if (availableOnly !== true || prod.unavailable !== true) {
                    products.push(prod);
                }
            });
        }
        this.props.view !== 'mine' && (products = Enumerable.From(products).Where(it => parseInt(it.totalSupply) > 0).OrderByDescending(it => parseInt(it.position)).ToArray());
        this.props.view === 'mine' && (products = Enumerable.From(products).OrderByDescending(it => parseInt(it.totalSupply)).ToArray());
        var search = this.state && this.state.search;
        search && (search = search.toLowerCase());
        search && all !== true && (products = Enumerable.From(products).Where(product => {
            if(product.fundingPanelAddress && product.fundingPanelAddress.toLowerCase().indexOf(search) !== -1) {
                return true;
            }
            if(product.name && product.name.toLowerCase().indexOf(search) !== -1) {
                return true;
            }
            if(product.name && product.symbol.toLowerCase().indexOf(search) !== -1) {
                return true;
            }
            if(product.tags && product.tags.length > 0 && Enumerable.From(product.tags).Any(it => it.toLowerCase().indexOf(search) !== -1)) {
                return true;
            }
            return false;
        }).ToArray());
        return products;
    },
    search(e, search) {
        e && e.preventDefault();
        this.searchTimeout && clearTimeout(this.searchTimeout);
        var _this = this;
        this.searchTimeout = setTimeout(function() {
            _this.setState({search : (_this.searchBar && _this.searchBar.value) || search});
        }, 300);
    },
    clearSearch(e) {
        e && e.preventDefault();
        this.searchBar.value = "";
        this.search();
    },
    render() {
        var products = this.getProductsArray(true);
        if (products.length === 0) {
            products = this.getProductsArray(true, true);
            if (products.length === 0) {
                return <Loader size="x2" />
            }
            products = this.getProductsArray(true);
        }
        return (
            <span>
                {this.props.view !== 'mine' && <div className="kt-subheader kt-grid__item" id="kt_subheader">
                    <div className="kt-subheader__main">
                        <h3 className="kt-subheader__title">Baskets</h3>
                        <span className="kt-subheader__separator"></span>
                        <div className="kt-subheader__breadcrumbs">
                            <a href="#" className="kt-subheader__breadcrumbs-home"><i className="fas fa-home"></i></a>
                        </div>
                    </div>
                    {(!this.state || !this.state.element || this.state.element === Products) && <div className="kt-subheader__main">
                        <input type="text" placeholder="Search..." onChange={this.search} ref={ref => this.searchBar = ref}/>
                        {'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}
                        <span className="kt-subheader__separator"></span>
                        <div className="kt-subheader__breadcrumbs">
                            <a href="#" className="kt-subheader__breadcrumbs-home" onClick={this.clearSearch}><i className="fas fa-remove"></i></a>
                        </div>
                    </div>}
                </div>}
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
                                                <Product key={product.position} element={product} type={this.props.type} view={this.props.view} />
                                            </div>
                                            <div className="col-xl-4">
                                                {i + 1 < products.length &&
                                                    <Product key={products[i + 1].position} element={products[i + 1]} type={this.props.type} view={this.props.view} />
                                                }
                                            </div>
                                            <div className="col-xl-4">
                                                {i + 2 < products.length &&
                                                    <Product key={products[i + 2].position} element={products[i + 2]} type={this.props.type} view={this.props.view} />
                                                }
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </span>
        );
    }
});