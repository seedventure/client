var Members = React.createClass({
    requiredModules: [
        'spa/member'
    ],
    getDefaultSubscriptions() {
        var position = this.getProduct().position;
        var subscriptions = {};
        subscriptions['fundingPanel/' + position + '/updated'] = element => this.setState({ product: element });
        return subscriptions;
    },
    getProduct() {
        return this.state && this.state.product ? this.state.product : this.props.element;
    },
    getMembers() {
        var members = Enumerable.From(this.getProduct().members || []).Distinct(it => it.position);
        if(this.state && this.state.search) {
            var search = this.state.search.toLowerCase();
            members = members.Where(it => it.name.toLowerCase().indexOf(search) === 0);
        }
        return members.ToArray();
    },
    search(e) {
        e && e.preventDefault();
        this.searchTimeout && clearTimeout(this.searchTimeout);
        var target = this.searchBar;
        var _this = this;
        this.searchTimeout = setTimeout(function () {
            _this.setState({ search: target && target.value});
        }, 300);
    },
    clearSearch(e) {
        e && e.preventDefault();
        this.searchBar.value = '';
        this.search();
    },
    render() {
        var product = this.getProduct();
        var members = this.getMembers();
        return (
            <div className="kt-grid__item kt-grid__item--fluid kt-grid kt-grid--ver kt-grid--stretch">
                <div className="kt-container kt-body kt-grid kt-grid--ver" id="kt_body">
                    <div className="kt-grid__item kt-grid__item--fluid kt-grid kt-grid--hor">
                        <div className="kt-content kt-grid__item kt-grid__item--fluid">
                            <div className="row">
                                <div className="col-md-12">
                                    <div className="searchBar">
                                        <div className="row">
                                            <div className="col-sm-10 separator">
                                                <input type="text" placeholder="Search..." onChange={this.search} ref={ref => this.searchBar = ref} />
                                            </div>
                                            <div className="col-sm-2 clear">
                                                <a href="#" className="kt-subheader__breadcrumbs-home" onClick={this.clearSearch}><i className="fas fa-remove"></i></a>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {members.length === 0 && <h1>No Startups right now</h1>}
                            {members.length > 0 && members.map((member, i) => {
                                if (i !== 0 && i % 3 !== 0) {
                                    return;
                                }
                                return (
                                    <div className="row">
                                        <div className="col-xl-4">
                                            <Member key={i + ''} parent={product} element={member} view={this.props.view} />
                                        </div>
                                        <div className="col-xl-4">
                                            {i + 1 < members.length &&
                                                <Member key={(i + 1) + ''} parent={product} element={members[i + 1]} view={this.props.view} />
                                            }
                                        </div>
                                        <div className="col-xl-4">
                                            {i + 2 < members.length &&
                                                <Member key={(i + 2) + ''} parent={product} element={members[i + 2]} view={this.props.view} />
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