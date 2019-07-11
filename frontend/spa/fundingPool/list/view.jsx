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
    changeSection(element, props, callback) {
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
                    _this.setState({title: element.prototype.title, element, props }, () => callback && setTimeout(callback));
                }
            });
        }
    },
    onElementRef(ref) {
        if(ref === undefined || ref === null) {
            return;
        }
        var title = ref.getTitle ? ref.getTitle() : <h3 key={"default"} className="kt-subheader__title">Owned Baskets</h3>;
        typeof title === 'string' && (title = <h3 key={"built"} className="kt-subheader__title">{title}</h3>);
        if(this.state && this.state.title && this.state.title === title) {
            return;
        }
        if(title && this.state && this.state.title && typeof title !== 'string' && typeof this.state.title !== 'string' && title.key === this.state.title.key) {
            return;
        }
        this.setState({title});
    },
    search(e) {
        e && e.preventDefault();
        this.searchTimeout && clearTimeout(this.searchTimeout);
        var _this = this;
        this.searchTimeout = setTimeout(function() {
            _this.emit('products/search', _this.searchBar.value);
        }, 300);
    },
    clearSearch(e) {
        e && e.preventDefault();
        this.searchBar.value = "";
        this.search();
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
        props.ref = this.onElementRef.bind(this)
        return (
            <span>
                <div className="kt-subheader   kt-grid__item" id="kt_subheader">
                    <div className="kt-subheader__main">
                        {this.state && this.state.title}
                        {this.state && this.state.title && <span className="kt-subheader__separator"></span>}
                        <div className="kt-subheader__breadcrumbs">
                            <a href="javascript:;" onClick={() => this.changeSection(Products)} className="kt-subheader__breadcrumbs-home"><i className="fas fa-home"></i></a>
                            {false && <a href="javascript:;" onClick={() => this.changeSection(AllowFundingPool)} className="kt-subheader__breadcrumbs-home"><i className="fas fa-money-check"></i></a>}
                            {'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}
                            <a href="javascript:;" onClick={() => this.changeSection(CreateFundingPool)} className="kt-subheader__breadcrumbs-home"><i className="fas fa-plus"></i></a>
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
                </div>
                {React.createElement((this.state && this.state.element) || Products, props)}
            </span>
        );
    }
});