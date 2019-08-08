var ImportConfiguration = React.createClass({
    title: 'Import Configuration or Wallet',
    importMnemonic(e) {
        e && e.preventDefault() && e.stopPropagation();
        if(this.mnemonic.value === '') {
            alert("Insert Mnemocim Phrase");
            return;
        }
        if(!this.checkPassword(this.mnemonicPassword.value, this.mnemonicRetype.value)) {
            return;
        }
        client.userManager.fromMnemonic(this.mnemonic.value, this.mnemonicPassword.value);
        this.emit('page/change');
    },
    importPrivateKey(e) {
        e && e.preventDefault() && e.stopPropagation();
        if(this.privateKey.value === '') {
            alert("Insert Private Key");
            return;
        }
        if(!this.checkPassword(this.privateKeyPassword.value, this.privateKeyRetype.value)) {
            return;
        }
        client.userManager.fromPrivateKey(this.privateKey.value, this.privateKeyPassword.value);
        this.emit('page/change');
    },
    browseJSONFile(e) {
        e && e.preventDefault() && e.stopPropagation();
        var userChosenPath = window.require('electron').remote.dialog.showOpenDialog({ 
            defaultPath: undefined,
            filters : [
              {
                name : "JSON File",
                extensions : ["json"]
              }
            ],
            options : {
                openDirectory : false,
                multiSelections : false
            }
        });
        if(userChosenPath === undefined || userChosenPath === null) {
            return;
        }
        this.setState({JSONFile : userChosenPath});
    },
    importJSON(e) {
        e && e.preventDefault() && e.stopPropagation();
        if(!this.state || this.state.JSONFile === '') {
            alert("Select a valid JSON File first");
            return;
        }
        if(!this.checkPassword(this.JSONPassword.value, this.JSONRetype.value)) {
            return;
        }
        this.emit('page/change');
    },
    checkPassword(password, repeat) {
        if(password === undefined || password === null || password === '') {
            alert('Please, insert password');
            return false;
        }
        if(password !== repeat) {
            alert("Password don't match");
            return false;
        }
        return true;
    },
    browserSEEDBackupFile(e) {
        e && e.preventDefault() && e.stopPropagation();
        client.configurationManager.import() && this.emit('page/change');
    },
    componentDidMount() {
        var _this = this;
        $(_this.domRoot.children().find('a.nav-link').click(function() {
            _this.domRoot.children().find('a.nav-link').removeClass('active');
            $(this).addClass('active'); 
        })[0]).click();
    },
    /*
    <li className="nav-item">
        <a className="nav-link" data-toggle="tab" href="#json" role="tab"><i className="far fa-file-alt mr-2"></i>JSON File</a>
    </li>*/
    render() {
        return (
            <div className="kt-content kt-grid__item kt-grid__item--fluid">
                <div className="row">
                    <div className="col-xl-12 mt-5">
                        <ul className="nav nav-tabs nav-tabs-line nav-tabs-bold nav-tabs-line-3x mb-5" role="tablist">
                            <li className="nav-item">
                                <a className="nav-link" data-toggle="tab" href="#backup" role="tab"><i className="far fa-hdd mr-2"></i>Backup</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" data-toggle="tab" href="#phrase" role="tab"><i className="far fa-comment-dots mr-2"></i>Mnemonic phrase</a>
                            </li>
                            <li className="nav-item">
                                <a className="nav-link" data-toggle="tab" href="#key" role="tab"><i className="fas fa-key mr-2"></i>Private key</a>
                            </li>
                        </ul>
                        <div className="tab-content">
                            <div className="tab-pane active" id="backup" role="tabpanel">
                                    <legend>Import you SEEDVenture backup</legend>
                                    <div className="form-group mb-5">
                                        <div className="input-container">
                                            <input type="file" id="real-input" className="form-control form-control-last" />
                                            <span className="file-info">File...</span>
                                        </div>
                                        <button className="btn btn-brand btn-pill btn-elevate browse-btn" onClick={this.browserSEEDBackupFile}>Browse...</button>
                                </div>
                            </div>
                            <div className="tab-pane" id="phrase" role="tabpanel">
                                <form className="kt-form" action="">
                                    <legend>Insert your mnemonic phrase and password</legend>
                                    <div className="form-group mb-5">
                                        <textarea className="form-control form-control-last" ref={ref => this.mnemonic = ref}></textarea>
                                    </div>
                                    <div className="form-group mb-5">
                                        <input className="form-control form-control-last" type="password" placeholder="Type your password" name="password" ref={ref => this.mnemonicPassword = ref}/>
                                    </div>
                                    <div className="form-group mb-5">
                                        <input className="form-control form-control-last" type="password" placeholder="Confirm password" name="password" ref={ref => this.mnemonicRetype = ref}/>
                                    </div>
                                    <button className="btn btn-brand btn-pill btn-elevate browse-btn" onClick={this.importMnemonic}>Import</button>
                                </form>
                            </div>
                            <div className="tab-pane" id="key" role="tabpanel">
                                <form className="kt-form" action="">
                                    <legend>Insert your private key and password</legend>
                                    <div className="form-group mt-5 mb-5">
                                        <input className="form-control form-control-last" type="password" placeholder="Private key" name="password" ref={ref => this.privateKey = ref}/>
                                    </div>
                                    <div className="form-group mb-5">
                                        <input className="form-control form-control-last" type="password" placeholder="Type your password" name="password" ref={ref => this.privateKeyPassword = ref}/>
                                    </div>
                                    <div className="form-group mb-5">
                                        <input className="form-control form-control-last" type="password" placeholder="Confirm password" name="password" ref={ref => this.privateKeyRetype = ref}/>
                                    </div>
                                    <button className="btn btn-brand btn-pill btn-elevate browse-btn" onClick={this.importPrivateKey}>Import</button>
                                </form>
                            </div>
                            <div className="tab-pane" id="json" role="tabpanel">
                                <form className="kt-form" action="">
                                    <legend>Import your JSON file and type password</legend>
                                    <div className="input-container">
                                        <input type="file" id="real-input" className="form-control form-control-last" />
                                        <span className="file-info">{this.state && this.state.JSONFile ? this.state.JSONFile : "File..."}</span>
                                    </div>
                                    <button className="btn btn-brand btn-pill btn-elevate browse-btn" onClick={this.browseJSONFile}>Browse...</button>
                                    <div className="form-group my-5">
                                        <input className="form-control form-control-last" type="password" placeholder="Type your password" name="password" ref={ref => this.JSONPassword = ref}/>
                                    </div>
                                    <div className="form-group mb-5">
                                        <input className="form-control form-control-last" type="password" placeholder="Confirm password" name="password" ref={ref => this.JSONRetype = ref}/>
                                    </div>
                                    <button className="btn btn-brand btn-pill btn-elevate browse-btn" onClick={this.importJSON}>Import</button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});