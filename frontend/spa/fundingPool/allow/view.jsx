var AllowFundingPool = React.createClass({
    title: "Allow Basket Factory to spend SEEDS for you",
    getDefaultSubscriptions() {
        return {
            'allowance/increased': () => this.controller.refreshAllowance(),
        };
    },
    componentDidMount() {
        this.controller.refreshAllowance();
    },
    updateAllowance(e) {
        e && e.preventDefault();
        var allowance = 0;
        try {
            allowance = parseFloat(this.allowance.value);
        } catch(e) {}
        if(isNaN(allowance) || allowance < 1) {
            alert("Allowance must be greater than 0");
            return;
        }
        this.controller.updateAllowance(allowance);
    },
    render() {
        return (
            <form className="kt-form" action="">
                <br/>
                <div className="row">
                    <div className="col-md-12">
                        <h4>Your current allowance: <strong>{(this.state && Utils.roundWei(this.state.allowance)) || 0} SEED</strong></h4>
                    </div>
                </div>
                <br/>
                <div className="row">
                    <div className="col-md-12 form-group">
                        <input className="form-control form-control-last" type="number" placeholder="Increase value" ref={ref => this.allowance = ref} />
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-12">
                        <button type="button" className="btn btn-brand btn-pill btn-elevate browse-btn" onClick={this.updateAllowance}>Submit</button>
                    </div>
                </div>
            </form>
        );
    }
});