var Preferences = React.createClass({
    title: 'System Preferences',
    changeFactoryAddress(e) {
        e && e.preventDefault();
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
        if (factoryAddress.toLowerCase() === client.persistenceManager.get(client.persistenceManager.PERSISTENCE_PROPERTIES.factoryAddress).toLowerCase()) {
            return;
        }
        this.controller.changeFactoryAddress(factoryAddress);
    },
    render() {
        return (
            <div className="kt-content kt-grid__item kt-grid__item--fluid">
                <div className="row">
                    <div className="col-xl-12 mt-5">
                        <ul className="nav nav-tabs nav-tabs-line nav-tabs-bold nav-tabs-line-3x mb-5" role="tablist">
                            <li className="nav-item">
                                <a className="nav-link" data-toggle="tab" href="#blockchain" role="tab"><i className="far fa-hdd mr-2"></i>Blockchain</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" data-toggle="tab" href="#documents" role="tab"><i className="far fa-hdd mr-2"></i>Documents location</a>
                            </li>
                        </ul>
                        <div className="tab-content">
                            <div className="tab-pane active" id="blockchain" role="tabpanel">
                                <form className="kt-form" action="">
                                    <legend>Blockchain Preferences</legend>
                                    <div className="form-group mb-5">
                                        <div className="input-container">
                                            <input ref={ref => (this.factoryAddress = ref) && (this.factoryAddress.value = client.persistenceManager.get(client.persistenceManager.PERSISTENCE_PROPERTIES.factoryAddress))} type="text" className="form-control form-control-last" placeholder="New Factory Address" />
                                        </div>
                                        <button className="btn btn-brand btn-pill btn-elevate browse-btn" onClick={this.changeFactoryAddress}>Change Factory Address</button>
                                    </div>
                                </form>
                            </div>
                            <div className="tab-pane" id="documents" role="tabpanel">
                                <form className="kt-form" action="">
                                    <legend>Documents Location Preferences</legend>
                                    <div className="form-group mb-5">
                                        <select>
                                            <option value="ipfs">IPFS</option>
                                            <option value="custom">CUSTOM</option>
                                        </select>
                                    </div>
                                    {false && <div className="form-group mb-5">
                                        <input className="form-control form-control-last" type="password" placeholder="Type your password" name="password" ref={ref => this.mnemonicPassword = ref} />
                                    </div>}
                                    {false && <div className="form-group mb-5">
                                        <input className="form-control form-control-last" type="password" placeholder="Confirm password" name="password" ref={ref => this.mnemonicRetype = ref} />
                                    </div>}
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});