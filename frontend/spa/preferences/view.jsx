var Preferences = React.createClass({
    requiredModules: [
        'spa/preferences/documentUploader'
    ],
    title: 'System Preferences',
    changeFactoryAddress(e) {
        e && e.preventDefault() && e.stopPropagation();
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
        var _this = this;
        _this.controller.changeFactoryAddress(factoryAddress).then(_this.showUpdated);
    },
    showUpdated() {
        var _this = this;
        setTimeout(() => _this.updateNotification.show());
        setTimeout(() => _this.updateNotification.hide(), 2000);
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
                        </ul>
                        <div className="tab-content">
                            {client.configurationManager.hasUnlockedUser() && <div className="tab-pane" id="documents" role="tabpanel">
                                <DocumentUploader/>
                            </div>}
                            <div className="tab-pane" id="blockchain" role="tabpanel">
                                <form className="kt-form" action="">
                                    <legend>Blockchain Preferences</legend>
                                    <div className="form-group mb-5">
                                        <div className="input-container">
                                            <input ref={ref => (this.factoryAddress = ref) && (this.factoryAddress.value = client.persistenceManager.get(client.persistenceManager.PERSISTENCE_PROPERTIES.factoryAddress))} type="text" className="form-control form-control-last" placeholder="New Factory Address" />
                                        </div>
                                        <button className="btn btn-brand btn-pill btn-elevate browse-btn" onClick={this.changeFactoryAddress}>Change Factory Address</button>{"\u00A0"}{"\u00A0"}{"\u00A0"}<span ref={ref => (this.updateNotification = $(ref)).hide()}>Changes Updated</span>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});