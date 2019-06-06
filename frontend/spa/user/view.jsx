var User = React.createClass({
    requiredModules: [
        'spa/configuration/import',
        'spa/configuration/create',
        'spa/configuration/backup',
        'spa/configuration/move'
    ],
    getDefaultSubscriptions() {
        return {
            'user/askForget': this.askForget
        };
    },
    importConfiguration(e) {
        e.preventDefault();
        this.emit('page/change', ImportConfiguration);
    },
    createConfiguration(e) {
        e.preventDefault();
        this.emit('page/change', CreateConfiguration);
    },
    backupConfiguration(e) {
        e.preventDefault();
        this.emit('page/change', BackupConfiguration);
    },
    moveConfiguration(e) {
        e.preventDefault();
        this.emit('page/change', MoveConfiguration);
    },
    askForget(e) {
        e && e.preventDefault && e.preventDefault();
        if(confirm('All your data will be lost, do you want to continue?')) {
            this.controller.forgetUser();
            this.emit('page/change');
        }
    },
    renderUserWallet() {
        return [
            <a href="#" onClick={() => this.emit('wallet/show')}> {client.userManager.user.wallet.substring(0,9)}... </a>,
            <a href="javascript:;" onClick={this.backupConfiguration}>Backup my configuration</a>,
            <a href="javascript:;" onClick={this.moveConfiguration}>, move it</a>,
            <span> or </span>,
            <a href="javascript:;" onClick={this.askForget}>Forget me</a>
        ];;
    },
    render() {
        return (
            <div>
                <h4>
                    Welcome
                    {client.userManager.user && this.renderUserWallet()}
                    {!client.configurationManager.hasUser() && !client.configurationManager.hasUnlockedUser() && [
                        <span> guest, </span>,
                        <a href="javascript:;" onClick={this.importConfiguration}>import your configuration</a>,
                        <span> or </span>,
                        <a href="javascript:;" onClick={this.createConfiguration}>create a new one</a>
                    ]}
                </h4>
            </div>
        );
    }
});