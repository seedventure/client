var NetworkChooser = React.createClass({
    changeFactoryAddress(e) {
        e && e.preventDefault && e.preventDefault() && e.stopPropagation && e.stopPropagation();
        var main = $(this.blockchainNetwork).val() === 'mainnet';
        var web3URL = ('wss://' + (main ? 'main' : 'test') + 'net.seedventure.io');
        var etherscanURL = ('https://' + (main ? '' : 'ropsten.') + 'etherscan.io/');
        try {
            web3URL = main ? ecosystemData.mainnetWeb3URL : ecosystemData.testnetWeb3URL;
            etherscanURL = main ? ecosystemData.mainnetEtherscanURL : ecosystemData.testnetEtherscanURL;
        } catch (e) {
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
            typeof e === 'function' && e();
            return;
        }
        var _this = this;
        this.emit('loader/show', 'Switching to new Environment...');
        _this.controller.changeFactoryAddress(web3URL, etherscanURL, factoryAddress).then(_this.showUpdated).then(function() {
            typeof e === 'function' && e();
        });
    },
    showUpdated() {
        this.emit('loader/hide');
        if(this.props.hideButton === "true") {
            return;
        }
        var _this = this;
        setTimeout(() => _this.updateNotification.show());
        setTimeout(() => _this.updateNotification.hide() && _this.emit('page/change'), 1300);
    },
    onNetworkChange(e) {
        e && e.preventDefault() && e.stopPropagation();
        try {
            this.factoryAddress.value = e.target.value === 'mainnet' ? ecosystemData.mainnetFactoryAddress : ecosystemData.testnetFactoryAddress;
        } catch (e) {
        }
    },
    render() {
        return (
            <form className="kt-form" action="">
                <legend>Blockchain Preferences</legend>
                <div className="form-group mb-5">
                    <div className="input-container">
                        <h3>Choose your network:</h3>
                        <select ref={ref => this.blockchainNetwork = ref} onChange={this.onNetworkChange}>
                            <option value="mainnet" selected={client.persistenceManager.get(client.persistenceManager.PERSISTENCE_PROPERTIES.web3URL).indexOf('mainnet') !== -1}>Main Network</option>
                            <option value="testnet" selected={this.props.hideButton === "true" || client.persistenceManager.get(client.persistenceManager.PERSISTENCE_PROPERTIES.web3URL).indexOf('testnet') !== -1}>Test Network (Ropsten)</option>
                        </select>
                    </div>
                </div>
                <div className="form-group mb-5">
                    <div className="input-container">
                        <h3>Main Factory Address:</h3>
                        <input ref={ref => (this.factoryAddress = ref) && (this.factoryAddress.value = (this.props.hideButton === "true" && ecosystemData.testnetFactoryAddress) || client.persistenceManager.get(client.persistenceManager.PERSISTENCE_PROPERTIES.factoryAddress))} type="text" className="form-control form-control-last" placeholder="New Factory Address" />
                    </div>
                </div>
                {this.props.hideButton !== "true" && <div className="form-group mb-5">
                    <div>
                        <button className="btn btn-brand btn-pill btn-elevate browse-btn" onClick={this.changeFactoryAddress}>Change</button>{"\u00A0"}{"\u00A0"}{"\u00A0"}<span ref={ref => (this.updateNotification = $(ref)).hide()}>Changes Updated</span>
                    </div>
                </div>}
            </form>
        );
    }
});