var Detail = React.createClass({
    requiredModules: [
        'spa/members'
    ],
    getTitle() {
        return (this.props.parent ? <span>Startup of <strong>{this.props.parent.name}</strong></span> : this.getProduct().name);
    },
    back(e) {
        e && e.preventDefault() && e.stopPropagation();
        var _this = this;
        var parent = _this.props.parent;
        this.emit('page/change', parent ? Detail : Products, { element: parent, parent: null, fromBack: true, view: this.props.view }, () => parent && _this.setProduct(parent));
    },
    trade(e) {
        e && e.preventDefault() && e.stopPropagation();
        this.emit('page/change', Dex, { element: this.getProduct() });
    },
    getProduct() {
        return this.state && this.state.product ? this.state.product : this.props.element;
    },
    getDefaultSubscriptions() {
        var product = this.getProduct();
        var position = product.position;
        var subscriptions = {};
        subscriptions['product/set'] = this.setProduct;
        subscriptions['fundingPanel/' + position + '/updated'] = (product, member) => this.setProduct((this.props.parent && member) || product, this.controller.updateInvestments);
        return subscriptions;
    },
    setProduct(product, callback) {
        var _this = this;
        this.setState({ product, documents: product.documents }, function () {
            _this.forceUpdate();
            setTimeout(() => _this.setState({ product, documents: product.documents }, () => {
                _this.updateGui();
                callback && callback();
            }));
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
        var product = this.getProduct();
        var totalSupply = parseInt(Utils.numberToString(product.totalSupply));
        isNaN(totalSupply) && (totalSupply = 0);
        var totalRaised = parseInt(Utils.numberToString(product.totalRaised));
        isNaN(totalRaised) && (totalRaised = 0);
        var percentage = parseFloat(((totalRaised / totalSupply) * 100).toFixed(2));
        totalRaised = Utils.roundWei(totalRaised);
        totalSupply = Utils.roundWei(totalSupply);
        this.progressBar && this.progressBar.attr('aria-valuenow', percentage).css('width', percentage + '%').css('color', percentage > 6 ? "white" : "black").html(totalRaised + ' of ' + totalSupply + ' SEEDs raised');
    },
    componentDidMount() {
        this.updateGui();
        var product = this.getProduct();
        var _this = this;
        client.contractsManager.getFundingPanelData(product).then(function (p) {
            return p && p.name && !p.unavailable && _this.setState({product: p, documents: _this.getProduct().documents}, _this.controller.updateInvestments);
        });
    },
    onInvestChange(e) {
        Utils.parseNumber(e, this.investChanged);
    },
    investChanged() {
        var investment = Utils.cleanNumber(this.investment);
        if (isNaN(investment)) {
            this.forYou.innerHTML = Utils.roundWei();
            return;
        }
        var product = this.getProduct();
        var forYou = parseFloat(web3.utils.fromWei(Utils.numberToString(product.seedRate)), 'ether') * investment;
        this.forYou.innerHTML = Utils.roundWei(web3.utils.toWei(Utils.numberToString(forYou), 'ether'));
    },
    ok(e) {
        e && e.preventDefault() && e.stopPropagation();
        var investment = 0;
        var investmentFloat;
        try {
            investment = Utils.numberToString(Utils.cleanNumber(this.investment));
            investmentFloat = parseFloat(investment);
        } catch (e) {
        }
        if (isNaN(investmentFloat) || investmentFloat <= 0) {
            alert('Investment must be a number greater than zero');
            return;
        }
        this.controller.invest(investment);
    },
    toggleFavorite(e) {
        e && e.preventDefault() && e.stopPropagation();
        var product = this.getProduct();
        var save = function() {
            client.persistenceManager.set(client.persistenceManager.PERSISTENCE_PROPERTIES.tradingNotifications, client.persistenceManager.get(client.persistenceManager.PERSISTENCE_PROPERTIES.tradingNotifications));
        }
        try {
            if (product.investors[client.userManager.user.wallet.toLowerCase()] && product.investors[client.userManager.user.wallet.toLowerCase()] > 0) {
                return save();
            }
        } catch (e) {
        }
        var add = $(e.target).toggleClass('favorite').hasClass('favorite');
        try {
            client.userManager.user.list = Enumerable.From(client.userManager.user.list).Distinct().OrderBy(it => it).ToArray();
            if (add) {
                client.userManager.user.list.push(product.position);
                return save();
            }
            for (var i in client.userManager.user.list) {
                var position = client.userManager.user.list[i];
                if (position === product.position) {
                    client.userManager.user.list.splice(i, 1);
                    return save();
                }
            }
        } catch (e) {
        }
        return save();
    },
    toggleTradeNotifications(e) {
        e && e.preventDefault() && e.stopPropagation();
        var product = this.getProduct();
        var add = $(e.target).toggleClass('favorite').hasClass('favorite');
        !client.userManager.user.tradeNotifications && (client.userManager.user.tradeNotifications = []);
        var save = function() {
            client.persistenceManager.set(client.persistenceManager.PERSISTENCE_PROPERTIES.tradingNotifications, client.persistenceManager.get(client.persistenceManager.PERSISTENCE_PROPERTIES.tradingNotifications));
        }
        try {
            client.userManager.user.tradeNotifications = Enumerable.From(client.userManager.user.tradeNotifications).Distinct().OrderBy(it => it).ToArray();
            if (add) {
                client.userManager.user.tradeNotifications.push(product.position);
                return save();
            }
            for (var i in client.userManager.user.tradeNotifications) {
                var position = client.userManager.user.tradeNotifications[i];
                if (position === product.position) {
                    client.userManager.user.tradeNotifications.splice(i, 1);
                    return save();
                }
            }
        } catch (e) {
        }
        return save();
    },
    renderPortfolioValue() {
        var product = this.getProduct();
        if (!this.props.parent) {
            var value = client.contractsManager.getPortfolioValue(product);
            return value === 'NONE' ? value : Utils.numberToString(value, true)
        }
        return !product.portfolioValue || product.portfolioValue <= 0 ? 'NONE' : Utils.numberToString(Utils.normalizeBasketSuccessFee(product.portfolioValue), true);
    },
    renderPortfolioCurrency() {
        var product = this.getProduct();
        if (!this.props.parent) {
            return client.contractsManager.getPortfolioCurrency(product);
        }
        return this.renderPortfolioValue() === 'NONE' ? '' : (product.portfolioCurrency || "EUR");
    },
    render() {
        var product = this.getProduct();
        var invisible = true;
        try {
            invisible = product.visibility == 2 || (product.visibility == 1 && !Enumerable.From(product.whiteList).Any(it => it.toLowerCase() === client.userManager.user.wallet.toLowerCase()));
        } catch(e) {
        }
        if(invisible) {
            return (
                <div className="kt-content kt-grid__item kt-grid__item--fluid">
                    <br/>
                    <br/>
                    <br/>
                    <br/>
                    <h1>This Basket is not available right now, please contact incubator.</h1>
                </div>
            );
        }
        var sticker = (this.props.parent || product).sticker;
        var favorite = false;
        try {
            favorite = Enumerable.From(client.userManager.user.list).Any(it => product.position === it);
        } catch (e) {
        }
        if (!favorite) {
            try {
                favorite = (product.investors[client.userManager.user.wallet.toLowerCase()] && product.investors[client.userManager.user.wallet.toLowerCase()] > 0);
            } catch (e) {
            }
        }
        var tradeNotifications = false;
        try {
            tradeNotifications = Enumerable.From(client.userManager.user.tradeNotifications).Any(it => product.position === it);
        } catch (e) {
        }
        var description = '';
        try {
            description = $.base64.decode(product.description);
        } catch (e) {
        }
        try {
            description = decodeURI(description);
        } catch (e) {
        }
        var p = document.createElement('p');
        p.innerHTML = description;
        p.innerText.split(' ').join('').trim() === '' && (description = undefined);
        var full = false;
        try {
            full = product.totalRaised >= product.totalSupply;
        } catch (e) {
        }
        return (
            <div className="kt-content kt-grid__item kt-grid__item--fluid">
                {full === true && <h2>{"This " + (this.props.parent ? "Startup" : "Basket") + " has reached its goal!"}</h2>}
                {(!this.props.parent || product.totalSupply) && <div className="progress">
                        <div className="progress-bar" role="progressbar" ref={ref => this.progressBar = $(ref)} aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">25%</div>
                    </div>}
                {!this.props.parent && <h3><strong>{Utils.roundWei(product.totalUnlocked)}</strong>{" SEED Tokens " + (this.props.parent ? "Raised by this Startup" : "Unlocked for its Startups")}</h3>}
                {this.props.parent && product.productPosition !== undefined && <h3>This Startup raised <strong>{Utils.roundWei(product.totalRaised)}</strong> SEED Tokens Unlocked from this Basket</h3>}
                {full !== true && !client.configurationManager.hasUnlockedUser() && <div className="investments">
                    <h3>To invest in this Basket you need to <a href="#" onClick={() => this.emit('page/change', CreateConfiguration)}>create a new wallet</a> or <a href="#" onClick={() => this.emit('page/change', ImportConfiguration)}>import an existing one</a></h3>
                </div>}
                {client.configurationManager.hasUnlockedUser() && <div className="row">
                    <div className="col-md-12">
                        <h3>You already invested <strong><span ref={ref => this.seeds = ref}>0.00</span> SEEDS</strong> in this Basket and actually hold <strong><span ref={ref => this.tokens = ref}>0.00</span> {product.symbol}</strong> tokens.</h3>
                    </div>
                </div>}
                {full !== true && client.configurationManager.hasUnlockedUser() &&
                    <div className="row" ref={ref => this.whiteList = ref}>
                        <div className="col-md-12">
                            <br />
                            <h3></h3>
                        </div>
                    </div>}
                {!this.props.parent && client.configurationManager.hasUnlockedUser() && full !== true && <form className="kt-form" action="">
                    <br />
                    <br />
                    <div className="row">
                        <div className="col-md-1">
                            <h3>Invest</h3>
                        </div>
                        <div className='col-md-3'>
                            <div className="form-group">
                                <input className="form-control form-control-last" type="text" onChange={this.onInvestChange} placeholder={Utils.roundWei()} ref={ref => this.investment = ref} />
                            </div>
                        </div>
                        <div className="col-md-6">
                            <h3>SEEDS and will receive <strong ref={ref => this.forYou = ref}>{Utils.roundWei()}</strong> {product.symbol} tokens.</h3>
                        </div>
                        <div className="col-md-1">
                            <button className="btn btn-brand btn-pill" onClick={this.ok}>Invest</button>
                        </div>
                    </div>
                </form>}
                {!this.props.parent &&
                    <div className="row">
                        <div className="col-md-8 mt-5">
                            <h3><a href="javascript:;" onClick={this.trade}>Trade</a></h3>
                        </div>
                        <div className="col-md-2 mt-5">
                            {client.configurationManager.hasUnlockedUser() && <h2><a href="javascript:;" onClick={this.toggleFavorite} ><i className={"fa fa-star" + (favorite ? " favorite" : "")} aria-hidden="true"></i></a></h2>}
                            <h4>Favorite</h4>
                        </div>
                        <div className="col-md-2 mt-5">
                            {client.configurationManager.hasUnlockedUser() && <h2><a href="javascript:;" onClick={this.toggleTradeNotifications} ><i className={"fa fa-money" + (tradeNotifications ? " favorite" : "")} aria-hidden="true"></i></a></h2>}
                            <h4>Receive Trading notifications</h4>
                        </div>
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
                                    <div className="row">
                                        <div className="col-md-2">
                                            <h4>Name</h4>
                                            <p className="small">of the {(this.props.parent && "Startup") || "Incubator"}</p>
                                        </div>
                                        <div className="col-md-10">
                                            <h2>{product.name}</h2>
                                        </div>
                                    </div>
                                    {!this.props.parent && product.sticker && <br />}
                                    {!this.props.parent && product.sticker && <br />}
                                    {!this.props.parent && product.sticker && <div className="row">
                                        <div className="col-md-2">
                                            <h4>Association</h4>
                                            <p className="small">of the Incubator</p>
                                        </div>
                                        <div className="col-md-5">
                                            <a href={product.stickerUrl} target="_blank">{product.stickerUrl}</a>
                                        </div>
                                        <div className="col-md-5">
                                            <img width="100" height="100" ref={ref => this.image = $(ref)} src={"data:image/png;base64, " + product.sticker} />
                                        </div>
                                    </div>}
                                    <br />
                                    <br />
                                    <div className="row">
                                        <div className="col-md-2">
                                            <h4>Description</h4>
                                            <p className="small">of the {(this.props.parent && "Startup") || "Incubator"}</p>
                                        </div>
                                        <div className="col-md-10">
                                            {!description ? 'None' : <p className="description" ref={ref => ref && (ref.innerHTML = description)}></p>}
                                        </div>
                                    </div>
                                    <br />
                                    <br />
                                    {!this.props.parent && <div className="row">
                                        <div className="col-md-2">
                                            <h4>Symbol</h4>
                                            <p className="small">of the token</p>
                                        </div>
                                        <div className="col-md-10">
                                            <h2>{product.symbol}</h2>
                                        </div>
                                    </div>}
                                    <br />
                                    <br />
                                    <div className="row">
                                        <div className="col-md-2">
                                            <h4>{"Wallet" + (this.props.parent ? "" : " on top")}</h4>
                                            <p className="small">{"The Ethereum wallet which will " + (this.props.parent ? "store the unlocked" : "raise the") + " funds"}</p>
                                        </div>
                                        <div className="col-md-10">
                                            <h2><a href={client.persistenceManager.get(client.persistenceManager.PERSISTENCE_PROPERTIES.etherscanURL) + 'address/' + (this.props.parent ? product.address : product.walletOnTop)} target="_blank">{this.props.parent ? product.address : product.walletOnTop}</a></h2>
                                        </div>
                                    </div>
                                    <br />
                                    <br />
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
                                                    {'\u00A0'}
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
                                    {this.props.parent && product.totalSupply && <br />}
                                    {this.props.parent && product.totalSupply && <div className="row">
                                        <div className="col-md-4">
                                            <h4>Total Supply</h4>
                                            <p className="small">The amount of SEED tokens this startup needs to raise</p>
                                        </div>
                                        <div className="col-md-8">
                                            <h2>{Utils.roundWei(product.totalSupply)} SEED</h2>
                                        </div>
                                    </div>}
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
                                    {this.props.parent && <br />}
                                    {this.props.parent && <div className="row">
                                        <div className="col-md-4">
                                            <h4>Startup value</h4>
                                            <p className="small">The extimated value of the startup, expressed in local currency</p>
                                        </div>
                                        <div className="col-md-8 relative">
                                            <h2>{this.renderPortfolioValue() + " " + this.renderPortfolioCurrency()}</h2>
                                            {sticker && this.renderPortfolioValue() !== 'NONE' && <div className="sticker">
                                                Verified by {'\u00A0\u00A0\u00A0\u00A0'}<img width="30" height="30" src={"data:image/png;base64, " + sticker} />
                                            </div>}
                                        </div>
                                    </div>}
                                    <br />
                                    <br />
                                </form>
                            </div>
                            {!this.props.parent && <div className="tab-pane" id="economic-data" role="tabpanel">
                                <form className="kt-form" action="">
                                    <div className="row">
                                        <div className="col-md-4">
                                            <h4>Exchange Rate</h4>
                                            <p className="small">the amount of {product.symbol} tokens the investor will receive for every invested SEED</p>
                                        </div>
                                        <div className="col-md-8">
                                            <h2>{Utils.roundWei(product.seedRate)} {product.symbol}</h2>
                                        </div>
                                    </div>
                                    <br />
                                    <div className="row">
                                        <div className="col-md-4">
                                            <h4>Exchange Rate On Top</h4>
                                            <p className="small">the amount of {product.symbol} tokens the incubator will receive for every invested SEED</p>
                                        </div>
                                        <div className="col-md-8">
                                            <h2>{Utils.roundWei(product.exchangeRateOnTop)} {product.symbol}</h2>
                                        </div>
                                    </div>
                                    <br />
                                    <div className="row">
                                        <div className="col-md-4">
                                            <h4>Total Supply</h4>
                                            <p className="small">The amount of SEED tokens this basket needs to raise</p>
                                        </div>
                                        <div className="col-md-8">
                                            <h2>{Utils.roundWei(product.totalSupply)} SEED</h2>
                                        </div>
                                    </div>
                                    <br />
                                    <div className="row">
                                        <div className="col-md-4">
                                            <h4>White List Threshold Balance</h4>
                                            <p className="small">the maximum amount of {product.symbol} tokens that each investor can accumulate without the need of whitelisting</p>
                                        </div>
                                        <div className="col-md-8">
                                            <h2>{Utils.roundWei(product.whiteListThreshold)} {product.symbol}</h2>
                                        </div>
                                    </div>
                                    <br />
                                    <div className="row">
                                        <div className="col-md-4">
                                            <h4>Success fee percentage</h4>
                                            <p className="small">the percentage of capital the incubator will retain from a startup's exit</p>
                                        </div>
                                        <div className="col-md-8">
                                            <h2>{Utils.normalizeBasketSuccessFee(product.basketSuccessFee || 0)}%</h2>
                                        </div>
                                    </div>
                                    <br />
                                    <div className="row">
                                        <div className="col-md-4">
                                            <h4>Portfolio value</h4>
                                            <p className="small">The extimated value of the basket, expressed in local currency</p>
                                        </div>
                                        <div className="col-md-8 relative">
                                            <h2>{this.renderPortfolioValue() + " " + this.renderPortfolioCurrency()}</h2>
                                            {sticker && this.renderPortfolioValue() !== 'NONE' && <div className="sticker">
                                                Verified by {'\u00A0\u00A0\u00A0\u00A0'}<img width="30" height="30" src={"data:image/png;base64, " + sticker} />
                                            </div>}
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