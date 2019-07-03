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
                button.props.onClick = action.onClick.bind(this);
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
    setTitle(title, titleLangId) {
        this.setState({title, titleLangId});
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
        var modalTitle = <h4 className="modal-title">{(this.state && this.state.title) || this.props.title}</h4>
        if((this.state && this.state.titleLangId) || this.props.titleLangId) {
            modalTitle.props['data-lang-id'] = (this.state && this.state.titleLangId) || this.props.titleLangId
        }
        var readonly = this.props.readonly === true || this.props.readonly === 'true';
        var modal = (
            <div className="modal fade" tabindex="-1" data-backdrop={this.props.backdrop} data-keyboard={this.props.keyboard}>
                <div className="modal-header">
                    {readonly !== true &&<button type="button" className="close" data-dismiss="modal" aria-hidden="true"></button>}
                    {modalTitle}
                </div>
                <div className="modal-body">
                    {this.props.children}
                </div>
                <div className="modal-footer">
                    {readonly !== true && <button type="button" data-dismiss="modal" className="btn btn-undo" data-lang-id="close">Close</button>}
                    {readonly !== true && this.renderActions()}
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