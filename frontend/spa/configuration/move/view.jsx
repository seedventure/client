var MoveConfiguration = React.createClass({
    title : "Move your data",
    ok(e) {
        e && e.preventDefault();
        var pass = this.password.value;
        if(pass === undefined || pass === null || pass === '') {
            alert('Please, insert password');
            return;
        }
        try {
            client.configurationManager.move(pass);
            this.emit('page/change');
        } catch(e) {
            alert('Password is wrong');
        }
    },
    render() {
        return (
            <form className="kt-form" action="">
                <br/>
                <div>
                    <h2>Insert your password to proceed</h2>
                </div>
                <br/>
                <div className="form-group">
                    <input className="form-control form-control-last" type="password" placeholder="Password" name="password" ref={ref => this.password = ref} />
                </div>
                <button className="btn btn-brand btn-pill btn-elevate" onClick={this.ok}>OK</button>
            </form>
        );
    }
});