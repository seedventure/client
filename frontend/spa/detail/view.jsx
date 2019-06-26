var Detail = React.createClass({
    title: "View incubator",
    render() {
        return (
            <div>
                <div className="row">
                    <div className="col-md-6">
                        <p>{this.props.element.description}</p>
                    </div>
                </div>
            </div>
        );
    }
});