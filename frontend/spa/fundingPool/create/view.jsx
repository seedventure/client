var CreateFundingPool = React.createClass({
    requiredModules: [
        'spa/preferences/documentUploader'
    ],
    requiredScripts: [
        "assets/plugins/summernote/summernote.min.js",
        "assets/plugins/summernote/summernote.css"
    ],
    getTitle() {
        return (this.props.parent ? <span>Create new Startup for the Basket <strong>{this.props.parent.name}</strong></span> : "Create Basket");
    },
    back(e) {
        e && e.preventDefault() && e.stopPropagation();
        var _this = this;
        var parent = _this.props.parent;
        this.emit('page/change', !parent ? Products : this.props.view === 'mine' ? EditFundingPool : Detail, { element: parent, parent: null, fromBack: true, view: this.props.view }, () => parent && _this.setProduct(parent));
    },
    setProduct(product) {
        var _this = this;
        this.setState({ product }, function () {
            _this.forceUpdate();
            setTimeout(() => _this.setState({ product }));
        });
    },
    deploy(e) {
        e && e.preventDefault() && e.stopPropagation();
        var image = '';
        try {
            image = this.image.attr('src').split("data:image/png;base64, ").join('');
        } catch (error) {
        }
        var name = ''
        try {
            name = this.name.value.trim();
        } catch (error) {
        }
        if (name === '') {
            var alertMessage = 'Please insert the name of the new ';
            var element = this.props.parent ? "Startup" : "Basket";
            alert(alertMessage + element);
            return;
        }

        var sticker = '';
        try {
            sticker = this.sticker.attr('src').split("data:image/png;base64, ").join('');
        } catch (error) {
        }

        var stickerUrl = ''
        try {
            stickerUrl = this.stickerUrl.value.split(' ').join('').toLowerCase();
        } catch (error) {
        }
        if (stickerUrl !== '') {
            if (stickerUrl.indexOf('http://') !== 0 && stickerUrl.indexOf('https://') !== 0) {
                alert('Verufucator URL must start with http:// or https://');
                return;
            }
            if (!stickerUrl.match(this.controller.urlRegex)) {
                alert('Wrong Verificator URL');
                return;
            }
        }

        if((sticker === '' && stickerUrl !== '') || (sticker !== '' && stickerUrl === '')) {
            return alert("If you specify Verificator you must insert logo and url");
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

        var symbol = ''
        try {
            symbol = this.symbol.value.split(' ').join('');
        } catch (error) {
        }
        if (!this.props.parent && symbol === '') {
            alert('Symbol is mandatory');
            return;
        }
        if (!this.props.parent && symbol.length > Utils.tokenSymbolLimit) {
            return alert('Symbol must be almost of ' + Utils.tokenSymbolLimit + ' characters long');
        }

        var seedRate = 0;
        try {
            seedRate = Utils.cleanNumber(this.seedRate);
        } catch (error) {
        }
        if (!this.props.parent && (isNaN(seedRate) || seedRate < 0)) {
            alert('SEED Rate is a mandatory positive number or zero');
            return;
        }

        var exchangeRateOnTop = 0;
        try {
            exchangeRateOnTop = Utils.cleanNumber(this.exchangeRateOnTop);
        } catch (error) {
        }
        if (!this.props.parent && (isNaN(exchangeRateOnTop) || exchangeRateOnTop < 0)) {
            alert('Exchange Rate is a mandatory positive number or zero');
            return;
        }

        var whiteListThreshold = 0;
        try {
            whiteListThreshold = Utils.cleanNumber(this.whiteListThreshold);
        } catch (error) {
        }
        if (!this.props.parent && (isNaN(whiteListThreshold) || exchangeRateOnTop < 0)) {
            alert('WhiteList Threshold Balance is a mandatory positive number or zero');
            return;
        }

        var totalSupply = 0;
        try {
            totalSupply = Utils.cleanNumber(this.totalSupply);
        } catch (error) {
        }
        if (!this.props.parent && (isNaN(totalSupply) || totalSupply < 0)) {
            alert('Total Supply is a mandatory positive number or zero');
            return;
        }

        var basketSuccessFee = 0;
        try {
            basketSuccessFee = parseFloat(parseFloat(this.basketSuccessFee.value).toFixed(2));
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

        var walletAddress = '';
        try {
            walletAddress = this.walletAddress.value.split(' ').join('');
        } catch (error) {
        }
        if (this.props.parent && !Utils.isEthereumAddress(walletAddress)) {
            alert('Wallet address is mandatory');
            return;
        }
        var data = {
            name,
            sticker,
            stickerUrl,
            description: $.base64.encode(encodeURI(this.description.summernote('code'))),
            url,
            image,
            tags,
            documents: (this.state && this.state.documents) || [],
            symbol,
            seedRate,
            exchangeRateOnTop,
            whiteListThreshold,
            totalSupply,
            basketSuccessFee,
            portfolioValue,
            portfolioCurrency,
            walletAddress
        };
        var type = this.props.parent ? 'Member' : 'Basket';
        this.controller['deploy' + type](data, this.props.parent);
    },
    loadImage(e) {
        e && e.preventDefault() && e.stopPropagation();
        var _image = $(e.target);
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
            _image.attr('src', file);
        }
    },
    deleteImage(e) {
        e && e.preventDefault() && e.stopPropagation();
        $(e.target).parent().parent().children().find('img').removeAttr('src');
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
    
    onSymbolChange(e) {
        e && e.preventDefault() && e.stopPropagation();
        var _this = this;
        var target = e.target;
        this.symbolTimeout && clearTimeout(this.symbolTimeout);
        this.symbolTimeout = setTimeout(function() {
            try {
                _this.domRoot.children().find('.basketName').html(target.value || 'basket');
            } catch(e) {
            }
        }, 450);
    },
    render() {
        var _this = this;
        return (
            <form className="kt-form" action="#">
                {this.props.parent && <br />}
                {this.props.parent && <br />}
                <div className="row">
                    <div className="col-md-2">
                        <h4>Name</h4>
                        <p className="small">of the {(this.props.parent && "Startup") || "Incubator"}</p>
                    </div>
                    <div className="col-md-10 form-group">
                        <input className="form-control form-control-last" type="text" ref={ref => this.name = ref} />
                    </div>
                </div>
                {!this.props.parent && <br/>}
                {!this.props.parent && <div className="row">
                    <div className="col-md-2">
                        <h4>Verificator</h4>
                        <p className="small">of the Incubator</p>
                    </div>
                    <div className="col-md-5 form-group">
                        <input className="form-control form-control-last" type="text" placeholder="Link must start with http:// or https://..."  ref={ref => this.stickerUrl = ref}/>
                    </div>
                    <div className="col-md-5 form-group">
                        <a href="javascript:;" onClick={this.loadImage}>
                            <img width="100" height="100" ref={ref => this.sticker = $(ref)} />
                        </a>
                         {'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}
                        <a href="javascript:;" onClick={this.deleteImage}><i className="fas fa-remove"></i></a>
                    </div>
                </div>}
                <br/>
                <div className="row">
                    <div className="col-md-2">
                        <h4>Description</h4>
                        <p className="small">of the {(this.props.parent && "Startup") || "Incubator"}</p>
                    </div>
                    <div className="col-md-10 editor">
                        <div ref={ref => ref && (this.description = $(ref)).summernote({ minHeight: 350, disableResizeEditor: true })} />
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
                        {'\u00A0'}
                    </div>
                    <div className="col-md-2">
                        <input className="form-control form-control-last" type="text" placeholder="Name" ref={ref => this.documentName = ref} />
                    </div>
                    <div className="col-md-3">
                        <input className="form-control form-control-last" type="text" placeholder="Link must start with http:// or https://..." ref={ref => this.documentLink = ref} />
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
                        <div className="col-md-4">
                            {'\u00A0'}
                        </div>
                        <div className="col-md-2">
                            <span>{it.name}</span>
                        </div>
                        <div className="col-md-3">
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
                    <div className="col-md-4">
                        <h4>URL</h4>
                        <p className="small">The website of the {this.props.parent ? "Startup" : "Incubator"}</p>
                    </div>
                    <div className="col-md-8 form-group">
                        <input className="form-control form-control-last" type="text" placeholder="Link must start with http:// or https://" ref={ref => this.url = ref} />
                    </div>
                </div>
                <br/>
                <div className="row">
                    <div className="col-md-4">
                        <h4>Logo</h4>
                        <p className="small">of the {this.props.parent ? "Startup" : "Incubator"}</p>
                    </div>
                    <div className="col-md-8 form-group">
                        <a href="javascript:;" onClick={this.loadImage}>
                            <img width="100" height="100" ref={ref => this.image = $(ref)} />
                        </a>
                         {'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}
                        <a href="javascript:;" onClick={this.deleteImage}><i className="fas fa-remove"></i></a>
                    </div>
                </div>
                {!this.props.parent && <br/>}
                {!this.props.parent && <div className="row">
                    <div className="col-md-4">
                        <h4>Tags</h4>
                        <p className="small">useful for searches by the investor</p>
                    </div>
                    <div className="col-md-8 form-group">
                        <input className="form-control form-control-last" type="text" ref={ref => this.tags = ref} />
                    </div>
                </div>}
                {!this.props.parent && <br/>}
                {!this.props.parent && <div className="row">
                    <div className="col-md-4">
                        <h4>Symbol</h4>
                        <p className="small">of the new token you will mint</p>
                    </div>
                    <div className="col-md-8 form-group">
                        <input className="form-control form-control-last" type="text" ref={ref => this.symbol = ref} onChange={this.onSymbolChange}/>
                    </div>
                </div>}
                {!this.props.parent && <br/>}
                {!this.props.parent && <div className="row">
                    <div className="col-md-4">
                        <h4>Exchange Rate</h4>
                        <p className="small">the amount of <strong className="basketName">basket</strong> tokens the investor will receive for every invested SEED</p>
                    </div>
                    <div className="col-md-8 form-group">
                        <input className="form-control form-control-last" type="text" ref={ref => this.seedRate = ref} onChange={Utils.parseNumber}/>
                    </div>
                </div>}
                {!this.props.parent && <br/>}
                {!this.props.parent && <div className="row">
                    <div className="col-md-4">
                        <h4>Exchange Rate on top</h4>
                        <p className="small">the amount of <strong className="basketName">basket</strong> tokens the incubator will receive for every invested SEED</p>
                    </div>
                    <div className="col-md-8 form-group">
                        <input className="form-control form-control-last" type="text" ref={ref => this.exchangeRateOnTop = ref} onChange={Utils.parseNumber}/>
                    </div>
                </div>}
                <br/>
                <div className="row">
                    <div className="col-md-4">
                        <h4>Total Supply</h4>
                        <p className="small">{"The amount of SEED tokens this " + (this.props.parent ? "Startup" : "Basket") + " needs to raise"}</p>
                    </div>
                    <div className="col-md-8 form-group">
                        <input className="form-control form-control-last" type="text" ref={ref => this.totalSupply = ref} onChange={Utils.parseNumber}/>
                    </div>
                </div>
                {!this.props.parent && <br/>}
                {!this.props.parent && <div className="row">
                    <div className="col-md-4">
                        <h4>Whitelist Threshold Balance</h4>
                        <p className="small">the maximum amount of <strong className="basketName">basket</strong> tokens that each investor can accumulate without the need of whitelisting</p>
                    </div>
                    <div className="col-md-8 form-group">
                        <input className="form-control form-control-last" type="text" ref={ref => this.whiteListThreshold = ref} onChange={Utils.parseNumber}/>
                    </div>
                </div>}
                {!this.props.parent && <br/>}
                {!this.props.parent && <div className="row">
                    <div className="col-md-4">
                        <h4>Success fee percentage</h4>
                        <p className="small">the percentage of capital the incubator will retain from a startup's exit</p>
                    </div>
                    <div className="col-md-1 form-group">
                        <input className="form-control form-control-last" type="number" min="0" max="100" ref={ref => this.basketSuccessFee = ref}/>
                    </div>
                    <div className="col-md-6">
                        <br/>
                        <h2>%</h2>
                    </div>
                </div>}
                {this.props.parent && <br/>}
                {this.props.parent && <div className="row">
                    <div className="col-md-4">
                        <h4>Portfolio Value</h4>
                        <p className="small">The extimated value of the Startup, expressed in local currency</p>
                    </div>
                    <div className="col-md-4 form-group">
                        <input className="form-control form-control-last" type="text" ref={ref => (this.portfolioValue = ref) && (ref.value = Utils.normalizeBasketSuccessFee(0.0))} onChange={Utils.parseNumber}/>
                    </div>
                    <div className="col-md-4">
                        <select ref={ref => this.portfolioCurrency = $(ref)}>
                            <option selected={true} value="EUR">EUR</option>
                            <option value="USD">USD</option>
                            <option value="CHF">CHF</option>
                        </select>
                    </div>
                </div>}
                {this.props.parent && <br/>}
                {this.props.parent && <div className="row">
                    <div className="col-md-4">
                        <h4>Wallet Address</h4>
                        <p className="small">The one used by the Startup to raise the unlocked funds</p>
                    </div>
                    <div className="col-md-8 form-group">
                        <input className="form-control form-control-last" type="address" ref={ref => this.walletAddress = ref} />
                    </div>
                </div>}
                <br/>
                <div className="row">
                    <div className="col-md-12">
                        <button type="button" className="btn btn-brand btn-pill" onClick={this.deploy}>DEPLOY</button>
                    </div>
                </div>
                <br />
                <br />
                {client.persistenceManager.get(client.persistenceManager.PERSISTENCE_PROPERTIES.documentsUploaderProviderSet) !== true && <Modal
                  title="Choose the way tou will upload documents"
                  readonly={true}
                  backdrop="static"
                  keyboard="false"
                  ref={ref => (this.documentsUploaderModal = ref) && ref.show()}>
                    <DocumentUploader onClick={() => _this.documentsUploaderModal.hide()}/>
                </Modal>}
            </form>
        );
    }
});