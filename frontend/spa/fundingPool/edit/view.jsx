var EditFundingPool = React.createClass({
    requiredModules: [
        'spa/members'
    ],
    requiredScripts: [
        "assets/plugins/summernote/summernote.min.js",
        "assets/plugins/summernote/summernote.css"
    ],
    getTitle() {
        return ("Edit " + (this.props.parent ? "Member of " : "") + "Basket " + (this.props.parent || this.getProduct()).name);
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
        this.setState({product}, function() {
            _this.forceUpdate();
            _this.domRoot.children().find('a.nav-link').click();
            setTimeout(() => _this.setState({product}), 450);
        });
    },
    back(e) {
        e && e.preventDefault();
        var _this = this;
        var parent = _this.props.parent;
        this.emit((this.props.type || 'page') + '/change', this.props.view === 'mine' ? EditFundingPool : Detail, { element: parent, parent: null, type: this.props.type, view: this.props.view }, () => _this.setProduct(parent));
    },
    loadImage(e) {
        e && e.preventDefault();
        var userChosenPath = require('electron').remote.dialog.showOpenDialog({
            defaultPath: require('electron').remote.app.getPath("desktop"),
            filters: [
                {
                    name: "Image logo",
                    extensions: ["png", "jpg", "jpeg", "bmp"]
                }
            ]
        });
        if (userChosenPath) {
            var file = require('electron').remote.require('fs').readFileSync(userChosenPath[0]).toString('base64');
            file = "data:image/png;base64, " + file;
            this.image.attr('src', file);
        }
    },
    saveDoc(e) {
        e && e.preventDefault();
        var name = ''
        try {
            name = this.name.value.split(' ').join('');
        } catch (error) {
        }
        if (name === '') {
            alert('Please insert the name of the new basket');
            return;
        }

        var url = ''
        try {
            url = this.url.value.split(' ').join('').toLowerCase();
        } catch (error) {
        }
        if (url !== '') {
            if (url.indexOf('http://') !== 0 && url.indexOf('https://') !== 0) {
                alert('URL must start with http:// or https://');
                return;
            }
            if (!url.match(this.controller.urlRegex)) {
                alert('Wrong URL');
                return;
            }
        }

        var image = '';
        try {
            image = this.image.attr('src').split("data:image/png;base64, ").join('');
        } catch (error) {
        }
        var newProduct = {
            name,
            description: $.base64.encode(this.description.summernote('code')),
            url,
            image
        };
        var thisProduct = this.getProduct();
        var oldProduct = {
            name: thisProduct.name,
            description: thisProduct.description,
            url: thisProduct.url
        }
        try {
            oldProduct.image = thisProduct.image.split('data:image/png;base64, ').join('');
        } catch (error) {
        }
        if (JSON.stringify(oldProduct) === JSON.stringify(newProduct)) {
            return;
        }
        this.controller.saveDoc(newProduct);
    },
    updateSeedRate(e) {
        e && e.preventDefault();
        var seedRate = 0;
        try {
            seedRate = parseInt(this.seedRate.value.split(' ').join(''));
        } catch (error) {
        }
        if (isNaN(seedRate) || seedRate < 0) {
            alert('SEED Rate is a mandatory positive number or zero');
            return;
        }
        if (this.getProduct().seedRate === seedRate) {
            return;
        }
        this.controller.updateSeedRate(seedRate);
    },
    updateExchangeRate(e) {
        e && e.preventDefault();
        var exangeRate = 0;
        try {
            exangeRate = parseInt(this.exangeRate.value.split(' ').join(''));
        } catch (error) {
        }
        if (isNaN(exangeRate) || exangeRate < 0) {
            alert('Exchange Rate is a mandatory positive number or zero');
            return;
        }
        if (this.getProduct().exangeRate === exangeRate) {
            return;
        }
        this.controller.updateExchangeRate(exangeRate);
    },
    updateExchangeRateDecimals(e) {
        e && e.preventDefault();
        var exchangeRateDecimals = 0;
        try {
            exchangeRateDecimals = parseInt(this.exchangeRateDecimals.value.split(' ').join(''));
        } catch (error) {
        }
        if (isNaN(exchangeRateDecimals) || exangeRate < 0) {
            alert('Exchange Rate decimals is a mandatory positive number or zero');
            return;
        }
        if (this.getProduct().exchangeRateDecimals === exchangeRateDecimals) {
            return;
        }
        this.controller.updateExchangeRateDecimals(exchangeRateDecimals);
    },
    updateTotalSupply(e) {
        e && e.preventDefault();
        var totalSupply = 0;
        try {
            totalSupply = parseInt(this.totalSupply.value.split(' ').join(''));
        } catch (error) {
        }
        if (isNaN(totalSupply) || totalSupply < 0) {
            alert('Total Supply is a mandatory positive number or zero');
            return;
        }
        if (this.getProduct().totalSupply === totalSupply) {
            return;
        }
        this.controller.updateTotalSupply(totalSupply);
    },
    componentDidMount() {
        this.domRoot.children().find('a.nav-link').click(function () {
            $($(this).parents('.nav-tabs')).children().find('a.nav-link').removeClass('active');
            $(this).addClass('active');
        });
        client.contractsManager.getFundingPanelData(this.getProduct(), true);
    },
    administrationSubmit(e) {
        e.preventDefault();
        var $target = $(e.target);
        var value = $target.html().toLowerCase();
        var $parent = $($target.parents('.form-group'));
        var title = $parent.children().find('a.nav-link.active').html().split(' ').join('');
        var address = $parent.children('input[type="text"]').val();
        if (!Utils.isEthereumAddress(address)) {
            alert('You must provide a valid ethereum address');
            return;
        }
        var promise = this.controller[value + title](address);
        promise && promise.then(function (response) {
            response && $parent.children().find('span.response').html(response);
        });
    },
    render() {
        var product = this.getProduct();
        var description = '';
        try {
            description = $.base64.decode(product.description);
        } catch (e) {
        }
        return (
            <div className="kt-content kt-grid__item kt-grid__item--fluid">
                <div className="row">
                    <div className="col-xl-12 mt-5">
                        <ul className="nav nav-tabs nav-tabs-line nav-tabs-bold nav-tabs-line-3x mb-5" role="tablist">
                            <li className="nav-item">
                                <a className="nav-link active" data-toggle="tab" href="#main-data" role="tab"><i className="fa fa-info-circle mr-2"></i>Main Info</a>
                            </li>
                            {!this.props.parent && <li className="nav-item">
                                <a className="nav-link" data-toggle="tab" href="#administration" role="tab"><i className="fas fa-user mr-2"></i>Administration</a>
                            </li>}
                            {!this.props.parent && <li className="nav-item">
                                <a className="nav-link" data-toggle="tab" href="#economic-data" role="tab"><i className="fas fa-coins mr-2"></i>Economic Info</a>
                            </li>}
                            {!this.props.parent && <li className="nav-item">
                                <a className="nav-link" data-toggle="tab" href="#members" role="tab"><i className="fas fa-rocket mr-2"></i>Members</a>
                            </li>}
                        </ul>
                        <div className="tab-content">
                            <div className="tab-pane active" id="main-data" role="tabpanel">
                                <form className="kt-form" action="">
                                    <div className="row">
                                        <div className="col-md-2">
                                            <h4>Name</h4>
                                        </div>
                                        <div className="col-md-10 form-group">
                                            <input className="form-control form-control-last" type="text" ref={ref => (this.name = ref) && (this.name.value = product.name)} />
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-2">
                                            <h4>Description</h4>
                                        </div>
                                        <div className="col-md-10 form-group editor">
                                            <div ref={ref => ref && (this.description = $(ref)).summernote({ minHeight: 350, disableResizeEditor: true }).summernote('code', description)} />
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-2">
                                            <h4>URL</h4>
                                        </div>
                                        <div className="col-md-10 form-group">
                                            <input className="form-control form-control-last" type="text" ref={ref => (this.url = ref) && (this.url.value = product.url)} />
                                        </div>
                                    </div>
                                    <div className="row">
                                        <div className="col-md-2">
                                            <h4>Logo</h4>
                                        </div>
                                        <div className="col-md-10 form-group">
                                            <a href="javascript:;" onClick={this.loadImage}>
                                                <img width="100" height="100" ref={ref => this.image = $(ref)} src={product.image ? ("data:image/png;base64, " + product.image) : ''} />
                                            </a>
                                        </div>
                                    </div>
                                    {!this.props.parent && <button type="button" className="btn btn-brand btn-pill btn-elevate browse-btn" onClick={this.saveDoc}>Update</button>}
                                    {this.props.parent && <button type="button" className="btn btn-secondary btn-pill btn-elevate browse-btn" onClick={this.back}>Back</button>}
                                </form>
                            </div>
                            <div className="tab-pane" id="administration" role="tabpanel">
                                <form className="kt-form" action="">
                                    <div className="form-group">
                                        <br />
                                        <ul className="nav nav-tabs nav-tabs-line nav-tabs-bold nav-tabs-line-3x mb-5" role="tablist">
                                            <li className="nav-item">
                                                <a className="nav-link active" data-toggle="tab" role="tab">Funding Manager</a>
                                            </li>
                                            <li className="nav-item">
                                                <a className="nav-link" data-toggle="tab" role="tab">Funding Operator</a>
                                            </li>
                                            <li className="nav-item">
                                                <a className="nav-link" data-toggle="tab" role="tab">Funds Unlock Manager</a>
                                            </li>
                                            <li className="nav-item">
                                                <a className="nav-link" data-toggle="tab"role="tab">Funds Unlock Operator</a>
                                            </li>
                                            <li className="nav-item">
                                                <a className="nav-link" data-toggle="tab"role="tab">White List Manager</a>
                                            </li>
                                            <li className="nav-item">
                                                <a className="nav-link" data-toggle="tab"role="tab">White List Operator</a>
                                            </li>
                                        </ul>
                                        <br />
                                        <input className="form-control" type="text" placeholder="Address" />
                                        <br />
                                        <div className="kt-form__actions">
                                            <button type="button" className="btn btn-brand btn-pill btn-elevate browse-btn" onClick={this.administrationSubmit}>GRANT</button>
                                            {'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}
                                            <button type="button" className="btn btn-secondary btn-pill btn-elevate browse-btn" onClick={this.administrationSubmit}>DENY</button>
                                            {'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}
                                            <button type="button" className="btn btn-brand btn-pill btn-elevate browse-btn" onClick={this.administrationSubmit}>VERIFY</button>
                                            {'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}
                                            <span class="response"></span>
                                        </div>
                                    </div>
                                </form>
                            </div>
                            <div className="tab-pane" id="economic-data" role="tabpanel">
                                <form className="kt-form" action="">
                                    <div className="row">
                                        <div className="col-md-2">
                                            <h4>SEED Rate</h4>
                                        </div>
                                        <div className="col-md-8 form-group">
                                            <input className="form-control form-control-last" type="number" ref={ref => (this.seedRate = ref) && (this.seedRate.value = product.seedRate)} />
                                        </div>
                                        <div className="col-md-2">
                                            <button type="button" className="btn btn-brand btn-pill btn-elevate browse-btn" onClick={this.updateSeedRate}>OK</button>
                                        </div>
                                    </div>
                                    <br />
                                    <div className="row">
                                        <div className="col-md-2">
                                            <h4>Exchange Rate</h4>
                                        </div>
                                        <div className="col-md-8 form-group">
                                            <input className="form-control form-control-last" type="number" ref={ref => (this.exangeRate = ref) && (this.exangeRate.value = product.exangeRate)} />
                                        </div>
                                        <div className="col-md-2">
                                            <button type="button" className="btn btn-brand btn-pill btn-elevate browse-btn" onClick={this.updateExchangeRate}>OK</button>
                                        </div>
                                    </div>
                                    <br />
                                    <div className="row">
                                        <div className="col-md-2">
                                            <h4>Exchange Rate Decimals</h4>
                                        </div>
                                        <div className="col-md-8 form-group">
                                            <input className="form-control form-control-last" type="number" ref={ref => (this.exchangeRateDecimals = ref) && (this.exchangeRateDecimals.value = product.seedRate)} />
                                        </div>
                                        <div className="col-md-2">
                                            <button type="button" className="btn btn-brand btn-pill btn-elevate browse-btn" onClick={this.updateExchangeRateDecimals}>OK</button>
                                        </div>
                                    </div>
                                    <br />
                                    <div className="row">
                                        <div className="col-md-2">
                                            <h4>Total Supply</h4>
                                        </div>
                                        <div className="col-md-8 form-group">
                                            <input className="form-control form-control-last" type="number" ref={ref => (this.totalSupply = ref) && (this.totalSupply.value = product.totalSupply && parseFloat(web3.utils.fromWei(product.totalSupply + ''), 'ether') || '')} />
                                        </div>
                                        <div className="col-md-2">
                                            <button type="button" className="btn btn-brand btn-pill btn-elevate browse-btn" onClick={this.updateTotalSupply}>OK</button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                            <div className="tab-pane" id="members" role="tabpanel">
                                <button type="button" className="btn btn-brand btn-pill btn-elevate browse-btn" onClick={() => this.emit('section/change', CreateFundingPool, {parent : product, type: 'section', view: 'mine'})}>Add new Member</button>
                                <br />
                                <br />
                                <Members element={product} view={this.props.view} type={this.props.type}/>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});