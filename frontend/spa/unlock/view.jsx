var Unlock = React.createClass({
    unlock(e) {
        e && e.preventDefault();
        var password = this.password.value;
        if(password === '') {
            alert("Please, insert password");
        }
        if(!this.controller.tryUnlock(password)) {
            alert("Password is wrong");
            return;
        }
    },
    askForget(e) {
        e && e.preventDefault();
        this.emit('user/askForget');
    },
    render() {
        return (
            <div>
                <div className="row">
                    <div className="col-md-12"><h2>Please, type your password to unlock your account</h2></div>
                </div>
                <div className="row">
                    <div className="col-md-12">
                        <input type="password" ref={ref => this.password = ref}></input>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-12">
                        <button className="btn" onClick={this.unlock}>Unlock</button>
                        <button className="btn" onClick={this.askForget}>Forget</button>
                    </div>
                </div>
            </div>
        );
    }
});