var Detail = React.createClass({
    componentDidMount() {
        this.emit('index/title', this.props.element.name);
    },
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