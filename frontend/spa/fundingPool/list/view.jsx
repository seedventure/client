var ListFundingPool = React.createClass({
    requiredModules: [
        'spa/fundingPool/create',
        'spa/fundingPool/allow'
    ],
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
                    _this.setState({title: element.prototype.title || (element.prototype.getTitle ? element.prototype.getTitle() : null), element, props });
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
        if(!(this.state && this.state.element && this.state.element !== Products)) {
            props.type = 'section';
            props.view = 'mine';
        }
        return (
            <span>
                <div className="kt-subheader   kt-grid__item" id="kt_subheader">
                    <div className="kt-subheader__main">
                        <h3 className="kt-subheader__title">{(this.state && this.state.title) || "Owned Baskets"}</h3>
                        <span className="kt-subheader__separator"></span>
                        <div className="kt-subheader__breadcrumbs">
                            <a href="javascript:;" onClick={() => this.changeSection(Products)} className="kt-subheader__breadcrumbs-home"><i className="fas fa-home"></i></a>
                            {'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}
                            <a href="javascript:;" onClick={() => this.changeSection(CreateFundingPool)}  className="kt-subheader__breadcrumbs-home"><i className="fas fa-plus"></i></a>
                            {'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}
                            <a href="javascript:;" onClick={() => this.changeSection(AllowFundingPool)}  className="kt-subheader__breadcrumbs-home"><i className="fas fa-money-check"></i></a>
                        </div>
                    </div>
                </div>
                {React.createElement(this.state && this.state.element ? this.state.element : Products, props)}
            </span>
        );
    }
});