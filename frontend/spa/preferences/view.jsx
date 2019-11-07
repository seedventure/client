var Preferences = React.createClass({
    requiredModules: [
        'spa/preferences/documentUploader',
        'spa/preferences/networkChooser'
    ],
    title: 'System Preferences',
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
    incubatorChooseRef(ref) {
        if(!ref) {
            return;
        }
        ref.checked = client.persistenceManager.get(client.persistenceManager.PERSISTENCE_PROPERTIES[ref.id]) === true;
    },
    incubatorChoose(e) {
        e && e.preventDefault(true) && e.stopPropagation(true);
        client.persistenceManager.set(client.persistenceManager.PERSISTENCE_PROPERTIES[e.target.id], e.target.checked === true);
    },
    render() {
        return (
            <div className="kt-content kt-grid__item kt-grid__item--fluid">
                <div className="row">
                    <div className="col-xl-12 mt-5">
                        <ul className="nav nav-tabs nav-tabs-line nav-tabs-bold nav-tabs-line-3x mb-5" role="tablist">
                            <li className="nav-item">
                                <a className="nav-link" data-toggle="tab" href="#incubators" role="tab"><i className="far fa-user mr-2"></i>Incubators</a>
                            </li>
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
                            <div className="tab-pane" id="incubators" role="tabpanel">
                                <legend>Incubators</legend>
                                <h3><label><input id="zeroStartups" type="checkbox" onChange={this.incubatorChoose} ref={this.incubatorChooseRef}/> {'\u00A0'} Hide 0-Startups Baskets</label></h3>
                                <h3><label><input id="zeroURL" type="checkbox" onChange={this.incubatorChoose}  ref={this.incubatorChooseRef}/> {'\u00A0'} Hide Baskets without URL</label></h3>
                                <h3><label><input id="zeroDocs" type="checkbox" onChange={this.incubatorChoose}  ref={this.incubatorChooseRef}/> {'\u00A0'} Hide 0-Docs Startups</label></h3>
                            </div>
                            {client.configurationManager.hasUnlockedUser() && <div className="tab-pane" id="documents" role="tabpanel">
                                <DocumentUploader />
                            </div>}
                            <div className="tab-pane" id="blockchain" role="tabpanel">
                                <NetworkChooser/>
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