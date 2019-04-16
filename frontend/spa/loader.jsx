var Loader = React.createClass({
    show() {
        this.domRoot.removeClass('hidden');
    },
    hide() {
        this.domRoot.addClass('hidden');
    },
    toggle() {
        this.domRoot.toggleClass('hidden');
    },
    render() {
        return (
            <div className={(this.props.className ? this.props.className + " " : "") + "loaded" + (this.props.overlay && this.props.overlay.toString() === 'true' ? " overlay" : "") + (this.props.hidden && this.props.hidden.toString() === 'true' ? " hidden" : "")}>
                <div ref={ref => this.loaderContainer = $(ref)} className={'loaderContainer ' + (this.props.size ? this.props.size : 'x1')}>
                    <svg className="circular" viewBox="25 25 50 50">
                        <circle className="path" cx="50" cy="50" r="20" fill="none" stroke-width="1" stroke-miterlimit="10" />
                    </svg>
                </div>
            </div>
        );
    }
});