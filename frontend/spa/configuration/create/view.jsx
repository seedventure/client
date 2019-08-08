var CreateConfiguration = React.createClass({
    title: 'Create New Wallet',
    getInitialState() {
        return { words: ethers.utils.HDNode.entropyToMnemonic(ethers.utils.randomBytes(16)).split(' ') };
    },
    resetWords(e) {
        e && e.preventDefault() && e.stopPropagation();
        var state = this.state;
        state.words = ethers.utils.HDNode.entropyToMnemonic(ethers.utils.randomBytes(16)).split(' ')
        state.wordsOK = false;
        state.passwordsOK = false;
        this.setState(state);
    },
    toWords(e) {
        e && e.preventDefault() && e.stopPropagation();
        var state = this.state;
        state.wordsOK = false;
        state.passwordsOK = false;
        this.setState(state);
    },
    toCheck(e) {
        e && e.preventDefault() && e.stopPropagation();
        var state = this.state;
        state.wordsOK = true;
        state.passwordsOK = false;
        this.setState(state);
    },
    toPasswords(e) {
        e && e.preventDefault() && e.stopPropagation();
        var words = this.textarea.value.split(' ');
        if (words.length !== this.state.words.length) {
            alert('Please, insert the words in the correct order');
            return;
        }
        for (var i = 0; i < words.length; i++) {
            if (words[i] !== this.state.words[i]) {
                alert('Please, insert the words in the correct order');
                return;
            }
        }
        var state = this.state;
        state.wordsOK = true;
        state.passwordsOK = true;
        this.setState(state);
    },
    check(e) {
        e && e.preventDefault() && e.stopPropagation();
        var pass = this.password.value;
        var repeat = this.repeatPassword.value;
        if (pass === '' || pass !== repeat) {
            alert("Password don't match");
            return;
        }
        this.controller.saveWallet(this.state.words, pass);
        this.emit('page/change');
    },
    renderWords() {
        return (
            <div className="kt-grid__item kt-grid__item--fluid kt-grid kt-grid--ver kt-grid--stretch">
                <div className="kt-container kt-body kt-grid kt-grid--ver" id="kt_body">
                    <div className="kt-grid__item kt-grid__item--fluid kt-grid kt-grid--hor">
                        <div className="kt-content kt-grid__item kt-grid__item--fluid">
                            <div className="row">
                                <div className="col-xl-12 mt-5">
                                    <form className="kt-form" action="">
                                        <legend className="mb-3">Please, copy these words and <strong className="text-primary">don’t forget them</strong></legend>
                                        <div className="form-group mb-5">
                                            <h1 className="dontCopy">{this.state.words.join(' ')}</h1>
                                        </div>
                                        <div className="kt-login__actions">
                                            <button className="btn btn-action btn-pill btn-elevate" onClick={this.resetWords}><i className="fas fa-sync-alt text-primary mr-2"></i>Regenerate</button>
                                            {'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}
                                            <button id="kt_login_signin_submit" className="btn btn-brand btn-pill btn-elevate" onClick={this.toCheck}>Next Step</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>);
    },
    renderCheck() {
        return (<div className="kt-grid__item kt-grid__item--fluid kt-grid kt-grid--ver kt-grid--stretch">
            <div className="kt-container kt-body kt-grid kt-grid--ver" id="kt_body">
                <div className="kt-grid__item kt-grid__item--fluid kt-grid kt-grid--hor">
                    <div className="kt-content kt-grid__item kt-grid__item--fluid">
                        <div className="row">
                            <div className="col-xl-12 mt-5">
                                <form className="kt-form" action="">
                                    <legend className="mb-3">Please, repeat the order of the words</legend>
                                    <div className="form-group mb-5">
                                        <textarea className="form-control form-control-last" ref={ref => this.textarea = ref}></textarea>
                                    </div>
                                    <div className="kt-login__actions">
                                        <button className="btn btn-secondary btn-pill btn-elevate" onClick={this.toWords}>Back</button>
                                        {'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}
                                        <button id="kt_login_signin_submit" className="btn btn-brand btn-pill btn-elevate" onClick={this.toPasswords}>Check</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>);
    },
    renderPasswords() {
        return (
            <div className="kt-grid__item kt-grid__item--fluid kt-grid kt-grid--ver kt-grid--stretch">
                <div className="kt-container kt-body kt-grid kt-grid--ver" id="kt_body">
                    <div className="kt-grid__item kt-grid__item--fluid kt-grid kt-grid--hor">
                        <div className="kt-content kt-grid__item kt-grid__item--fluid">
                            <div className="row">
                                <div className="col-xl-12 mt-5">
                                    <form className="kt-form" action="">
                                        <legend className="mb-5">Please, insert a password and confirm</legend>
                                        <div className="form-group mb-5">
                                            <input className="form-control form-control-last" type="password" placeholder="Type your password" name="password" ref={ref => this.password = ref}/>
                                        </div>
                                        <div className="form-group mb-5">
                                            <input className="form-control form-control-last" type="password" placeholder="Confirm password" name="password" ref={ref => this.repeatPassword = ref}/>
                                        </div>
                                        <div className="kt-login__actions">
                                            <button className="btn btn-secondary btn-pill btn-elevate" onClick={this.toCheck}>Back</button>
                                            {'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}{'\u00A0'}
                                            <button id="kt_login_signin_submit" className="btn btn-brand btn-pill btn-elevate" onClick={this.check}>Check</button>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    },
    render() {
        return (
            <span>
                <p>{'\u00A0'}</p>
                <p>{'\u00A0'}</p>
                <div className="steps kt-grid__item align-center justify-center text-center">
                    <ul className="list-unstyled list-inline">
                        <li className="list-inline-item current" aria-disabled="false" aria-selected="true">
                            <span className="number">copy</span>
                        </li>
                        <li className={"list-inline-item" + (this.state.wordsOK ? " current" : "")} aria-disabled="false">
                            <span className="number">repeat</span>
                        </li>
                        <li className={"list-inline-item" + (this.state.wordsOK && this.state.passwordsOK ? " current" : "")} aria-disabled="false">
                            <span className="number">confirm</span>
                        </li>
                    </ul>
                </div>
                {!this.state.wordsOK && this.renderWords()}
                {this.state.wordsOK && !this.state.passwordsOK && this.renderCheck()}
                {this.state.wordsOK && this.state.passwordsOK && this.renderPasswords()}
            </span>
        );
    }
});