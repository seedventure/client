var EditFundingPool = React.createClass({
    requiredModules: [
        'spa/members',
        'spa/preferences/documentUploader'
    ],
    requiredScripts: [
        "assets/plugins/summernote/summernote.min.js",
        "assets/plugins/summernote/summernote.css"
    ],
    getTitle() {
        return (this.props.parent ? <span>Edit Startup of <strong>{this.props.parent.name}</strong></span> : "Edit Basket");
    },
    back(e) {
        e && e.preventDefault() && e.stopPropagation();
        var _this = this;
        var parent = _this.props.parent;
        this.emit('page/change', parent ? EditFundingPool : Products, { element: parent, parent: null, fromBack: true, view: this.props.view }, () => parent && _this.setProduct(parent));
    },
    getProduct() {
        return this.state && this.state.product ? this.state.product : this.props.element;
    },
    getDefaultSubscriptions() {
        var position = this.getProduct().position;
        var subscriptions = {};
        subscriptions['product/set'] = this.setProduct;
        subscriptions['fundingPanel/' + position + '/updated'] = element => {
            var oldMembers = this.getProduct().members;
            var newMembers = element.members;
            if (!oldMembers || !newMembers || JSON.stringify(oldMembers) !== JSON.stringify(newMembers)) {
                return;
            }
            this.setState({ product: element, documents: this.copyDocuments(element.documents) });
        };
        return subscriptions;
    },
    copyDocuments(documents) {
        if (!documents) {
            return [];
        }
        return JSON.parse(JSON.stringify(documents));
    },
    setProduct(product) {
        var _this = this;
        this.setState({ product, documents: this.copyDocuments(product.documents) }, function () {
            _this.forceUpdate();
            setTimeout(() => _this.setState({ product, documents: this.copyDocuments(product.documents) }, () => _this.updateGui()));
        });
    },
    loadImage(e) {
        e && e.preventDefault() && e.stopPropagation();
        var userChosenPath = require('electron').remote.dialog.showOpenDialog({
            defaultPath: undefined,
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
    deleteImage(e) {
        e && e.preventDefault() && e.stopPropagation();
        this.image.attr('src', '');
    },
    saveDoc(e) {
        e && e.preventDefault() && e.stopPropagation();
        var name = ''
        try {
            name = this.name.value.trim();
        } catch (error) {
        }
        if (name === '') {
            alert('Please insert the name of the ' + this.props.parent ? "Startup" : "Basket");
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

        var basketSuccessFee = 0;
        try {
            basketSuccessFee = parseFloat(this.basketSuccessFee.value);
        } catch (error) {
            basketSuccessFee = 0;
        }
        if (!this.props.parent && (basketSuccessFee < 0 || basketSuccessFee > 100)) {
            return alert('Basket success fee can be a percentage between 0 and 100');
        }

        var portfolioValue = 0;
        try {
            portfolioValue = parseFloat(Utils.numberToString(this.portfolioValue.value));
        } catch (error) {
            portfolioValue = 0;
        }
        if (this.props.parent && (isNaN(portfolioValue) || portfolioValue < 0)) {
            return alert('Startup value must be a number greater or equal to zero');
        }

        var portfolioCurrency = 'EUR';
        try {
            portfolioCurrency = this.portfolioCurrency.val();
        } catch (error) {
        }
        if (this.props.parent && portfolioCurrency === '') {
            return alert('Startup value currency must be a valid currency');
        }

        var totalSupply = 0;
        try {
            totalSupply = Utils.toWei(this.startupTotalSupply);
        } catch (error) {
        }

        var tags = [];
        try {
            var tgs = this.tags.value.split(' ');
            for (var i in tgs) {
                var tag = tgs[i].split(' ').join('');
                if (tag.length > 0) {
                    tags.push(tag);
                }
            }
        } catch (error) {
        }

        var newProduct = {
            name,
            description: $.base64.encode(encodeURI(this.description.summernote('code'))),
            url,
            image,
            tags,
            documents: (this.state && this.state.documents) || [],
            totalSupply
        };
        !this.props.parent && (newProduct.basketSuccessFee = basketSuccessFee);
        this.props.parent && (newProduct.portfolioValue = portfolioValue);
        this.props.parent && (newProduct.portfolioCurrency = portfolioCurrency);

        var thisProduct = this.getProduct();
        var oldProduct = {
            name: thisProduct.name,
            description: thisProduct.description,
            url: thisProduct.url,
            tags: thisProduct.tags,
            documents: thisProduct.documents,
            totalSupply : thisProduct.totalSupply
        }
        !this.props.parent && (oldProduct.basketSuccessFee = thisProduct.basketSuccessFee);
        this.props.parent && (oldProduct.portfolioValue = thisProduct.portfolioValue);
        this.props.parent && (oldProduct.portfolioCurrency = thisProduct.portfolioCurrency);

        try {
            oldProduct.image = thisProduct.image.split('data:image/png;base64, ').join('');
        } catch (error) {
        }
        if (JSON.stringify(oldProduct) === JSON.stringify(newProduct)) {
            return;
        }
        this.controller.saveDoc(newProduct, this.props.parent !== undefined && this.props.parent !== null);
    },
    updateSeedRate(e) {
        e && e.preventDefault() && e.stopPropagation();
        var seedRate = 0;
        try {
            seedRate = parseInt(web3.utils.toWei(Utils.numberToString(this.seedRate.value), 'ether'));
        } catch (error) {
        }
        if (isNaN(seedRate) || seedRate < 0) {
            alert('SEED Rate is a mandatory positive number or zero');
            return;
        }
        if (this.getProduct().seedRate === seedRate) {
            return;
        }
        this.controller.updateSeedRate(Utils.numberToString(seedRate));
    },
    updateExchangeRate(e) {
        e && e.preventDefault() && e.stopPropagation();
        var exchangeRateOnTop = 0;
        try {
            exchangeRateOnTop = parseInt(web3.utils.toWei(Utils.numberToString(this.exchangeRateOnTop.value), 'ether'));
        } catch (error) {
        }
        if (isNaN(exchangeRateOnTop) || exchangeRateOnTop < 0) {
            alert('Exchange Rate on Top is a mandatory positive number or zero');
            return;
        }
        if (this.getProduct().exchangeRateOnTop === exchangeRateOnTop) {
            return;
        }
        this.controller.updateExchangeRate(Utils.numberToString(exchangeRateOnTop));
    },
    updateWhiteListThreshold(e) {
        e && e.preventDefault() && e.stopPropagation();
        var whiteListThreshold = 0;
        try {
            whiteListThreshold = parseInt(web3.utils.toWei(Utils.numberToString(this.whiteListThreshold.value), 'ether'));
        } catch (error) {
        }
        if (isNaN(whiteListThreshold) || whiteListThreshold < 0) {
            alert('Whilte List Threshold is a mandatory positive number or zero');
            return;
        }
        if (this.getProduct().whiteListThreshold === whiteListThreshold) {
            return;
        }
        this.controller.updateWhiteListThreshold(Utils.numberToString(whiteListThreshold));
    },
    updateTotalSupply(e) {
        e && e.preventDefault() && e.stopPropagation();
        var totalSupply = 0;
        try {
            totalSupply = parseInt(web3.utils.toWei(Utils.numberToString(this.totalSupply.value), 'ether'));
        } catch (error) {
        }
        if (isNaN(totalSupply) || totalSupply < 0) {
            alert('Total Supply is a mandatory positive number or zero');
            return;
        }
        if (this.getProduct().totalSupply === totalSupply) {
            return;
        }
        this.controller.updateTotalSupply(Utils.numberToString(totalSupply));
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
        var percentage = parseFloat(parseFloat(((totalRaised / totalSupply) * 100).toFixed(2))).toLocaleString();
        totalRaised = Utils.roundWei(totalRaised);
        totalSupply = Utils.roundWei(totalSupply);
        this.progressBar.attr('aria-valuenow', percentage).css('width', percentage + '%').css('color', percentage > 6 ? "white" : "black").html(totalRaised + ' of ' + totalSupply + ' SEEDs raised');
    },
    componentDidMount() {
        this.updateGui();
        this.setState({ documents: this.copyDocuments(this.getProduct().documents) });
    },
    walletRef(ref) {
        (this.wallet = ref) && $(this.wallet).focus((e) => $(e.target).select());
    },
    changeWallet(e) {
        e && e.preventDefault() && e.stopPropagation();
        var address = this.wallet.value.split(' ').join('');
        if (!Utils.isEthereumAddress(address)) {
            alert('You must provide a valid ethereum address');
            return;
        }
        this.controller.changeWalletOnTop(address);
    },
    administrationSubmit(e) {
        e.preventDefault() && e.stopPropagation();
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
    addDocument(e) {
        e && e.preventDefault() && e.stopPropagation();
        var name = this.documentName.value;
        if (name.split(' ').join('') === '') {
            alert('Name is mandatory');
            return;
        }
        var link = this.documentLink.value;
        if (link.indexOf('http://') === -1 && link.indexOf('https://') === -1 && !window.require('electron').remote.require('fs').existsSync(link)) {
            alert('Link must be an existing file or start with http:// or https://');
            return;
        }
        var documents = (this.state && this.state.documents) || [];
        documents.push({
            name,
            link
        });
        this.documentName.value = '';
        this.documentLink.value = '';
        this.setState({ documents });
    },
    browseLocalDocument(e) {
        e && e.preventDefault() && e.stopPropagation();
        var userChosenPath = undefined;
        (userChosenPath = window.require('electron').remote.dialog.showOpenDialog({
            defaultPath: undefined,
            options: {
                openDirectory: false,
                multiSelections: false
            }
        }));
        userChosenPath && (this.documentLink.value = userChosenPath);
    },
    deleteDocument(i, e) {
        e && e.preventDefault() && e.stopPropagation();
        var documents = this.state.documents;
        var doc = documents[i];
        documents.splice(i, 1);
        var _this = this;
        this.setState({ documents }, function () {
            _this.documentName.value = doc.name;
            _this.documentLink.value = doc.link;
        });
    },
    setSingleWhitelist(e) {
        e && e.preventDefault() && e.stopPropagation();
        var address = this.whiteListWallet.value.split(' ').join('');
        if (!Utils.isEthereumAddress(address)) {
            alert('You must provide a valid ethereum address');
            return;
        }
        var whiteListAmount = 0;
        try {
            whiteListAmount = Utils.cleanNumber(this.whiteListAmount);
        } catch (error) {
        }
        if (isNaN(whiteListAmount) || whiteListAmount < 0) {
            alert('Whiltelist Amount is a mandatory positive number or zero');
            return;
        }
        this.controller.setSingleWhitelist(address, whiteListAmount);
    },
    parseWhitelistAmount(e) {
        Utils.parseNumber(e, this.updateWhitelistTokenAmount)
    },
    updateWhitelistTokenAmount() {
        var whitelistAmount = Utils.cleanNumber(this.whiteListAmount);
        var rate = Utils.toEther(this.getProduct().seedRate);
        var amount = whitelistAmount * rate;
        this.whiteListTokenAmount.innerHTML = Utils.roundWei(Utils.toWei(amount));
    },
    newWhitelistAddress(e) {
        e && e.preventDefault() && e.stopPropagation();
        this.newWhitelistAddressTimeout && clearTimeout(this.newWhitelistAddressTimeout);
        this.newWhitelistAddressTimeout = setTimeout(this.controller.newWhitelistAddress, 350);
    },
    render() {
        var _this = this;
        var product = this.getProduct();
        var description = '';
        try {
            description = $.base64.decode(product.description);
        } catch (e) {
        }
        try {
            description = decodeURI(description);
        } catch (e) {
        }
        return (
            <div className="kt-content kt-grid__item kt-grid__item--fluid">
                <br />
                {!this.props.parent && <div className="progress">
                    <div className="progress-bar" role="progressbar" ref={ref => this.progressBar = $(ref)} aria-valuenow="25" aria-valuemin="0" aria-valuemax="100">25%</div>
                </div>}
                <div className="row">
                    <div className="col-xl-12 mt-5">
                        <ul className="nav nav-tabs nav-tabs-line nav-tabs-bold nav-tabs-line-3x mb-5" role="tablist">
                            <li className="nav-item">
                                <a className="nav-link" data-toggle="tab" href="#main-data" role="tab"><i className="fa fa-info-circle mr-2"></i>Main Info</a>
                            </li>
                            {!this.props.parent && <li className="nav-item">
                                <a className="nav-link" data-toggle="tab" href="#administration" role="tab"><i className="fas fa-user mr-2"></i>Administration</a>
                            </li>}
                            {!this.props.parent && <li className="nav-item">
                                <a className="nav-link" data-toggle="tab" href="#whiteList" role="tab"><i className="fas fa-check mr-2"></i>Whitelisting</a>
                            </li>}
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
                                        <div className="col-md-10 form-group">
                                            <input className="form-control form-control-last" type="text" ref={ref => (this.name = ref) && (this.name.value = product.name)} />
                                        </div>
                                    </div>
                                    <br />
                                    <div className="row">
                                        <div className="col-md-2">
                                            <h4>Description</h4>
                                            <p className="small">of the {(this.props.parent && "Startup") || "Incubator"}</p>
                                        </div>
                                        <div className="col-md-10 form-group editor">
                                            <div ref={ref => ref && (this.description = $(ref)).summernote({ minHeight: 350, disableResizeEditor: true }).summernote('code', description)} />
                                        </div>
                                    </div>
                                    <br />
                                    <br />
                                    <div className="row">
                                        <div className="col-md-12">
                                            <h3>Documents</h3>
                                            <p className="small">useful to enrich the description of the business model</p>
                                        </div>
                                    </div>
                                    <br />
                                    <div className="row">
                                        <div className="col-md-2">
                                            {'\u00A0'}
                                        </div>
                                        <div className="col-md-3">
                                            <input className="form-control form-control-last" type="text" placeholder="Name" ref={ref => this.documentName = ref} />
                                        </div>
                                        <div className="col-md-4">
                                            <input className="form-control form-control-last" type="text" placeholder="Link must start with http:// or https://" ref={ref => this.documentLink = ref} />
                                        </div>
                                        <div className="col-md-3">
                                            <button type="button" className="btn btn-secondary btn-pill tiny" onClick={this.browseLocalDocument}>Browse from PC</button>
                                            {'\u00A0'}{'\u00A0'}{'\u00A0'}
                                            <button type="button" className="btn btn-brand btn-pill tiny" onClick={this.addDocument}>Add</button>
                                        </div>
                                    </div>
                                    <br />
                                    <br />
                                    {this.state && this.state.documents && this.state.documents.map((it, i) =>
                                        <div key={'document_' + i} className="row">
                                            <div className="col-md-2">
                                                {'\u00A0'}
                                            </div>
                                            <div className="col-md-3">
                                                <span>{it.name}</span>
                                            </div>
                                            <div className="col-md-4">
                                                {it.link.indexOf('http') !== 0 && <span>{it.link.length > 30 ? it.link.substring(0, 30) + '...' : it.link}</span>}
                                                {it.link.indexOf('http') === 0 && <a href={it.link} target="_blank">{it.link.length > 30 ? it.link.substring(0, 30) + '...' : it.link}</a>}
                                            </div>
                                            <div className="col-md-3">
                                                <h3>
                                                    <a href="javascript:;" onClick={e => this.deleteDocument(i, e)}><i className="fas fa-remove"></i></a>
                                                </h3>
                                            </div>
                                        </div>
                                    )}
                                    <br />
                                    <br />
                                    <div className="row">
                                        <div className="col-md-2">
                                            <h4>URL</h4>
                                            <p className="small">The website of the {this.props.parent ? "Startup" : "Incubator"}</p>
                                        </div>
                                        <div className="col-md-10 form-group">
                                            <input className="form-control form-control-last" type="text" placeholder="Link must start with http:// or https://" ref={ref => (this.url = ref) && (this.url.value = product.url)} />
                                        </div>
                                    </div>
                                    <br />
                                    <div className="row">
                                        <div className="col-md-2">
                                            <h4>Logo</h4>
                                            <p className="small">of the {this.props.parent ? "Startup" : "Incubator"}</p>
                                        </div>
                                        <div className="col-md-10 form-group">
                                            <a href="javascript:;" onClick={this.loadImage}>
                                                <img width="100" height="100" ref={ref => this.image = $(ref)} src={product.image ? ("data:image/png;base64, " + product.image) : ''} />
                                            </a>
                                            {'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}
                                            <a href="javascript:;" onClick={this.deleteImage}><i className="fas fa-remove"></i></a>
                                        </div>
                                    </div>
                                    {this.props.parent && <br />}
                                    {this.props.parent && <div className="row">
                                        <div className="col-md-4">
                                            <h4>Total Supply</h4>
                                            <p className="small">The amount of SEED tokens this Startup needs to raise</p>
                                        </div>
                                        <div className="col-md-8 form-group">
                                            <input className="form-control form-control-last" type="text" ref={ref => (this.startupTotalSupply = ref) && (this.startupTotalSupply.value = Utils.roundWei(product.totalSupply))} onChange={Utils.parseNumber} />
                                        </div>
                                    </div>}
                                    {!this.props.parent && <br />}
                                    {!this.props.parent && <div className="row">
                                        <div className="col-md-2">
                                            <h4>Tags</h4>
                                            <p className="small">useful for searches by the investor</p>
                                        </div>
                                        <div className="col-md-10 form-group">
                                            <input className="form-control form-control-last" type="text" ref={ref => (this.tags = ref) && product.tags && product.tags.length > 0 && (this.tags.value = product.tags.join(' '))} />
                                        </div>
                                    </div>}
                                    {this.props.parent && <br />}
                                    {this.props.parent && <div className="row">
                                        <div className="col-md-4">
                                            <h4>Startup Value</h4>
                                            <p className="small">The extimated value of the startup, expressed in local currency</p>
                                        </div>
                                        <div className="col-md-1 form-group">
                                            <input className="form-control form-control-last" type="text" ref={ref => (this.portfolioValue = ref) && (ref.value = Utils.numberToString(Utils.normalizeBasketSuccessFee(product.portfolioValue || 0), true))} onChange={Utils.parseNumber}/>
                                        </div>
                                        <div className="col-md-1">
                                            <select ref={ref => this.portfolioCurrency = $(ref)}>
                                                <option selected={!product.portfolioCurrency || product.portfolioCurrency === 'EUR'} value="EUR">EUR</option>
                                                <option selected={product.portfolioCurrency && product.portfolioCurrency === 'USD'} value="USD">USD</option>
                                                <option selected={product.portfolioCurrency && product.portfolioCurrency === 'USD'} value="CHF">CHF</option>
                                            </select>
                                        </div>
                                        <div className="col-md-2">
                                            {'\u00A0'}
                                        </div>
                                    </div>}
                                    <br />
                                    <br />
                                    <button type="button" className="btn btn-brand btn-pill btn-elevate browse-btn" onClick={this.saveDoc}>Update</button>
                                    <br />
                                    <br />
                                </form>
                            </div>
                            {!this.props.parent && <div className="tab-pane" id="administration" role="tabpanel">
                                <form className="kt-form" action="">
                                    <h4>Wallet on top</h4>
                                    <p className="small">the wallet that will receive the exchange rate on top</p>
                                    <div className="form-group">
                                        <input className="form-control" type="text" placeholder={product.walletOnTop} ref={this.walletRef} />
                                    </div>
                                    <div className="kt-form__actions">
                                        <button type="button" className="btn btn-brand btn-pill btn-elevate browse-btn" onClick={this.changeWallet}>Change</button>
                                    </div>
                                </form>
                                <br />
                                <br />
                                <br />
                                <form className="kt-form" action="">
                                    <h4>Permissions</h4>
                                    <p className="small">manage the users that can operate with this basket</p>
                                    <div className="form-group">
                                        <br />
                                        <ul className="nav nav-tabs nav-tabs-line nav-tabs-bold nav-tabs-line-3x mb-5" role="tablist">
                                            <li className="nav-item">
                                                <a className="nav-link" data-toggle="tab" role="tab">Funding Manager</a>
                                            </li>
                                            <li className="nav-item">
                                                <a className="nav-link" data-toggle="tab" role="tab">Funding Operator</a>
                                            </li>
                                            <li className="nav-item">
                                                <a className="nav-link" data-toggle="tab" role="tab">Funds Unlock Manager</a>
                                            </li>
                                            <li className="nav-item">
                                                <a className="nav-link" data-toggle="tab" role="tab">Funds Unlock Operator</a>
                                            </li>
                                            <li className="nav-item">
                                                <a className="nav-link" data-toggle="tab" role="tab">White List Manager</a>
                                            </li>
                                            <li className="nav-item">
                                                <a className="nav-link" data-toggle="tab" role="tab">White List Operator</a>
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
                            </div>}
                            {!this.props.parent && <div className="tab-pane" id="whiteList" role="tabpanel">
                                <form className="kt-form" action="">
                                    <div className="row">
                                        <div className="col-md-4">
                                            <h4>Wallet</h4>
                                            <p className="small">of the investor you want to whitelist</p>
                                            <div className="form-group">
                                                <input className="form-control" type="text" placeholder="Address" ref={ref => this.whiteListWallet = ref} onChange={this.newWhitelistAddress}/>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <h4>Amount</h4>
                                            <p className="small">the max amount of SEED tokens that this investor can hold for this basket</p>
                                            <div className="form-group">
                                                <input className="form-control" type="text" placeholder="Amount" ref={ref => this.whiteListAmount = ref} onChange={this.parseWhitelistAmount} />
                                            </div>
                                        </div>
                                        <div className="col-md-2">
                                            <h4>{product.symbol}</h4>
                                            <p className="small">the max amount of {product.symbol} tokens that this investor can hold</p>
                                            <div className="form-group">
                                                <span ref={ref => this.whiteListTokenAmount = ref}>{Utils.roundWei()}</span>
                                            </div>
                                        </div>
                                        <div className="col-md-2">
                                            <div className="kt-form__actions">
                                                <button type="button" className="btn btn-brand btn-pill btn-elevate browse-btn" onClick={this.setSingleWhitelist}>Set</button>
                                            </div>
                                        </div>
                                    </div>
                                </form>
                            </div>}
                            {!this.props.parent && <div className="tab-pane" id="economic-data" role="tabpanel">
                                <form className="kt-form" action="">
                                    <div className="row">
                                        <div className="col-md-4">
                                            <h4>Exchange Rate</h4>
                                            <p className="small">the amount of {product.symbol} tokens the investor will receive for every invested SEED</p>
                                        </div>
                                        <div className="col-md-6 form-group">
                                            <input className="form-control form-control-last" type="text" ref={ref => (this.seedRate = ref) && (this.seedRate.value = Utils.roundWei(product.seedRate))} onChange={Utils.parseNumber} />
                                        </div>
                                        <div className="col-md-2">
                                            <button type="button" className="btn btn-brand btn-pill btn-elevate browse-btn" onClick={this.updateSeedRate}>OK</button>
                                        </div>
                                    </div>
                                    <br />
                                    <div className="row">
                                        <div className="col-md-4">
                                            <h4>Exchange Rate On Top</h4>
                                            <p className="small">the amount of {product.symbol} tokens the incubator will receive for every invested SEED</p>
                                        </div>
                                        <div className="col-md-6 form-group">
                                            <input className="form-control form-control-last" type="text" ref={ref => (this.exchangeRateOnTop = ref) && (this.exchangeRateOnTop.value = Utils.roundWei(product.exchangeRateOnTop))} onChange={Utils.parseNumber} />
                                        </div>
                                        <div className="col-md-2">
                                            <button type="button" className="btn btn-brand btn-pill btn-elevate browse-btn" onClick={this.updateExchangeRate}>OK</button>
                                        </div>
                                    </div>
                                    <br />
                                    <div className="row">
                                        <div className="col-md-4">
                                            <h4>Total Supply</h4>
                                            <p className="small">The amount of SEED tokens this basket needs to raise</p>
                                        </div>
                                        <div className="col-md-6 form-group">
                                            <input className="form-control form-control-last" type="text" ref={ref => (this.totalSupply = ref) && (this.totalSupply.value = Utils.roundWei(product.totalSupply))} onChange={Utils.parseNumber} />
                                        </div>
                                        <div className="col-md-2">
                                            <button type="button" className="btn btn-brand btn-pill btn-elevate browse-btn" onClick={this.updateTotalSupply}>OK</button>
                                        </div>
                                    </div>
                                    <br/>
                                    <div className="row">
                                        <div className="col-md-4">
                                            <h4>White List Threshold Balance</h4>
                                            <p className="small">the maximum amount of {product.symbol} tokens that each investor can accumulate without the need of whitelisting</p>
                                        </div>
                                        <div className="col-md-6 form-group">
                                            <input className="form-control form-control-last" type="text" ref={ref => (this.whiteListThreshold = ref) && (this.whiteListThreshold.value = Utils.roundWei(product.whiteListThreshold))} onChange={Utils.parseNumber} />
                                        </div>
                                        <div className="col-md-2">
                                            <button type="button" className="btn btn-brand btn-pill btn-elevate browse-btn" onClick={this.updateWhiteListThreshold}>OK</button>
                                        </div>
                                    </div>
                                    <br/>
                                    <div className="row">
                                        <div className="col-md-4">
                                            <h4>Success fee percentage</h4>
                                            <p className="small">the percentage of SEED tokens the incubator will obtain from a startup exit</p>
                                        </div>
                                        <div className="col-md-1 form-group">
                                            <input className="form-control form-control-last" type="number" min="0" max="100" ref={ref => (this.basketSuccessFee = ref) && (ref.value = "" + Utils.normalizeBasketSuccessFee(product.basketSuccessFee || 0))}/>
                                        </div>
                                        <div className="col-md-1">
                                            <br/>
                                            <h2>%</h2>
                                        </div>
                                        <div className="col-md-4">
                                            {"\u00A0"}
                                        </div>
                                        <div className="col-md-2">
                                            <button type="button" className="btn btn-brand btn-pill btn-elevate browse-btn" onClick={this.saveDoc}>OK</button>
                                        </div>
                                    </div>
                                </form>
                            </div>}
                            {!this.props.parent && <div className="tab-pane" id="members" role="tabpanel">
                                <button type="button" className="btn btn-brand btn-pill btn-elevate browse-btn" onClick={() => this.emit('page/change', CreateFundingPool, { parent: product, view: 'mine' })}>Add new Startup</button>
                                <br />
                                <br />
                                <Members element={product} view={this.props.view} />
                            </div>}
                        </div>
                    </div>
                </div>
                {client.persistenceManager.get(client.persistenceManager.PERSISTENCE_PROPERTIES.documentsUploaderProviderSet) !== true && <Modal
                    title="Choose the way tou will upload documents"
                    readonly={true}
                    backdrop="static"
                    keyboard="false"
                    ref={ref => (this.documentsUploaderModal = ref) && ref.show()}>
                    <DocumentUploader onClick={() => _this.documentsUploaderModal.hide()} />
                </Modal>}
            </div>
        );
    }
});