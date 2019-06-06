var Product = React.createClass({
    requiredModules : [
        'spa/detail'
    ],
    onClick(e) {
        e.preventDefault();
        this.emit((this.props.type ? this.props.type : 'page') + '/change', Detail, {element : this.props.element});
    },
    render() {
        return (
            <div onClick={this.onClick}>
                <div className="row">
                    <div className="col-md-12">
                        Name: {this.props.element.name}
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-12">
                        Incubator: {this.props.element.incubator}
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-12">
                        Description: {this.props.element.description}
                    </div>
                </div>
                <div className="row">
                    <div className="col-md-12">
                        Latest Quotation: {this.props.element.value} SEED
                    </div>
                </div>
            </div>
        );
    }
});