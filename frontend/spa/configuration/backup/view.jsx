var BackupConfiguration = React.createClass({
    componentDidMount() {
        this.emit('index/title', 'Backup your data');
    },
    ok(e) {
        e && e.preventDefault();
        var pass = this.password.value;
        if(pass === undefined || pass === null || pass === '') {
            alert('Please, insert password');
            return;
        }
        client.configurationManager.dump(pass);
        this.emit('page/change');
    },
    render() {
        return (
            <div>
                <div className="row">
                    <div className="col-md-4">
                        Insert your password
                    </div>
                    <div className="col-md-4">
                        <input type="password" ref={ref => this.password = ref}></input>
                    </div>
                    <div className="col-md-4">
                        <button className="btn" onClick={this.ok}>OK</button>
                    </div>
                </div>
            </div>
        );
    }
});