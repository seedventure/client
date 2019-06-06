var ListFundingPool = React.createClass({
    requiredModules: [
        'spa/myProducts',
        'spa/fundingPool/create'
    ],
    getTitle() {
        return "My Funding Pools"
    },
    getDefaultSubscriptions() {
        return {
            'section/change': this.changeSection,
        };
    },
    changeSection(element, props) {
        !element && (element = null);
        !props && (props = null);
        if (!element) {
            this.setState({ element: null, props: null });
        } else {
            var _this = this;
            ReactModuleLoader.load({
                modules: element.prototype.requiredModules || [],
                scripts: element.prototype.requiredScripts || [],
                callback: function () {
                    _this.setState({ element, props });
                }
            });
        }
    },
    render() {
        var _this = this;
        var props = {};
        if(this.state && this.state.props) {
            Object.keys(this.state.props).map(i => props[i] = _this.state.props[i]);
        }
        if(!(this.state && this.state.element && this.state.element !== MyProducts)) {
            props.type = 'section'
        }
        return (
            <div>
                <div className="row">
                    <div className="col-md-6">
                        {this.state && this.state.element && this.state.element !== MyProducts && <button type="button" className="btn" onClick={e => this.changeSection()}>My Baskets</button>}
                    </div>
                    <div className="col-md-6">
                        <button type="button" className="btn" onClick={e => this.changeSection(CreateFundingPool)}>New Basket</button>
                    </div>
                </div>
                {React.createElement(this.state && this.state.element ? this.state.element : MyProducts, props)}
            </div>
        );
    }
});