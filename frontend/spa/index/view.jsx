var Index = React.createClass({
    requiredModules: [
        'spa/products',
        'spa/user',
        'spa/unlock',
        'spa/myProducts'
    ],
    getDefaultSubscriptions() {
        return {
            'page/change': this.changePage,
            'index/title': title => this.setState({ title })
        };
    },
    changePage(element, props) {
        !element && (element = null);
        !props && (props = null);
        if(!element) {
            this.setState({title: null, element: null, props: null});
        } else {
            var _this = this;
            ReactModuleLoader.load({
                modules: element.prototype.requiredModules || [],
                scripts: element.prototype.requiredScripts || [],
                callback: function() {
                    _this.setState({title: element.prototype.title || (element.prototype.getTitle ? element.prototype.getTitle() : null), element, props});
                }
            });
        }
    },
    getDefaultRenderer() {
        return !client.configurationManager.hasUser() ? Products : client.configurationManager.hasUnlockedUser() ? MyProducts : Unlock;
    },
    render() {
        return (
            <div>
                <div className="row">
                    <div className="col-md-6">
                        <h1>
                            {this.state && this.state.element && <a className="back" href="javascript:;" onClick={() => this.changePage()}>{"<"}{'\u00A0'}{'\u00A0'}{'\u00A0'}</a>}
                            {this.state && this.state.title}
                        </h1>
                    </div>
                    <div className="col-md-6">
                        <User/>
                    </div>
                </div>
                {React.createElement(this.state && this.state.element ? this.state.element : this.getDefaultRenderer(), this.state && this.state.props ? this.state.props : null)}
            </div>
        );
    }
});