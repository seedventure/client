var Dex = React.createClass({
    secondsPerBlock: 14,
    maxBlockNumber: 10000000,
    title: 'Trade',
    getDefaultSubscriptions() {
        return {
            'amount/eth': () => this.loadBalances(true),
            'amount/seed': () => this.loadBalances(true),
            'dex/order': this.updateOrders
        };
    },
    updateOrders(event) {
        var _this = this;
        var product = this.getProduct();
        client.contractsManager.getOrders(product && product.tokenAddress, _this.state && _this.state.orders, event).then(orders => _this.setState({ product, orders }));
    },
    detail(e) {
        e && e.preventDefault() && e.stopPropagation();
        var position = $(e.target).attr('data-position');
        var element = client.contractsManager.getList()[position];
        this.emit('page/change', Detail, { element });
    },
    getProductsArray() {
        var products = client.contractsManager.getArray();
        products = Enumerable.From(products).Where(it => it.totalSupply === undefined || parseInt(it.totalSupply) > 0).OrderByDescending(it => parseInt(it.position)).ToArray();
        products.unshift({
            name: 'SEED Token',
            symbol: 'SEED',
            position: '-1'
        });
        var search = this.state && this.state.search;
        search && (search = search.toLowerCase()) && (products = Enumerable.From(products).Where(product => {
            if (product.fundingPanelAddress && product.fundingPanelAddress.toLowerCase().indexOf(search) !== -1) {
                return true;
            }
            if (product.name && product.name.toLowerCase().indexOf(search) !== -1) {
                return true;
            }
            if (product.symbol && product.symbol.toLowerCase().indexOf(search) !== -1) {
                return true;
            }
            if (product.tags && product.tags.length > 0 && Enumerable.From(product.tags).Any(it => it.toLowerCase().indexOf(search) !== -1)) {
                return true;
            }
            return false;
        }).ToArray());
        return products;
    },
    search(e) {
        e && e.preventDefault() && e.stopPropagation();
        this.searchTimeout && clearTimeout(this.searchTimeout);
        var target = this.searchBar;
        var _this = this;
        this.searchTimeout = setTimeout(function () {
            _this.setState({ search: target && target.value });
        }, 300);
    },
    clearSearch(e) {
        e && e.preventDefault() && e.stopPropagation();
        this.searchBar.value = '';
        this.search();
    },
    onClick(e) {
        e && e.preventDefault() && e.stopPropagation();
        var position = $(e.target).attr('data-position');
        var product = client.contractsManager.getList()[position];
        !product && (product = null);
        product !== this.getProduct() && this.setProduct(product);
    },
    getProduct() {
        return (this.state ? this.state.product : this.props.element) || null;
    },
    getProductForView() {
        var p = this.getProduct();
        if (!p) {
            return {
                symbol: 'SEED',
                otherSymbol: 'ETH'
            }
        }
        (p = JSON.parse(JSON.stringify(p))).otherSymbol = 'SEED';
        return p;
    },
    setProduct(product) {
        var _this = this;
        try {
            this.unsubscribe('fundingPanel/' + this.getProduct().position + '/updated');
        } catch (e) {
        }
        this.setState({ product: product || null, orders: null }, function () {
            try {
                this.subscribe('fundingPanel/' + _this.getProduct().position + '/updated', _this.loadBalances);
            } catch (e) {
            }
            _this.updateOrders();
            _this.loadBalances();
        });
    },
    loadBalances(product) {
        var address = undefined;
        try {
            address = this.getProduct().tokenAddress;
        } catch (e) {
        }
        var _this = this;
        if (!product) {
            var amount = Utils.roundWei(0);
            _this.domRoot.children().find('.amount-token').each((_pos, elem) => $(elem).html(amount));
            _this.domRoot.children().find('.amount-token-dex').each((_pos, elem) => $(elem).html(amount));
            if (!address) {
                _this.domRoot.children().find('.amount-seed').each((_pos, elem) => $(elem).html(amount));
                _this.domRoot.children().find('.amount-seed-dex').each((_pos, elem) => $(elem).html(amount));
            }
        }
        client.userManager.getBalances(address || client.contractsManager.SEEDTokenAddress).then(result => {
            try {
                if (address !== _this.getProduct().tokenAddress) {
                    return;
                }
            } catch (e) {
            }
            _this.controller.setBalances(result);
            var token = Utils.roundWei(address ? result.token : result.seed);
            _this.domRoot.children().find('.amount-token').each((_pos, elem) => $(elem).html(token));
            var seed = Utils.roundWei(address ? result.seed : result.eth);
            _this.domRoot.children().find('.amount-seed').each((_pos, elem) => $(elem).html(seed));
            var dexToken = Utils.roundWei(address ? result.dexToken : result.dexSEED);
            _this.domRoot.children().find('.amount-token-dex').each((_pos, elem) => $(elem).html(dexToken));
            var dexSeed = Utils.roundWei(address ? result.dexSEED : result.dexEth);
            _this.domRoot.children().find('.amount-seed-dex').each((_pos, elem) => $(elem).html(dexSeed));
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
    componentDidMount() {
        this.updateNavLinks();
        this.loadBalances(true);
        this.updateOrders();
    },
    depositToken(e) {
        e && e.preventDefault() && e.stopPropagation();
        var amount = Utils.toWei(this.depositTokenField);
        if (amount <= 0) {
            alert('Amount must be a number greater than 0');
            return;
        }
        this.controller.depositToken(amount);
    },
    depositSeedOrEther(e) {
        e && e.preventDefault() && e.stopPropagation();
        var amount = Utils.toWei(this.depositSeedOrEtherField);
        if (amount <= 0) {
            alert('Amount must be a number greater than 0');
            return;
        }
        this.controller.depositSeedOrEther(amount);
    },
    withdrawToken(e) {
        e && e.preventDefault() && e.stopPropagation();
        var amount = Utils.toWei(this.withdrawTokenField);
        if (amount <= 0) {
            alert('Amount must be a number greater than 0');
            return;
        }
        this.controller.withdrawToken(amount);
    },
    withdrawSeedOrEther(e) {
        e && e.preventDefault() && e.stopPropagation();
        var amount = Utils.toWei(this.withdrawSeedOrEtherField);
        if (amount <= 0) {
            alert('Amount must be a number greater than 0');
            return;
        }
        this.controller.withdrawSeedOrEther(amount);
    },
    transferToken(e) {
        e && e.preventDefault() && e.stopPropagation();
        var amount = Utils.toWei(this.transferTokenAmountField);
        if (amount <= 0) {
            alert('Amount must be a number greater than 0');
            return;
        }
        var address = this.transferTokenAddressField.value.split(' ').join('');
        if (!Utils.isEthereumAddress(address)) {
            alert('Insert a valid ethereum address');
            return;
        }
        this.controller.transferToken(address, amount);
    },
    transferSeedOrEther(e) {
        e && e.preventDefault() && e.stopPropagation();
        var amount = Utils.toWei(this.transferSeedOrEtherAmountField);
        if (amount <= 0) {
            alert('Amount must be a number greater than 0');
            return;
        }
        var address = this.transferSeedOrEtherAddressField.value.split(' ').join('');
        if (!Utils.isEthereumAddress(address)) {
            alert('Insert a valid ethereum address');
            return;
        }
        this.controller.transferSeedOrEther(address, amount);
    },
    onBuySellChange(e) {
        Utils.parseNumber(e, this.updateBuySell);
    },
    updateBuySell() {
        var amount = Utils.cleanNumber(this.buySellAmount);
        var price = Utils.cleanNumber(this.buySellPrice);
        var total = amount * price;
        total = web3.utils.toWei(Utils.numberToString(total), 'ether');
        this.buySellTotal.value = Utils.roundWei(total);
    },
    tryPlaceOrder(e) {
        e && e.preventDefault() && e.stopPropagation();
        var buy = $(e.target).attr('data-buy') === 'true';
        var amount = Utils.toWei(this.buySellAmount);
        if (amount <= 0) {
            return alert("Amount must be greater than 0");
        }
        var price = Utils.toWei(this.buySellPrice);
        if (price <= 0) {
            return alert("Price must be greater than 0");
        }
        var total = Utils.toWei(this.buySellTotal);
        if (total <= 0) {
            return alert("Total must be greater than 0");
        }
        var expires = parseInt(this.buySellExpires.value);
        if (isNaN(expires) || expires <= 1 || expires > this.maxBlockNumber) {
            return alert("Blocks must be a number between 1 and " + Utils.numberToString(this.maxBlockNumber));
        }
        this.controller.order(buy, amount, price, total, expires);
    },
    cancelOrder(e) {
        e && e.preventDefault() && e.stopPropagation();
        var key = $(e.target).attr('data-key');
        var order = Enumerable.From(this.state.orders).Where(it => it.key === key).First();
        this.controller.cancelOrder(order);
    },
    onTradeChange(e) {
        Utils.parseNumber(e, this.updateTradeModal);
    },
    updateTradeModal() {
        var amount = Utils.cleanNumber(this.tradeModalAmount);
        var price = Utils.cleanNumber(this.tradeModalPrice);
        var total = amount * price;
        total = web3.utils.toWei(Utils.numberToString(total), 'ether');
        this.tradeModalTotal.value = Utils.roundWei(total);
    },
    askTrade(e, order) {
        e && e.preventDefault() && e.stopPropagation();
        try {
            if(order.user.toLowerCase() === client.userManager.user.wallet.toLowerCase()) {
                //return alert('Cannot trade on your own order');
            }
        } catch(e) {
        }
        this.order = order;
        this.tradeModalType1.html('<strong>' + (order.buy ? 'SELL' : 'BUY') + '</strong>');
        this.tradeModalType2.html('<strong>' + (order.buy ? 'BUY' : 'SELL') + '</strong>');
        this.tradeModalAmount.value = Utils.roundWei(order.buy ? order.amountGet : order.amountGive);
        this.tradeModalAvailable.innerHTML = ' of ' + Utils.roundWei(order.buy ? order.amountGet : order.amountGive);
        this.tradeModalPrice.value = order.amount;
        this.updateTradeModal();
        this.tradeModal.show();
    },
    trade(e) {
        e && e.preventDefault() && e.stopPropagation();
        var amount = Utils.toWei(this.tradeModalAmount);
        if(amount <= 0) {
            return alert('Amount must be anumber greater than 0');
        }
        if(amount > (this.order.buy ? this.order.amountGet : this.order.amountGiveSum)) {
            return alert('Specified amount exceedes availability');
        }
        this.tradeModal.hide();
        this.controller.trade(this.order, amount);
    },
    convertBlocksToSeconds(e) {
        e && e.preventDefault() && e.stopPropagation();
        var seconds = 0;
        var expires = parseInt(this.buySellExpires.value);
        if (!isNaN(expires) && expires > 0) {
            seconds = expires * this.secondsPerBlock;
        }
        this.blocksToSeconds.innerHTML = Utils.numberToString(seconds);
    },
    render() {
        var _this = this;
        var products = _this.getProductsArray();
        var product = _this.getProductForView();
        var buyOrders = [];
        var sellOrders = [];
        var myOrders = [];
        try {
            var orders = Enumerable.From(this.state.orders).Where(it => it.amountGiveSum > 0);
            buyOrders = orders.Where(it => it.buy).OrderBy(it => it.amountGive).ToArray();
            sellOrders = orders.Where(it => !it.buy).OrderByDescending(it => it.amountGet).ToArray();
            var userWallet = client.userManager.user.wallet.toLowerCase();
            myOrders = orders.Where(it => it.user === userWallet).OrderByDescending().ToArray();
        } catch (e) {
        }
        return (
            <div className="kt-grid__item kt-grid__item--fluid kt-grid kt-grid--ver kt-grid--stretch">
                <div className="kt-container kt-body kt-grid kt-grid--ver" id="kt_body">
                    <div className="kt-grid__item kt-grid__item--fluid kt-grid kt-grid--hor">
                        <div className="kt-content kt-grid__item kt-grid__item--fluid">
                            <div className="row">
                                <div className="col-md-3 my-situation">
                                    <h3>My Situation</h3>
                                    {!client.userManager.user && <p>You must load a wallet to operate.</p>}
                                    {client.userManager.user && [
                                        <ul className="nav nav-tabs nav-tabs-line nav-tabs-bold nav-tabs-line-3x" role="tablist">
                                            <li className="nav-item">
                                                <a className="nav-link" data-toggle="tab" href="#deposit" role="tab">Deposit</a>
                                            </li>
                                            <li className="nav-item">
                                                <a className="nav-link" data-toggle="tab" href="#withdraw" role="tab">Withdraw</a>
                                            </li>
                                            <li className="nav-item">
                                                <a className="nav-link" data-toggle="tab" href="#transfer" role="tab">Transfer</a>
                                            </li>
                                        </ul>,
                                        <div className="row label-general">
                                            <div className="col-md-4">
                                                Token
                                                        </div>
                                            <div className="col-md-4">
                                                Wallet
                                                        </div>
                                            <div className="col-md-4">
                                                DEX
                                                        </div>
                                        </div>,
                                        <div className="tab-content">
                                            <div className="tab-pane" id="deposit" role="tabpanel">
                                                <form className="kt-form" action="">
                                                    <div className="row">
                                                        <div className="col-md-4">
                                                            {Utils.cleanTokenSymbol(product.symbol)}
                                                        </div>
                                                        <div className="col-md-4 amount-token">
                                                            {Utils.roundWei()}
                                                        </div>
                                                        <div className="col-md-4 amount-token-dex">
                                                            {Utils.roundWei()}
                                                        </div>
                                                    </div>
                                                    <div className="row">
                                                        <div className="col-md-8 form-group">
                                                            <input className="form-control" type="text" ref={ref => (this.depositTokenField = ref) && (ref.value = Utils.roundWei())} onChange={Utils.parseNumber} />
                                                        </div>
                                                        <div className="col-md-4 form-group">
                                                            <button type="button" className="btn btn-brand btn-pill btn-elevate browse-btn" onClick={this.depositToken}>Deposit</button>
                                                        </div>
                                                    </div>
                                                    <div className="row">
                                                        <div className="col-md-4">
                                                            {product.otherSymbol}
                                                        </div>
                                                        <div className="col-md-4 amount-seed">
                                                            {Utils.roundWei()}
                                                        </div>
                                                        <div className="col-md-4 amount-seed-dex">
                                                            {Utils.roundWei()}
                                                        </div>
                                                    </div>
                                                    <div className="row">
                                                        <div className="col-md-8 form-group">
                                                            <input className="form-control" type="text" ref={ref => (this.depositSeedOrEtherField = ref) && (ref.value = Utils.roundWei())} onChange={Utils.parseNumber} />
                                                        </div>
                                                        <div className="col-md-4 form-group">
                                                            <button type="button" className="btn btn-brand btn-pill btn-elevate browse-btn" onClick={this.depositSeedOrEther}>Deposit</button>
                                                        </div>
                                                    </div>
                                                </form>
                                            </div>
                                            <div className="tab-pane" id="withdraw" role="tabpanel">
                                                <form className="kt-form" action="">
                                                    <div className="row">
                                                        <div className="col-md-4">
                                                            {Utils.cleanTokenSymbol(product.symbol)}
                                                        </div>
                                                        <div className="col-md-4 amount-token">
                                                            {Utils.roundWei()}
                                                        </div>
                                                        <div className="col-md-4 amount-token-dex">
                                                            {Utils.roundWei()}
                                                        </div>
                                                    </div>
                                                    <div className="row">
                                                        <div className="col-md-8 form-group">
                                                            <input className="form-control" type="text" ref={ref => (this.withdrawTokenField = ref) && (ref.value = Utils.roundWei())} onChange={Utils.parseNumber} />
                                                        </div>
                                                        <div className="col-md-4 form-group">
                                                            <button type="button" className="btn btn-brand btn-pill btn-elevate browse-btn" onClick={this.withdrawToken}>Withdraw</button>
                                                        </div>
                                                    </div>
                                                    <div className="row">
                                                        <div className="col-md-4">
                                                            {product.otherSymbol}
                                                        </div>
                                                        <div className="col-md-4 amount-seed">
                                                            {Utils.roundWei()}
                                                        </div>
                                                        <div className="col-md-4 amount-seed-dex">
                                                            {Utils.roundWei()}
                                                        </div>
                                                    </div>
                                                    <div className="row">
                                                        <div className="col-md-8 form-group">
                                                            <input className="form-control" type="text" ref={ref => (this.withdrawSeedOrEtherField = ref) && (ref.value = Utils.roundWei())} onChange={Utils.parseNumber} />
                                                        </div>
                                                        <div className="col-md-4 form-group">
                                                            <button type="button" className="btn btn-brand btn-pill btn-elevate browse-btn" onClick={this.withdrawSeedOrEther}>Withdraw</button>
                                                        </div>
                                                    </div>
                                                </form>
                                            </div>
                                            <div className="tab-pane" id="transfer" role="tabpanel">
                                                <form className="kt-form" action="">
                                                    <div className="row">
                                                        <div className="col-md-4">
                                                            {Utils.cleanTokenSymbol(product.symbol)}
                                                        </div>
                                                        <div className="col-md-4 amount-token">
                                                            {Utils.roundWei()}
                                                        </div>
                                                        <div className="col-md-4 amount-token-dex">
                                                            {Utils.roundWei()}
                                                        </div>
                                                    </div>
                                                    <div className="row">
                                                        <div className="col-md-4 form-group">
                                                            <input className="form-control" type="text" ref={ref => (this.transferTokenAmountField = ref) && (ref.value = Utils.roundWei())} onChange={Utils.parseNumber} />
                                                        </div>
                                                        <div className="col-md-4 form-group">
                                                            <input className="form-control" type="text" ref={ref => this.transferTokenAddressField = ref} placeholder="Address" />
                                                        </div>
                                                        <div className="col-md-4 form-group">
                                                            <button type="button" className="btn btn-brand btn-pill btn-elevate browse-btn" onClick={this.transferToken}>Transfer</button>
                                                        </div>
                                                    </div>
                                                    <div className="row">
                                                        <div className="col-md-4">
                                                            {product.otherSymbol}
                                                        </div>
                                                        <div className="col-md-4 amount-seed">
                                                            {Utils.roundWei()}
                                                        </div>
                                                        <div className="col-md-4 amount-seed-dex">
                                                            {Utils.roundWei()}
                                                        </div>
                                                    </div>
                                                    <div className="row">
                                                        <div className="col-md-4 form-group">
                                                            <input className="form-control" type="text" ref={ref => (this.transferSeedOrEtherAmountField = ref) && (ref.value = Utils.roundWei())} onChange={Utils.parseNumber} />
                                                        </div>
                                                        <div className="col-md-4 form-group">
                                                            <input className="form-control" type="text" ref={ref => this.transferSeedOrEtherAddressField = ref} placeholder="Address" />
                                                        </div>
                                                        <div className="col-md-4 form-group">
                                                            <button type="button" className="btn btn-brand btn-pill btn-elevate browse-btn" onClick={this.transferSeedOrEther}>Transfer</button>
                                                        </div>
                                                    </div>
                                                </form>
                                            </div>
                                        </div>]}
                                </div>
                                <div className="col-md-6 book">
                                    <h3>Book</h3>
                                    <div className="order-book">
                                        <div className="sell">
                                            <div ref={ref => ref && (ref.scrollTop = ref.scrollHeight)}>
                                                {sellOrders.map(order =>
                                                    <div key={order.key} className="order row" onClick={e => _this.askTrade(e, order)}>
                                                        <div className="col-md-4 color-red">
                                                            {order.amount}
                                                        </div>
                                                        <div className="col-md-4">
                                                            {Utils.roundWei(order.amountGiveSum)}
                                                        </div>
                                                        <div className="col-md-4">
                                                            {Utils.roundWei(order.amountGet)}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="title">
                                            <div className="row">
                                                <div className="col-md-4">
                                                    {Utils.cleanTokenSymbol(product.symbol)} / {Utils.cleanTokenSymbol(product.otherSymbol)}
                                                </div>
                                                <div className="col-md-4">
                                                    {Utils.cleanTokenSymbol(product.symbol)}
                                                </div>
                                                <div className="col-md-4">
                                                    {Utils.cleanTokenSymbol(product.otherSymbol)}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="buy">
                                            <div>
                                                {buyOrders.map(order =>
                                                    <div key={order.key} className="order row" onClick={e => _this.askTrade(e, order)}>
                                                        <div className="col-md-4 color-green">
                                                            {order.amount}
                                                        </div>
                                                        <div className="col-md-4">
                                                            {Utils.roundWei(order.amountGet)}
                                                        </div>
                                                        <div className="col-md-4">
                                                            {Utils.roundWei(order.amountGiveSum)}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-3 last-trades">
                                    <h3>Last Trades</h3>
                                </div>
                            </div>
                            <div className="row bottom">
                                <div className="col-md-3 baskets">
                                    <h3>Baskets</h3>
                                    <div className="row">
                                        <div className="col-md-12">
                                            <div className="row searchBar">
                                                <div className="col-sm-10 separator">
                                                    <input type="text" placeholder="Search..." onChange={this.search} ref={ref => this.searchBar = ref} />
                                                </div>
                                                <div className="col-sm-2 clear">
                                                    <a href="#" className="kt-subheader__breadcrumbs-home" onClick={this.clearSearch}><i className="fas fa-remove"></i></a>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-12">
                                            <ul>
                                                {products.map(p =>
                                                    <li key={p.position} data-position={p.position} onClick={_this.onClick}>
                                                        {Utils.cleanTokenSymbol(p.symbol)} / {p.position === '-1' ? 'ETH' : 'SEED'}
                                                        {p.position !== '-1' && <a href="javascript:;" data-position={p.position} onClick={_this.detail}>Details</a>}
                                                    </li>
                                                )}
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                                <div className="col-md-6 buy-sell">
                                    <h3>Place an Order</h3>
                                    {!client.userManager.user && <p>You must load a wallet to see this.</p>}
                                    {client.userManager.user && <form className="kt-form" action="">
                                        <div className="row">
                                            <div className="col-md-3 form-group">
                                                <h4>{Utils.cleanTokenSymbol(product.symbol)}</h4>
                                            </div>
                                            <div className="col-md-5 form-group">
                                                <input className="form-control" type="text" ref={ref => (this.buySellAmount = ref) && (ref.value = Utils.roundWei())} onChange={this.onBuySellChange} />
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-md-3 form-group">
                                                <h4>{Utils.cleanTokenSymbol(product.symbol)}/{Utils.cleanTokenSymbol(product.otherSymbol)}</h4>
                                            </div>
                                            <div className="col-md-5 form-group">
                                                <input className="form-control" type="text" ref={ref => (this.buySellPrice = ref) && (ref.value = Utils.roundWei())} onChange={this.onBuySellChange} />
                                            </div>
                                            <div className="col-md-1">
                                            </div>
                                            <div className="col-md-3 form-group">
                                                <button type="button" className="btn btn-brand btn-pill btn-elevate browse-btn" data-buy="true" onClick={this.tryPlaceOrder}>Buy {Utils.cleanTokenSymbol(product.symbol)}</button>
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-md-3 form-group">
                                                <h4>{product.otherSymbol}</h4>
                                            </div>
                                            <div className="col-md-5 form-group">
                                                <input className="form-control" type="text" ref={ref => (this.buySellTotal = ref) && (ref.value = Utils.roundWei())} onChange={Utils.parseNumber} disabled />
                                            </div>
                                        </div>
                                        <div className="row">
                                            <div className="col-md-3 form-group">
                                                <h4>Expires in</h4>
                                            </div>
                                            <div className="col-md-2 form-group">
                                                <input className="form-control" type="number" ref={ref => (this.buySellExpires = ref) && (ref.value = 10000)} onChange={this.convertBlocksToSeconds} />
                                            </div>
                                            <div className="col-md-4 form-group">
                                                <h4 className="tail">blocks <span className="tiny">(<span ref={ref => (this.blocksToSeconds = ref) && this.convertBlocksToSeconds()}></span> secs)</span></h4>
                                            </div>
                                            <div className="col-md-3 form-group">
                                                <button type="button" className="btn btn-brand-secondary btn-pill btn-elevate browse-btn" onClick={this.tryPlaceOrder}>Sell {Utils.cleanTokenSymbol(product.symbol)}</button>
                                            </div>
                                        </div>
                                    </form>}
                                </div>
                                <div className="col-md-3 my-orders">
                                    <h3>My Orders</h3>
                                    {!client.userManager.user && <p>You must load a wallet to see this.</p>}
                                    {client.userManager.user && <ul>
                                        {myOrders.map(order =>
                                            <li key={order.key}>
                                                <strong>{order.buy ? "BUY" : "SELL"}</strong> {Utils.roundWei(order.amountGet)} {Utils.cleanTokenSymbol(order.buy ? product.symbol : product.otherSymbol)} For {Utils.roundWei(order.amountGive)} {Utils.cleanTokenSymbol(order.buy ? product.otherSymbol : product.symbol)} ({order.amount} {Utils.cleanTokenSymbol(order.buy ? product.symbol : product.otherSymbol)} / {Utils.cleanTokenSymbol(order.buy ? product.otherSymbol : product.symbol)})
                                                <a href="javascript:;" data-key={order.key} onClick={_this.cancelOrder}>Cancel</a>
                                            </li>
                                        )}
                                    </ul>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <Modal
                    title="Trade"
                    ref={ref => this.tradeModal = ref}
                    backdrop="static"
                    className="dex trade"
                    actions={[{
                        text: "Send",
                        className: "btn-brand btn-pill",
                        onClick: _this.trade
                    }]}>
                    {!client.userManager.user && <p>You must load a wallet to perform this operation.</p>}
                    {client.userManager.user && <form className="kt-form buy-sell" action="">
                        <div className="row">
                            <div className="col-md-12">
                                <h4 ref={ref => this.tradeModalType1 = $(ref)}></h4>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-3 form-group">
                                <h4>{Utils.cleanTokenSymbol(product.symbol)}</h4>
                            </div>
                            <div className="col-md-6 form-group">
                                <input className="form-control" type="text" ref={ref => (this.tradeModalAmount = ref) && (ref.value = Utils.roundWei())} onChange={this.onTradeChange} />
                            </div>
                            <div className="col-md-3 form-group">
                                <h4 ref={ref => this.tradeModalAvailable = ref}>of {Utils.roundWei()}</h4>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-3 form-group">
                                <h4>{Utils.cleanTokenSymbol(product.symbol)}/{Utils.cleanTokenSymbol(product.otherSymbol)}</h4>
                            </div>
                            <div className="col-md-9 form-group">
                                <input className="form-control" type="text" ref={ref => (this.tradeModalPrice = ref) && (ref.value = Utils.roundWei())} disabled/>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-12">
                                <h4 ref={ref => this.tradeModalType2 = $(ref)}></h4>
                            </div>
                        </div>
                        <div className="row">
                            <div className="col-md-3 form-group">
                                <h4>{product.otherSymbol}</h4>
                            </div>
                            <div className="col-md-9 form-group">
                                <input className="form-control" type="text" ref={ref => (this.tradeModalTotal = ref) && (ref.value = Utils.roundWei())} disabled />
                            </div>
                        </div>
                    </form>}
                </Modal>
            </div>
        );
    }
});