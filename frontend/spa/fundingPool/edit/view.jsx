var EditFundingPool = React.createClass({
    requiredModules: [
        'spa/members'
    ],
    requiredScripts: [
        "assets/plugins/summernote/summernote.min.js",
        "assets/plugins/summernote/summernote.css"
    ],
    getTitle() {
        if (!this.props.parent) {
            return "Edit Basket";
        }
        return (
            <div key={this.props.parent.name} className="kt-subheader__breadcrumbs">
                <h3 className="kt-subheader__title"><a href="javascript:;" className="kt-subheader__breadcrumbs-home" onClick={this.back}><i className="fas fa-arrow-left"></i></a></h3>
                <span className="kt-subheader__separator"></span>
                <h3 className="kt-subheader__title">Edit Startup of <strong>{this.props.parent.name}</strong></h3>
            </div>
        );
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
    back(e) {
        e && e.preventDefault();
        var _this = this;
        var parent = _this.props.parent;
        this.emit((this.props.type || 'page') + '/change', this.props.view === 'mine' ? EditFundingPool : Detail, { element: parent, parent: null, fromBack: true, type: this.props.type, view: this.props.view }, () => _this.setProduct(parent));
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
            description: $.base64.encode(this.description.summernote('code')),
            url,
            image,
            tags,
            documents: (this.state && this.state.documents) || []
        };
        var thisProduct = this.getProduct();
        var oldProduct = {
            name: thisProduct.name,
            description: thisProduct.description,
            url: thisProduct.url,
            tags: thisProduct.tags,
            documents: thisProduct.documents
        }
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
        if(this.props.parent || !this.progressBar) {
            return;
        }
        var product = this.getProduct();
        var totalSupply = parseInt(product.totalSupply);
        isNaN(totalSupply) && (totalSupply = 0);
        var totalRaised = parseInt(product.totalRaised);
        isNaN(totalRaised) && (totalRaised = 0);
        var percentage = parseFloat(((totalRaised / totalSupply) * 100).toFixed(2));
        totalRaised = Utils.roundWei(totalRaised);
        totalSupply = Utils.roundWei(totalSupply);
        this.progressBar.attr('aria-valuenow', percentage).css('width', percentage + '%').css('color', percentage > 6 ? "white" : "black").html(totalRaised + ' of ' + totalSupply + ' SEEDs raised');
    },
    componentDidMount() {
        this.updateGui();
        this.setState({ documents: this.getProduct().documents });
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
    addDocument(e) {
        e && e.preventDefault();
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
        e && e.preventDefault();
        var userChosenPath = undefined;
        (userChosenPath = window.require('electron').remote.dialog.showOpenDialog({
            defaultPath: window.require('electron').remote.app.getPath("desktop"),
            options: {
                openDirectory: false,
                multiSelections: false
            }
        }));
        userChosenPath && (this.documentLink.value = userChosenPath);
    },
    deleteDocument(i, e) {
        e && e.preventDefault();
        var documents = this.state.documents;
        var doc = documents[i];
        documents.splice(i, 1);
        var _this = this;
        this.setState({ documents }, function () {
            _this.documentName.value = doc.name;
            _this.documentLink.value = doc.link;
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
                                        <div className="col-md-4">
                                            <input className="form-control form-control-last" type="text" placeholder="Name" ref={ref => this.documentName = ref} />
                                        </div>
                                        <div className="col-md-4">
                                            <input className="form-control form-control-last" type="text" placeholder="Link" ref={ref => this.documentLink = ref} />
                                        </div>
                                        <div className="col-md-2">
                                            <button type="button" className="btn btn-secondary btn-pill tiny" onClick={this.browseLocalDocument}>Browse from your pc</button>
                                        </div>
                                        <div className="col-md-2">
                                            <button type="button" className="btn btn-brand btn-pill tiny" onClick={this.addDocument}>Add</button>
                                        </div>
                                    </div>
                                    <br />
                                    <br />
                                    {this.state && this.state.documents && this.state.documents.map((it, i) =>
                                        <div key={'document_' + i} className="row">
                                            <div className="col-md-2">
                                            </div>
                                            <div className="col-md-4">
                                                <span>{it.name}</span>
                                            </div>
                                            <div className="col-md-4">
                                                {it.link.indexOf('http') !== 0 && <span>{it.link}</span>}
                                                {it.link.indexOf('http') === 0 && <a href={it.link} target="_blank">{it.link}</a>}
                                            </div>
                                            <div className="col-md-2">
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
                                            <input className="form-control form-control-last" type="text" ref={ref => (this.url = ref) && (this.url.value = product.url)} />
                                        </div>
                                    </div>
                                    <br/>
                                    <div className="row">
                                        <div className="col-md-2">
                                            <h4>Logo</h4>
                                            <p className="small">of the {this.props.parent ? "Startup" : "Incubator"}</p>
                                        </div>
                                        <div className="col-md-10 form-group">
                                            <a href="javascript:;" onClick={this.loadImage}>
                                                <img width="100" height="100" ref={ref => this.image = $(ref)} src={product.image ? ("data:image/png;base64, " + product.image) : ''} />
                                            </a>
                                        </div>
                                    </div>
                                    {!this.props.parent && <br/>}
                                    {!this.props.parent && <div className="row">
                                        <div className="col-md-2">
                                            <h4>Tags</h4>
                                            <p className="small">useful for searches by the investor</p>
                                        </div>
                                        <div className="col-md-10 form-group">
                                            <input className="form-control form-control-last" type="text" ref={ref => (this.tags = ref) && product.tags && product.tags.length > 0 && (this.tags.value = product.tags.join(' '))} />
                                        </div>
                                    </div>}
                                    <button type="button" className="btn btn-brand btn-pill btn-elevate browse-btn" onClick={this.saveDoc}>Update</button>
                                </form>
                            </div>
                            {!this.props.parent && <div className="tab-pane" id="administration" role="tabpanel">
                                <form className="kt-form" action="">
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
                            {!this.props.parent && <div className="tab-pane" id="economic-data" role="tabpanel">
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
                            </div>}
                            {!this.props.parent && <div className="tab-pane" id="members" role="tabpanel">
                                <button type="button" className="btn btn-brand btn-pill btn-elevate browse-btn" onClick={() => this.emit('section/change', CreateFundingPool, { parent: product, type: 'section', view: 'mine' })}>Add new Startup</button>
                                <br />
                                <br />
                                <Members element={product} view={this.props.view} type={this.props.type} />
                            </div>}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});