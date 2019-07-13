var Detail = React.createClass({
    requiredModules: [
        'spa/members'
    ],
    getTitle() {
        return (this.props.parent ? <span>Startup of <strong>{this.props.parent.name}</strong></span> : this.getProduct().name);
    },
    back(e) {
        e && e.preventDefault();
        var _this = this;
        var parent = _this.props.parent;
        this.emit('page/change', parent ? Detail : Products, { element: parent, parent: null, fromBack: true, view: this.props.view }, () => parent && _this.setProduct(parent));
    },
    getProduct() {
        return this.state && this.state.product ? this.state.product : this.props.element;
    },
    getDefaultSubscriptions() {
        var position = this.getProduct().position;
        var subscriptions = {};
        subscriptions['product/set'] = this.setProduct;
        subscriptions['fundingPanel/' + position + '/updated'] = element => this.setState({ product: element });
        return subscriptions;
    },
    setProduct(product) {
        var _this = this;
        this.setState({ product, documents: product.documents }, function () {
            _this.forceUpdate();
            setTimeout(() => _this.setState({ product }, () => _this.updateGui()));
        });
    },
    updateNavLinks() {
        this.domRoot.children().find('.active').removeClass('active');
        this.domRoot.children().find('a.nav-link').click(function () {
            $($(this).parents('.nav-tabs')).children().find('a.nav-link').removeClass('active');
            $(this).addClass('active');
        });
        this.domRoot.children().find('ul.nav-tabs').children('li.nav-item:first-of-type').children('a.nav-link').click();
        this.props.fromBack === true && this.domRoot.children().find('ul.nav-tabs:first-of-type').first().children('li.nav-item:last-of-type').children('a.nav-link').click();
    },
    updateGui() {
        this.updateNavLinks();
        this.updateProgressBar();
    },
    componentDidUpdate() {
        this.updateProgressBar();
    },
    updateProgressBar() {
        if (this.props.parent || !this.progressBar) {
            return;
        }
        var product = this.getProduct();
        var totalSupply = parseInt(Utils.numberToString(product.totalSupply));
        isNaN(totalSupply) && (totalSupply = 0);
        var totalRaised = parseInt(Utils.numberToString(product.totalRaised));
        isNaN(totalRaised) && (totalRaised = 0);
        var percentage = parseFloat(((totalRaised / totalSupply) * 100).toFixed(2));
        totalRaised = Utils.roundWei(totalRaised);
        totalSupply = Utils.roundWei(totalSupply);
        this.progressBar.attr('aria-valuenow', percentage).css('width', percentage + '%').css('color', percentage > 6 ? "white" : "black").html(totalRaised + ' of ' + totalSupply + ' SEEDs raised');
    },
    componentDidMount() {
        this.updateGui();
        var _this = this;
        this.setState({ documents: this.getProduct().documents }, function() {
            _this.controller.updateInvestments();
        });
    },
    cleanNumber(target) {
        var value = target.value.split(' ').join('').split(',').join('');
        if(value.indexOf('.') !== -1) {
            var s = value.split('.');
            var last = s.pop();
            value = s.join('') + '.' + last;
        }
        return value;
    },
    parseNumber(e) {
        e && e.preventDefault();
        var _this = this;
        var target = e.target;
        this.localeTimeout && clearTimeout(this.localeTimeout);
        this.localeTimeout = setTimeout(function() {
            try {
                var value = _this.cleanNumber(target);
                value = parseFloat(value);
                if(isNaN(value)) {
                    target.value = '';
                    return;
                }
                value = value.toLocaleString(value);
                target.value = value;
            } catch(e) {
                console.error(e);
            }
        }, 450);
    },
    ok(e) {
        e && e.preventDefault();
        var investment = 0;
        var investmentFloat;
        try {
            investment = this.cleanNumber(this.investment);
            investmentFloat = parseFloat(investment);
        } catch(e) {
        }
        if(isNaN(investmentFloat) || investmentFloat <= 0) {
            alert('Investment must be a number greater than zero');
            return;
        }
        this.controller.invest(investment);
    },
    render() {
        var product = this.getProduct();
        var description = '';
        try {
            description = $.base64.decode(product.description);
        } catch (e) {
        }
        var full = false;
        try {
            full = parseInt(product.totalRaised) >= parseInt(product.totalSupply);
        } catch(e) {
        }
        return (
            <div className="kt-content kt-grid__item kt-grid__item--fluid">
                <div className="row">
                    <div className="col-md-2">
                        <h4>Name</h4>
                        <p className="small">of the {(this.props.parent && "Startup") || "Incubator"}</p>
                    </div>
                    <div className="col-md-2">
                        <h2>{product.name}</h2>
                    </div>
                    <div className="col-md-8">
                        {client.configurationManager.hasUnlockedUser() && <div className="investments">
                            <div className="row">
                                <div className="col-md-12"><h3>You already invested <strong><span ref={ref => this.seeds = ref}>0.00</span> SEEDS</strong> in this Basket</h3></div>
                            </div>
                            <div className="row">
                                <div className="col-md-12">
                                    <br />
                                    <h3>You have <strong><span ref={ref => this.tokens = ref}>0.00</span> tokens</strong> of this Basket</h3>
                                </div>
                            </div>
                            {full !== true && <div className="row" ref={ref => this.whiteList = ref}>
                                <div className="col-md-12">
                                    <br />
                                    <h3>You are NOT whitelisted. Start the procedure <a href="http://seedventure.io">here</a></h3>
                                </div>
                            </div>}
                            {full !== true && <div className="row">
                                <div className="col-md-12">
                                    <br />
                                    <form className="kt-form" action="">
                                        <div className="row">
                                            <div className="col-md-8">
                                                <div className="form-group">
                                                    <input className="form-control form-control-last" type="text" onChange={this.parseNumber} placeholder="Invest" name="invest" ref={ref => this.investment = ref}/>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <button className="btn btn-brand btn-pill btn-elevate" onClick={this.ok}>Invest</button>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>}
                            {full === true && <h2>This Basked has reached its goal!</h2>}
                        </div>}
                        {full !== true && !client.configurationManager.hasUnlockedUser() && <div className="investments">
                            <h3>To invest in this Basket you need to <a href="#" onClick={() => this.emit('page/change', CreateConfiguration)}>create a new wallet</a> or <a href="#" onClick={() => this.emit('page/change', ImportConfiguration)}>import an existing one</a></h3>
                        </div>}
                    </div>
                </div>
                <br />
                <br />
                {!this.props.parent && <div className="progress">
                    <div className="progress-bar" role="progressbar" ref={ref => this.progressBar = $(ref)} aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">25%</div>
                </div>}
                <br />
                <br />
                <div className="row">
                    <div className="col-xl-12 mt-5">
                        <ul className="nav nav-tabs nav-tabs-line nav-tabs-bold nav-tabs-line-3x mb-5" role="tablist">
                            <li className="nav-item">
                                <a className="nav-link" data-toggle="tab" href="#main-data" role="tab"><i className="fa fa-info-circle mr-2"></i>Main Info</a>
                            </li>
                            {!this.props.parent && <li className="nav-item">
                                <a className="nav-link" data-toggle="tab" href="#economic-data" role="tab"><i className="fas fa-coins mr-2"></i>Economic Info</a>
                            </li>}
                            {!this.props.parent && <li className="nav-item">
                                <a className="nav-link" data-toggle="tab" href="#members" role="tab"><i className="fas fa-rocket mr-2"></i>Startups</a>
                            </li>}
                        </ul>
                        <div className="tab-content">
                            <div className="tab-pane" id="main-data" role="tabpanel">
                                <form className="kt-form" action="">
                                    {this.state && this.state.documents && this.state.documents.length > 0 && [<div className="row">
                                        <div className="col-md-12">
                                            <h3>Documents</h3>
                                            <p className="small">useful to enrich the description of the business model</p>
                                        </div>
                                    </div>,
                                    <br />,
                                    <br />,
                                    <div>
                                        {this.state.documents.map((it, i) =>
                                            <div key={'document_' + i} className="row">
                                                <div className="col-md-2">
                                                </div>
                                                <div className="col-md-10">
                                                    <h2>
                                                        <a href={it.link} target="_blank">{it.name}</a>
                                                    </h2>
                                                </div>
                                            </div>
                                        )}
                                    </div>,
                                    <br />,
                                    <br />]}
                                    <div className="row">
                                        <div className="col-md-2">
                                            <h4>URL</h4>
                                            <p className="small">The website of the {this.props.parent ? "Startup" : "Incubator"}</p>
                                        </div>
                                        <div className="col-md-10">
                                            {!product.url && <h2>None</h2>}
                                            {product.url && <a href={product.url} target="_target">{product.url}</a>}
                                        </div>
                                    </div>
                                    <br />
                                    <div className="row">
                                        <div className="col-md-2">
                                            <h4>Logo</h4>
                                            <p className="small">of the {this.props.parent ? "Startup" : "Incubator"}</p>
                                        </div>
                                        <div className="col-md-10">
                                            {!product.image && <h2>None</h2>}
                                            {product.image && <img width="100" height="100" ref={ref => this.image = $(ref)} src={product.image ? ("data:image/png;base64, " + product.image) : ''} />}
                                        </div>
                                    </div>
                                    {!this.props.parent && <br />}
                                    {!this.props.parent && <div className="row">
                                        <div className="col-md-2">
                                            <h4>Tags</h4>
                                            <p className="small">useful for searches by the investor</p>
                                        </div>
                                        <div className="col-md-10">
                                            {!product.tags && <h2>None</h2>}
                                            {product.tags && <h2>{product.tags.join(' ')}</h2>}
                                        </div>
                                    </div>}
                                    <br />
                                    <br />
                                </form>
                            </div>
                            {!this.props.parent && <div className="tab-pane" id="economic-data" role="tabpanel">
                                <form className="kt-form" action="">
                                    <div className="row">
                                        <div className="col-md-2">
                                            <h4>SEED Rate</h4>
                                            <p className="small">the value in SEED of every single Token</p>
                                        </div>
                                        <div className="col-md-10">
                                            <h2>{Utils.roundWei(product.seedRate)} SEED</h2>
                                        </div>
                                    </div>
                                    <br />
                                    <div className="row">
                                        <div className="col-md-2">
                                            <h4>Exchange Rate On Top</h4>
                                            <p className="small">the amount hold by the incubator from each donation</p>
                                        </div>
                                        <div className="col-md-10">
                                            <h2>{Utils.roundWei(product.exchangeRateOnTop)} SEED</h2>
                                        </div>
                                    </div>
                                    <br />
                                    <div className="row">
                                        <div className="col-md-2">
                                            <h4>Total Supply</h4>
                                            <p className="small">The amount to raise in this campaign</p>
                                        </div>
                                        <div className="col-md-10">
                                            <h2>{Utils.roundWei(product.totalSupply)} SEED</h2>
                                        </div>
                                    </div>
                                    <br />
                                    <div className="row">
                                        <div className="col-md-2">
                                            <h4>White List Threshold Balance</h4>
                                            <p className="small">the maximum amount of investment that does not require whitelisting</p>
                                        </div>
                                        <div className="col-md-10">
                                            <h2>{Utils.roundWei(product.whiteListThreshold)} SEED</h2>
                                        </div>
                                    </div>
                                </form>
                            </div>}
                            {!this.props.parent && <div className="tab-pane" id="members" role="tabpanel">
                                <Members element={product} view={this.props.view} />
                            </div>}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});