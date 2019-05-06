var MyProducts = React.createClass({
    requiredModules: [
        'spa/product'
    ],
    componentDidMount() {
        this.emit('index/title', 'My Baskets');
        this.controller.loadMyProducts();
    },
    render() {
        return (
            <div>
                {(!this.state || !this.state.products) && <Loader size="x2" />}
                {this.state && this.state.products &&
                    this.state.products.map((product, i, products) => {
                        if (i % 2 !== 0) {
                            return;
                        }
                        return (
                            <div className="row">
                                <div className="col-md-6">
                                    <Product element={product} />
                                </div>
                                <div className="col-md-6">
                                    {i + 1 < products.length &&
                                        <Product element={products[i + 1]} />
                                    }
                                </div>
                            </div>
                        );
                    })
                }
            </div>
        );
    }
});