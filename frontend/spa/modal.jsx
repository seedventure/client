var Modal = React.createClass({
    requiredScripts : [
        'assets/plugins/bootstrap-modal/css/bootstrap-modal-bs3patch.css',
        'assets/plugins/bootstrap-modal/css/bootstrap-modal.css',
        'assets/plugins/bootstrap-modal/js/bootstrap-modalmanager.js',
        'assets/plugins/bootstrap-modal/js/bootstrap-modal.js'
    ],
    renderActions() {
        var actions = [];
        if(this.props.actions === undefined || this.props.actions === null || this.props.actions.length === 0)  {
            return actions;
        }
        for(var i in this.props.actions) {
            var action = this.props.actions[i];
            var button = (<button type="button" ref={action.ref} className="btn btn-action">{action.text}</button>);
            if(action.className) {
                button.props.className += (' ' + action.className);
            }
            if(action.langId) {
                button.props['data-lang-id'] = action.langId;
            }
            if(action.onClick) {
                button.props.onClick = action.onClick;
            }
            if(action.props) {
                for(var z in action.props) {
                    button.props[z] = action.props[z]
                }
            }
            actions.push(button);
        }
        return actions;
    },
    close() {
        this.hide()
    },
    hide() {
        this.domRoot.modal('hide')
    },
    show() {
        this.domRoot.modal('show')
    },
    toggle() {
        this.domRoot.modal('toggle')
    },
    isVisible() {
        return this.domRoot.hasClass('in')
    },
    isHidden() {
        return !this.isVisible()
    },
    componentDidUpdate() {
        if(window.onModalShow === undefined) {
            window.onModalShow = function onModalShow() {
                var reactComponent = $(this).findReactComponent();
                reactComponent && reactComponent.props.onShow && reactComponent.props.onShow()
            }
            $(document).on('shown.bs.modal', 'div.modal', window.onModalShow);
        }
        if(window.onModalHide === undefined) {
            window.onModalHide = function onModalHide() {
                var reactComponent = $(this).findReactComponent();
                reactComponent && reactComponent.props.onHide && reactComponent.props.onHide()
            }
            $(document).on('hide.bs.modal', 'div.modal', window.onModalHide);
        }
    },
    componentDidMount() {
        this.componentDidUpdate();
    },
    render() {
        if(!($.fn.modal)) {
            return <span style={{'display' : 'none'}}></span>
        }
        var title = (<span>{this.props.title}</span>);
        if(this.props.titleLangId) {
            title.props['data-lang-id'] = this.props.titleLangId
        }
        var modal = (
            <div className="modal fade" tabindex="-1" data-backdrop={this.props.backdrop} data-keyboard={this.props.keyboard}>
                <div className="modal-header">
                    <button type="button" className="close" data-dismiss="modal" aria-hidden="true"></button>
                    <h4 className="modal-title">{title}</h4>
                </div>
                <div className="modal-body">
                    {this.props.children}
                </div>
                <div className="modal-footer">
                    {this.props.readonly !== true && <button type="button" data-dismiss="modal" className="btn btn-undo" data-lang-id="close">Close</button>}
                    {this.props.readonly !== true && this.renderActions()}
                </div>
            </div>
        );
        if(this.props.id) {
            modal.props.id = this.props.id
        }
        if(this.props.focusOn) {
            modal.props['data-focus-on'] = this.props.focusOn
        }
        if(this.props.className) {
            modal.props.className += ' ' + this.props.className
        }
        return modal;
    }
});