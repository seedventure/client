var Unlock = React.createClass({
    unlock(e) {
        e && e.preventDefault();
        var password = this.password.value;
        if (password === '') {
            alert("Please, insert password");
            return;
        }
        !this.controller.tryUnlock(password) && alert("Password is wrong");
    },
    askForget(e) {
        e && e.preventDefault();
        this.emit('user/askForget');
    },
    render() {
        return (
            <div className="kt-grid kt-grid--hor kt-grid--root kt-login kt-login--v6 kt-login--signin" id="kt_login">
                <div className="kt-grid__item kt-grid__item--fluid kt-grid kt-grid--desktop kt-grid--ver-desktop kt-grid--hor-tablet-and-mobile">
                    <div className="kt-grid__item  kt-grid__item--order-tablet-and-mobile-2  kt-grid kt-grid--hor kt-login__aside">
                        <div className="kt-login__wrapper">
                            <div className="kt-login__container">
                                <div className="kt-login__body">
                                    <div className="kt-login__signin">
                                        <div className="kt-login__head">
                                            <br/>
                                            <img src="./assets/favicon.png" width="100" height="100"></img>
                                            <br/>
                                            <br/>
                                            <h3 className="kt-login__title">Please, type you password to unlock your account</h3>
                                        </div>
                                        <div className="kt-login__form">
                                            <form className="kt-form" action="">
                                                <div className="form-group">
                                                    <input className="form-control form-control-last" type="password" placeholder="Password" name="password" ref={ref => this.password = ref} />
                                                </div>
                                                <div className="kt-login__actions">
                                                    <button id="kt_login_signin_submit" className="btn btn-brand btn-pill btn-elevate" onClick={this.unlock}>Unlock</button>
                                                    <button className="btn btn-secondary btn-pill" onClick={this.askForget}>Forget</button>
                                                </div>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="welcome-page kt-grid__item kt-grid__item--fluid kt-grid__item--center kt-grid kt-grid--ver kt-login__content">
                        <div className="kt-login__section">
                            <div className="kt-login__block">
                                <h3 className="kt-login__title">Welcome to SEEDVenture</h3>
                                <br/>
                                <img src="./assets/favicon.png" width="100" height="100"></img>
                                <br/>
                                <div className="kt-login__desc">
                                    The first decentralized
                                    <br/>
                                    venture capital investment platform
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});