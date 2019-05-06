var ImportConfiguration = React.createClass({
    title : 'Import Configuration',
    importMnemonic(e) {
        e && e.preventDefault();
        if(this.mnemonic.value === '') {
            alert("Insert Mnemocim Phrase");
            return;
        }
        if(!this.checkPassword(this.mnemonicPassword.value, this.mnemonicRetype.value)) {
            return;
        }
        client.userManager.save(this.mnemonic.value, this.mnemonicPassword.value);
        this.emit('page/change');
    },
    importPrivateKey(e) {
        e && e.preventDefault();
        if(this.privateKey.value === '') {
            alert("Insert Private Key");
            return;
        }
        if(!this.checkPassword(this.privateKeyPassword.value, this.privateKeyRetype.value)) {
            return;
        }
        this.emit('page/change');
    },
    browseJSONFile(e) {
        e && e.preventDefault();
        var userChosenPath = window.require('electron').remote.dialog.showOpenDialog({ 
            defaultPath: window.require('electron').remote.app.getPath("desktop"),
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
        e && e.preventDefault();
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
        e && e.preventDefault();
        client.configurationManager.import() && this.emit('page/change');
    },
    render() {
        return (
            <div>
                <div className="row section">
                    <div className="row">
                        <div className="col-md-6">
                            Import your SEEDVenture Backup
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-6">
                            <button className="btn" onClick={this.browserSEEDBackupFile}>Browse...</button>
                        </div>
                    </div>
                </div>

                <div className="row section">
                    <div className="row">
                        <div className="col-md-6">
                            Insert your mnemonic phrase:
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-6">
                            <textarea ref={ref => this.mnemonic = ref}></textarea>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-6">
                            Type your password:
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-6">
                            <input type="password" ref={ref => this.mnemonicPassword = ref}></input>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-6">
                            <input type="password" ref={ref => this.mnemonicRetype = ref}></input>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-6">
                            <button className="btn" onClick={this.importMnemonic}>Import</button>
                        </div>
                    </div>
                </div>

                <div className="row section">
                    <div className="row">
                        <div className="col-md-6">
                            Insert your private key:
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-6">
                            <input ref={ref => this.privateKey = ref}></input>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-6">
                            Type your password:
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-6">
                            <input type="password" ref={ref => this.privateKeyPassword = ref}></input>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-6">
                            <input type="password" ref={ref => this.privateKeyRetype = ref}></input>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-6">
                            <button className="btn" onClick={this.importPrivateKey}>Import</button>
                        </div>
                    </div>
                </div>

                <div className="row section">
                    <div className="row">
                        <div className="col-md-6">
                            Insert your JSON File:
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-6">
                            <button className="btn" onClick={this.browseJSONFile}>Browse...</button>
                        </div>
                        <div className="col-md-6">
                            <span>{this.state && this.state.JSONFile}</span>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-6">
                            Type your password:
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-6">
                            <input type="password" ref={ref => this.JSONPassword = ref}></input>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-6">
                            <input type="password" ref={ref => this.JSONRetype = ref}></input>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col-md-6">
                            <button className="btn" onClick={this.importJSON}>Import</button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});