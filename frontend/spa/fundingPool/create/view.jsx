var CreateFundingPool = React.createClass({
    deploy(e) {
        e && e.preventDefault();
        var image = this.image.attr('src');
        !image && (image = '')
        var data = {
            name : this.name.value,
            description : this.description.value,
            url : this.url.value,
            symbol : this.symbol.value,
            seedRate : this.seedRate.value,
            exangeRate : this.exangeRate.value,
            exchangeRateDecimals : this.exchangeRateDecimals.value,
            totalSupply : this.totalSupply.value,
            image : image.split("data:image/png;base64, ").join('')
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
                extensions: ["png","jpg","jpeg","bmp"]
              }
            ]
          });
          if(userChosenPath) {
              var file = require('electron').remote.require('fs').readFileSync(userChosenPath[0]).toString('base64');
              file = "data:image/png;base64, " + file;
              this.image.attr('src', file);
          }
    },
    render() {
        return (
            <div>
                <h2>Create Basket</h2>
                <div className="row">
                    <div className="col-md-6">
                        <h4>Name</h4>
                    </div>
                    <div className="col-md-6">
                        <input type="text" ref={ref => this.name = ref}/>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-6">
                        <h4>Description</h4>
                    </div>
                    <div className="col-md-6">
                        <input type="text" ref={ref => this.description = ref}/>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-6">
                        <h4>URL</h4>
                    </div>
                    <div className="col-md-6">
                        <input type="text" ref={ref => this.url = ref}/>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-6">
                        <h4>Logo</h4>
                    </div>
                    <div className="col-md-6">
                        <button type="button" className="btn" onClick={this.loadImage}>Load</button>
                        <image type="text" width="100" height="100" ref={ref => this.image = $(ref)}/>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-6">
                        <h4>Symbol</h4>
                    </div>
                    <div className="col-md-6">
                        <input type="text" ref={ref => this.symbol = ref}/>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-6">
                        <h4>SEED Rate</h4>
                    </div>
                    <div className="col-md-6">
                        <input type="text" ref={ref => this.seedRate = ref}/>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-6">
                        <h4>Exchange Rate</h4>
                    </div>
                    <div className="col-md-6">
                        <input type="text" ref={ref => this.exangeRate = ref}/>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-6">
                        <h4>Exchange Rate Decimals</h4>
                    </div>
                    <div className="col-md-6">
                        <input type="text" ref={ref => this.exchangeRateDecimals = ref}/>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-6">
                        <h4>Total Supply</h4>
                    </div>
                    <div className="col-md-6">
                        <input type="text" ref={ref => this.totalSupply = ref}/>
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-6">
                    </div>
                    <div className="col-md-6">
                        <button type="button" className="btn" onClick={this.deploy}>DEPLOY</button>
                    </div>
                </div>
            </div>
        );
    }
});