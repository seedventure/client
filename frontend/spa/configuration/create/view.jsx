var CreateConfiguration = React.createClass({
    title : 'Create New Wallet',
    getInitialState() {
        return {words : ["burro", "pancrazio", "ginopaoli", "testo", "camera", "interruttore", "casalinga", "biglietto", "suono"]};
    },
    toWords(e) {
        e && e.preventDefault();
        var state = this.getInitialState();
        state.wordsOK = false;
        state.passwordsOK = false;
        this.setState(state);
    },
    toCheck(e) {
        e && e.preventDefault();
        var state = this.getInitialState();
        state.wordsOK = true;
        state.passwordsOK = false;
        this.setState(state);
    },
    toPasswords(e) {
        e && e.preventDefault();
        var words = this.textarea.value.split(' ');
        if(words.length !== this.state.words.length) {
            alert('Please, insert the words in the correct order');
            return;
        }
        for(var i = 0; i < words.length; i++) {
            if(words[i] !== this.state.words[i]) {
                alert('Please, insert the words in the correct order');
                return;
            }
        }
        var state = this.getInitialState();
        state.wordsOK = true;
        state.passwordsOK = true;
        this.setState(state);
    },
    check(e) {
        e && e.preventDefault();
        var pass = this.password.value;
        var repeat = this.repeatPassword.value;
        if(pass === '' || pass !== repeat) {
            alert("Password don't match");
            return;
        }
        this.controller.saveWallet(this.state.words, pass);
        this.emit('page/change');
    },
    renderWords() {
        return (
            <div>
                <div className="row">
                    <div className="col-md-12"><h2>Please, copy these words and <b>DON'T FORGET THEM!</b></h2></div>
                </div>
                <div className="row">
                    <div className="col-md-12">
                        <p className="words">{this.state.words.join(' ')}</p>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-12">
                        <button className="btn" onClick={this.toCheck}>OK</button>
                    </div>
                </div>
            </div>
        );
    },
    renderCheck() {
        return (
            <div>
                <div className="row">
                    <div className="col-md-12"><h2>Please, repeat the order of the words</h2></div>
                </div>
                <div className="row">
                    <div className="col-md-12">
                        <textarea ref={ref => this.textarea = ref} className="words"></textarea>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-12">
                        <button className="btn" onClick={this.toWords}>Back</button>
                        <button className="btn" onClick={this.toPasswords}>Check</button>
                    </div>
                </div>
            </div>
        );
    },
    renderPasswords() {
        return (
            <div>
                <div className="row">
                    <div className="col-md-12"><h2>Please, insert a password and confirm</h2></div>
                </div>
                <div className="row">
                    <div className="col-md-12">
                        <input type="password" ref={ref => this.password = ref}></input>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-12">
                        <input type="password" ref={ref => this.repeatPassword = ref}></input>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-12">
                        <button className="btn" onClick={this.toCheck}>Back</button>
                        <button className="btn" onClick={this.check}>Check</button>
                    </div>
                </div>
            </div>
        );
    },
    render() {
        return (
            <div>
                {!this.state.wordsOK && this.renderWords()}
                {this.state.wordsOK && !this.state.passwordsOK && this.renderCheck()}
                {this.state.wordsOK && this.state.passwordsOK && this.renderPasswords()}
            </div>
        );
    }
});