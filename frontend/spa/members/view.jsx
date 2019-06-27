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
        return Enumerable.From(this.getProduct().members || []).Distinct(it => it.position).ToArray();
    },
    render() {
        var product = this.getProduct();
        var members = this.getMembers();
        return (
            <div className="kt-grid__item kt-grid__item--fluid kt-grid kt-grid--ver kt-grid--stretch">
                <div className="kt-container kt-body kt-grid kt-grid--ver" id="kt_body">
                    <div className="kt-grid__item kt-grid__item--fluid kt-grid kt-grid--hor">
                        <div className="kt-content kt-grid__item kt-grid__item--fluid">
                            {members.length === 0 && <h1>No members right now</h1>}
                            {members.length > 0 && members.map((member, i) => {
                                if (i !== 0 && i % 3 !== 0) {
                                    return;
                                }
                                return (
                                    <div className="row">
                                        <div className="col-xl-4">
                                            <Member key={i + ''} parent={product} element={member} type={this.props.type} view={this.props.view} />
                                        </div>
                                        <div className="col-xl-4">
                                            {i + 1 < members.length &&
                                                <Member key={(i + 1) + ''} parent={product} element={members[i + 1]} type={this.props.type} view={this.props.view} />
                                            }
                                        </div>
                                        <div className="col-xl-4">
                                            {i + 2 < members.length &&
                                                <Member key={(i + 2) + ''} parent={product} element={members[i + 2]} type={this.props.type} view={this.props.view} />
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