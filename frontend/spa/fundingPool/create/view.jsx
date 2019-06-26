var CreateFundingPool = React.createClass({
    requiredScripts: [
        "assets/plugins/summernote/summernote.min.js",
        "assets/plugins/summernote/summernote.css"
    ],
    title: "Create new Basket",
    deploy(e) {
        e && e.preventDefault();
        var image = '';
        try {
            image = this.image.attr('src').split("data:image/png;base64, ").join('');
        } catch(error) {
        }
        var name = ''
        try {
            name = this.name.value.split(' ').join('');
        } catch(error) {
        }
        if(name === '') {
            alert('Please insert the name of the new basket');
            return;
        }

        var url = ''
        try {
            url = this.url.value.split(' ').join('').toLowerCase();
        } catch(error) {
        }
        if(url !== '') {
            if(url.indexOf('http://') !== 0 && url.indexOf('https://') !== 0) {
                alert('URL must start with http:// or https://');
                return;
            }
            if(!url.match(this.controller.urlRegex)) {
                alert('Wrong URL');
                return;
            }
        }

        var symbol = ''
        try {
            symbol = this.symbol.value.split(' ').join('');
        } catch(error) {
        }
        if(symbol === '') {
            alert('Symbol is mandatory');
            return;
        }

        var seedRate = 0;
        try {
            seedRate = parseInt(this.seedRate.value.split(' ').join(''));
        } catch(error) {
        }
        if(isNaN(seedRate) || seedRate < 0) {
            alert('SEED Rate is a mandatory positive number or zero');
            return;
        }

        var exangeRate = 0;
        try {
            exangeRate = parseInt(this.exangeRate.value.split(' ').join(''));
        } catch(error) {
        }
        if(isNaN(exangeRate) || exangeRate < 0) {
            alert('Exchange Rate is a mandatory positive number or zero');
            return;
        }

        var exchangeRateDecimals = 0;
        try {
            exchangeRateDecimals = parseInt(this.exchangeRateDecimals.value.split(' ').join(''));
        } catch(error) {
        }
        if(isNaN(exchangeRateDecimals) || exangeRate < 0) {
            alert('Exchange Rate decimals is a mandatory positive number or zero');
            return;
        }

        var totalSupply = 0;
        try {
            totalSupply = parseInt(this.totalSupply.value.split(' ').join(''));
        } catch(error) {
        }
        if(isNaN(totalSupply) || totalSupply < 0) {
            alert('Total Supply is a mandatory positive number or zero');
            return;
        }
        var data = {
            name,
            description: $.base64.encode(this.description.summernote('code')),
            url,
            image,
            symbol,
            seedRate,
            exangeRate,
            exchangeRateDecimals,
            totalSupply
        };
        this.controller.deploy(data);
    },
    loadImage(e) {
        e && e.preventDefault();
        var userChosenPath = require('electron').remote.dialog.showOpenDialog({
            defaultPath: require('electron').remote.app.getPath("desktop"),
            filters: [
                {
                    name: "Image logo",
                    extensions: ["png", "jpg", "jpeg", "bmp"]
                }
            ]
        });
        if (userChosenPath) {
            var file = require('electron').remote.require('fs').readFileSync(userChosenPath[0]).toString('base64');
            file = "data:image/png;base64, " + file;
            this.image.attr('src', file);
        }
    },
    render() {
        return (
            <form className="kt-form" action="#">
                <div className="row">
                    <div className="col-md-2">
                        <h4>Name</h4>
                    </div>
                    <div className="col-md-10 form-group">
                        <input className="form-control form-control-last" type="text" ref={ref => this.name = ref} />
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-2">
                        <h4>Description</h4>
                    </div>
                    <div className="col-md-10 editor">
                        <div ref={ref => ref && (this.description = $(ref)).summernote({ minHeight: 350, disableResizeEditor: true })} />
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-2">
                        <h4>URL</h4>
                    </div>
                    <div className="col-md-10 form-group">
                        <input className="form-control form-control-last" type="text" ref={ref => this.url = ref} />
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-2">
                        <h4>Logo</h4>
                    </div>
                    <div className="col-md-10 form-group">
                        <a href="javascript:;" onClick={this.loadImage}>
                            <img width="100" height="100" ref={ref => this.image = $(ref)} />
                        </a>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-2">
                        <h4>Symbol</h4>
                    </div>
                    <div className="col-md-10 form-group">
                        <input className="form-control form-control-last" type="TEXT" ref={ref => this.symbol = ref} />
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-2">
                        <h4>SEED Rate</h4>
                    </div>
                    <div className="col-md-10 form-group">
                        <input className="form-control form-control-last" type="number" ref={ref => this.seedRate = ref} />
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-2">
                        <h4>Exchange Rate</h4>
                    </div>
                    <div className="col-md-10 form-group">
                        <input className="form-control form-control-last" type="number" ref={ref => this.exangeRate = ref} />
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-2">
                        <h4>Exchange Rate Decimals</h4>
                    </div>
                    <div className="col-md-10 form-group">
                        <input className="form-control form-control-last" type="number" ref={ref => this.exchangeRateDecimals = ref} />
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-2">
                        <h4>Total Supply</h4>
                    </div>
                    <div className="col-md-10 form-group">
                        <input className="form-control form-control-last" type="number" ref={ref => this.totalSupply = ref} />
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-2">
                        <button type="button" className="btn btn-secondary btn-pill" onClick={this.deploy}>DEPLOY</button>
                    </div>
                    <div className="col-md-10 form-group">
                    </div>
                </div>
            </form>
        );
    }
});