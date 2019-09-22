var Choose = React.createClass({
    investor(e) {
        e && e.preventDefault() && e.stopPropagation();
        this.emit('page/change', Products);
    },
    incubator(e) {
        e && e.preventDefault() && e.stopPropagation();
        this.emit('page/change', Products, {view : 'mine'});
    },
    render() {
        return (
            <div className="row">
                <div className="col-md-12">
                    <br/>
                    <br/>
                    <br/>
                    <br/>
                    <div className="row">
                        <div className="col-md-12">
                            <h1>Choose your access Profile</h1>
                        </div>
                    </div>
                    <br/>
                    <br/>
                    <br/>
                    <br/>
                    <div className="row">
                        <div className="col-md-6">
                            <h2 className="first"><button type="button" className="btn btn-pill btn-brand" onClick={this.investor}>Investor</button></h2>
                        </div>
                        <div className="col-md-6">
                            <h2><button type="button" className="btn btn-pill btn-brand-secondary" onClick={this.incubator}>Incubator</button></h2>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});