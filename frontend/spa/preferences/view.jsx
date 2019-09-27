var Preferences = React.createClass({
    requiredModules: [
        'spa/preferences/documentUploader'
    ],
    title: 'System Preferences',
    changeFactoryAddress(e) {
        e && e.preventDefault() && e.stopPropagation();
        var main = $(this.blockchainNetwork).val() === 'mainnet';
        var web3URL = ('wss://' + (main ? 'main' : 'test') + 'net.seedventure.io');
        var etherscanURL = ('https://' + (main ? '' : 'ropsten.') + 'etherscan.io/');
        try {
            web3URL = main ? ecosystemData.mainnetWeb3URL : ecosystemData.testnetWeb3URL;
            etherscanURL = main ? ecosystemData.mainnetEtherscanURL : ecosystemData.testnetEtherscanURL;
        } catch(e) {
        }
        var factoryAddress = this.factoryAddress.value;
        factoryAddress = factoryAddress.split(' ').join('');
        if (factoryAddress === '') {
            alert('You must provide a new Factory Address');
            return;
        }
        if (!Utils.isEthereumAddress(factoryAddress)) {
            alert('You must provide a valid ethereum address');
            return;
        }
        if (web3URL.toLowerCase() === client.persistenceManager.get(client.persistenceManager.PERSISTENCE_PROPERTIES.web3URL).toLowerCase() && factoryAddress.toLowerCase() === client.persistenceManager.get(client.persistenceManager.PERSISTENCE_PROPERTIES.factoryAddress).toLowerCase()) {
            return;
        }
        var _this = this;
        this.emit('loader/show', 'Switching to new Environment...');
        _this.controller.changeFactoryAddress(web3URL, etherscanURL, factoryAddress).then(_this.showUpdated);
    },
    showUpdated() {
        this.emit('loader/hide');
        var _this = this;
        setTimeout(() => _this.updateNotification.show());
        setTimeout(() => _this.updateNotification.hide() && _this.emit('page/change'), 1300);
    },
    componentDidMount() {
        this.updateNavLinks();
    },
    updateNavLinks() {
        this.domRoot.children().find('.active').removeClass('active');
        this.domRoot.children().find('a.nav-link').click(function () {
            $($(this).parents('.nav-tabs')).children().find('a.nav-link').removeClass('active');
            $(this).addClass('active');
        });
        this.domRoot.children().find('ul.nav-tabs').children('li.nav-item:first-of-type').children('a.nav-link').click();
        var all = client.persistenceManager.get(client.persistenceManager.PERSISTENCE_PROPERTIES.notifyAll) === true;
        this.domRoot.children().find('input[name="all"][value="' + all + '"]').prop('checked', true);
    },
    notificationSettingsChanged(e) {
        e && e.preventDefault() && e.stopPropagation();
        var _this = this;
        _this.domRoot.children().find('input[name="all"]').prop('checked', false);
        var _last = $(e.target).prop('checked', true);
        client.persistenceManager.set(client.persistenceManager.PERSISTENCE_PROPERTIES.notifyAll, e.target.value === 'true');
        setTimeout(function () {
            _this.domRoot.children().find('input[name="all"]').prop('checked', false);
            _last.prop('checked', true);
        });
    },
    onNetworkChange(e) {
        e && e.preventDefault() && e.stopPropagation();
        var main = e.target.value === 'mainnet';
        try {
            this.factoryAddress.value = e.target.value === 'mainnet' ? ecosystemData.mainnetFactoryAddress : ecosystemData.testnetFactoryAddress;
        } catch(e) {
        }
    },
    render() {
        return (
            <div className="kt-content kt-grid__item kt-grid__item--fluid">
                <div className="row">
                    <div className="col-xl-12 mt-5">
                        <ul className="nav nav-tabs nav-tabs-line nav-tabs-bold nav-tabs-line-3x mb-5" role="tablist">
                            {client.configurationManager.hasUnlockedUser() && <li className="nav-item">
                                <a className="nav-link" data-toggle="tab" href="#documents" role="tab"><i className="far fa-hdd mr-2"></i>Documents Uploader</a>
                            </li>}
                            <li className="nav-item">
                                <a className="nav-link" data-toggle="tab" href="#blockchain" role="tab"><i className="far fa-ethereum mr-2"></i>Blockchain</a>
                            </li>
                            {client.configurationManager.hasUnlockedUser() && <li className="nav-item">
                                <a className="nav-link" data-toggle="tab" href="#notifications" role="tab"><i className="far fa-bell mr-2"></i>Notifications</a>
                            </li>}
                        </ul>
                        <div className="tab-content">
                            {client.configurationManager.hasUnlockedUser() && <div className="tab-pane" id="documents" role="tabpanel">
                                <DocumentUploader />
                            </div>}
                            <div className="tab-pane" id="blockchain" role="tabpanel">
                                <form className="kt-form" action="">
                                    <legend>Blockchain Preferences</legend>
                                    <div className="form-group mb-5">
                                        <div className="input-container">
                                            <h3>Choose your network:</h3>
                                            <select ref={ref => this.blockchainNetwork = ref} onChange={this.onNetworkChange}>
                                                <option value="mainnet" selected={client.persistenceManager.get(client.persistenceManager.PERSISTENCE_PROPERTIES.web3URL).indexOf('mainnet') !== -1}>Main Network</option>
                                                <option value="testnet" selected={client.persistenceManager.get(client.persistenceManager.PERSISTENCE_PROPERTIES.web3URL).indexOf('testnet') !== -1}>Test Network (Ropsten)</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="form-group mb-5">
                                        <div className="input-container">
                                            <h3>Main Factory Address:</h3>
                                            <input ref={ref => (this.factoryAddress = ref) && (this.factoryAddress.value = client.persistenceManager.get(client.persistenceManager.PERSISTENCE_PROPERTIES.factoryAddress))} type="text" className="form-control form-control-last" placeholder="New Factory Address" />
                                        </div>
                                    </div>
                                    <div className="form-group mb-5">
                                        <div>
                                            <button className="btn btn-brand btn-pill btn-elevate browse-btn" onClick={this.changeFactoryAddress}>Change</button>{"\u00A0"}{"\u00A0"}{"\u00A0"}<span ref={ref => (this.updateNotification = $(ref)).hide()}>Changes Updated</span>
                                        </div>
                                    </div>
                                </form>
                            </div>
                            <div className="tab-pane" id="notifications" role="tabpanel">
                                <legend>Receive Notifications</legend>
                                <h3><label><input name="all" type="radio" value="true" onChange={this.notificationSettingsChanged} /> {'\u00A0'} For every incubator</label></h3>
                                <h3><label><input name="all" type="radio" value="false" onChange={this.notificationSettingsChanged} /> {'\u00A0'} Just for incubators I starred or I've invested in</label></h3>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});